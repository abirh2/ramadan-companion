import WidgetKit
import SwiftUI

// MARK: - Data Model

struct PrayerEntry: TimelineEntry {
    let date: Date          // when this entry becomes active (= previous prayer time)
    let prayerName: String  // name of the NEXT prayer we're counting down TO
    let prayerTime: String  // display time of that prayer, e.g. "12:15 PM"
    let targetDate: Date?   // nil = no data (show placeholder)
}

// MARK: - Schedule helpers

private struct NamedPrayer {
    let name: String
    let date: Date
    var display: String { formatPrayerDate(date) }
}

private func namedPrayers(from times: PrayerTimes) -> [NamedPrayer] {
    [
        NamedPrayer(name: "Fajr",    date: times.fajr),
        NamedPrayer(name: "Dhuhr",   date: times.dhuhr),
        NamedPrayer(name: "Asr",     date: times.asr),
        NamedPrayer(name: "Maghrib", date: times.maghrib),
        NamedPrayer(name: "Isha",    date: times.isha),
    ]
}

/// Resolve the best available prayer schedule using the three-tier strategy.
/// Returns an array of daily PrayerTimes, newest to oldest (chronological order).
private func resolveSchedule() -> [PrayerTimes] {
    // Strategy B: embedded algorithm
    if SharedDefaults.hasConfig {
        let calc = PrayerCalculator(
            latitude: SharedDefaults.configLat,
            longitude: SharedDefaults.configLng,
            methodId: SharedDefaults.configMethod,
            madhabId: SharedDefaults.configMadhab
        )
        let schedule = calc.computeSchedule(days: 14)
        if !schedule.isEmpty { return schedule.map(\.times) }
    }

    // Strategy A: 14-day JSON schedule
    let json = SharedDefaults.prayerScheduleJSON
    if !json.isEmpty {
        var result: [PrayerTimes] = []
        for i in 0..<14 {
            guard let date = Calendar.current.date(byAdding: .day, value: i, to: Date()),
                  let times = prayerTimesFromScheduleJSON(json, for: date)
            else { continue }
            result.append(times)
        }
        if !result.isEmpty { return result }
    }

    // Legacy: single-day 24hr strings
    let t24 = [
        SharedDefaults.allPrayersFajr24,
        SharedDefaults.allPrayersDhuhr24,
        SharedDefaults.allPrayersAsr24,
        SharedDefaults.allPrayersMaghrib24,
        SharedDefaults.allPrayersIsha24,
    ]
    if t24.allSatisfy({ !$0.isEmpty }) {
        func makeDate(_ hhmm: String, addDays: Int = 0) -> Date? {
            let parts = hhmm.split(separator: ":").compactMap { Int($0) }
            guard parts.count == 2 else { return nil }
            var c = Calendar.current.dateComponents([.year, .month, .day], from: Date())
            c.hour = parts[0]; c.minute = parts[1]; c.second = 0
            guard var d = Calendar.current.date(from: c) else { return nil }
            if addDays != 0 { d = Calendar.current.date(byAdding: .day, value: addDays, to: d)! }
            return d
        }
        if let f = makeDate(t24[0]), let d = makeDate(t24[1]),
           let a = makeDate(t24[2]), let m = makeDate(t24[3]), let i = makeDate(t24[4]) {
            return [PrayerTimes(fajr: f, dhuhr: d, asr: a, maghrib: m, isha: i)]
        }
    }

    return []
}

// MARK: - Timeline Provider

struct PrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(date: Date(), prayerName: "Fajr", prayerTime: "5:30 AM",
                    targetDate: Date().addingTimeInterval(2 * 3600))
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(buildCurrentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let schedule = resolveSchedule()
        guard !schedule.isEmpty else {
            // No data at all – show placeholder, retry in 15 min
            let entry = PrayerEntry(date: Date(), prayerName: "---",
                                    prayerTime: "Open app", targetDate: nil)
            let retry = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(retry)))
            return
        }

        // Build entries: one per prayer-period transition across 14 days.
        // Each entry is active from prayer[i] until prayer[i+1], and shows
        // the NEXT prayer (i+1) with a live targetDate countdown.
        var entries: [PrayerEntry] = []

        for (dayIndex, times) in schedule.enumerated() {
            let prayers = namedPrayers(from: times)
            for j in 0..<prayers.count {
                let entryDate = prayers[j].date  // when this entry becomes active

                // The prayer we're counting down TO
                let next: NamedPrayer
                if j + 1 < prayers.count {
                    next = prayers[j + 1]
                } else if dayIndex + 1 < schedule.count {
                    // Wrap: after Isha, count down to tomorrow's Fajr
                    next = namedPrayers(from: schedule[dayIndex + 1])[0]
                } else {
                    // Last entry in our window – use .atEnd reload to regenerate
                    continue
                }

                entries.append(PrayerEntry(
                    date: entryDate,
                    prayerName: next.name,
                    prayerTime: next.display,
                    targetDate: next.date
                ))
            }
        }

        if entries.isEmpty {
            let entry = buildCurrentEntry()
            let retry = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(retry)))
        } else {
            // .atEnd triggers a reload after the last entry (~14 days)
            completion(Timeline(entries: entries, policy: .atEnd))
        }
    }

    private func buildCurrentEntry() -> PrayerEntry {
        let schedule = resolveSchedule()
        guard !schedule.isEmpty else {
            return PrayerEntry(date: Date(), prayerName: "---",
                               prayerTime: "Open app", targetDate: nil)
        }
        let now = Date()
        for (dayIndex, times) in schedule.enumerated() {
            let prayers = namedPrayers(from: times)
            for j in 0..<prayers.count {
                if prayers[j].date > now {
                    return PrayerEntry(date: now, prayerName: prayers[j].name,
                                       prayerTime: prayers[j].display,
                                       targetDate: prayers[j].date)
                }
            }
            // All passed today; check if tomorrow's Fajr is upcoming
            if dayIndex + 1 < schedule.count {
                let tomorrowFajr = namedPrayers(from: schedule[dayIndex + 1])[0]
                return PrayerEntry(date: now, prayerName: tomorrowFajr.name,
                                   prayerTime: tomorrowFajr.display,
                                   targetDate: tomorrowFajr.date)
            }
        }
        // Exhausted schedule (shouldn't happen with 14 days)
        let last = namedPrayers(from: schedule[0])
        return PrayerEntry(date: now, prayerName: last[0].name,
                           prayerTime: last[0].display, targetDate: nil)
    }
}

// MARK: - Small Widget View

struct PrayerSmallView: View {
    let entry: PrayerEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            WidgetHeader(icon: "moon.stars.fill", title: "Next Prayer")

            Spacer(minLength: 6)

            Text(entry.prayerName)
                .font(.title2.bold())
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                .minimumScaleFactor(0.7)
                .lineLimit(1)

            Text(entry.prayerTime)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))

            Spacer(minLength: 6)

            HStack(spacing: 4) {
                Image(systemName: "clock")
                    .font(.system(size: 10, weight: .semibold))
                if let target = entry.targetDate {
                    Text(target, style: .relative)
                        .font(.caption2.weight(.bold))
                } else {
                    Text("---").font(.caption2.weight(.bold))
                }
            }
            .foregroundStyle(WidgetTheme.accent(for: colorScheme))
            .lineLimit(1)
            .minimumScaleFactor(0.7)
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

// MARK: - Medium Widget View

struct PrayerMediumView: View {
    let entry: PrayerEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                WidgetHeader(icon: "moon.stars.fill", title: "Next Prayer")

                Text(entry.prayerName)
                    .font(.largeTitle.bold())
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)

                Text(entry.prayerTime)
                    .font(.title3.weight(.medium))
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 6) {
                Image(systemName: "clock.fill")
                    .font(.title2)
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))

                if let target = entry.targetDate {
                    Text(target, style: .relative)
                        .font(.headline.weight(.bold))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                        .multilineTextAlignment(.trailing)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                } else {
                    Text("---")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Lock Screen Views

@available(iOS 16.0, *)
struct PrayerAccessoryRectangularView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(entry.prayerName)
                .font(.headline.bold())
                .widgetAccentable()
            Text(entry.prayerTime)
                .font(.subheadline)
            if let target = entry.targetDate {
                Text(target, style: .relative)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

@available(iOS 16.0, *)
struct PrayerAccessoryCircularView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(spacing: 1) {
            Image(systemName: "moon.stars.fill")
                .font(.system(size: 12))
                .widgetAccentable()
            if let target = entry.targetDate {
                Text(target, style: .timer)
                    .font(.system(size: 10, weight: .bold).monospacedDigit())
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
            } else {
                Text("---").font(.system(size: 12, weight: .bold))
            }
        }
    }
}

@available(iOS 16.0, *)
struct PrayerAccessoryInlineView: View {
    let entry: PrayerEntry

    var body: some View {
        Label("\(entry.prayerName) \(entry.prayerTime)", systemImage: "moon.stars.fill")
    }
}

// MARK: - Entry View

struct PrayerWidgetEntryView: View {
    let entry: PrayerEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            PrayerSmallView(entry: entry)
        case .systemMedium:
            PrayerMediumView(entry: entry)
        case .accessoryRectangular:
            if #available(iOS 16.0, *) {
                PrayerAccessoryRectangularView(entry: entry)
            }
        case .accessoryCircular:
            if #available(iOS 16.0, *) {
                PrayerAccessoryCircularView(entry: entry)
            }
        case .accessoryInline:
            if #available(iOS 16.0, *) {
                PrayerAccessoryInlineView(entry: entry)
            }
        default:
            PrayerSmallView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration

struct PrayerWidget: Widget {
    let kind = "PrayerWidget"

    private var supportedFamilies: [WidgetFamily] {
        var families: [WidgetFamily] = [.systemSmall, .systemMedium]
        if #available(iOS 16.0, *) {
            families.append(contentsOf: [.accessoryRectangular, .accessoryCircular, .accessoryInline])
        }
        return families
    }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Next Prayer")
        .description("Next prayer and live countdown at a glance.")
        .supportedFamilies(supportedFamilies)
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    PrayerWidget()
} timeline: {
    PrayerEntry(date: .now, prayerName: "Fajr", prayerTime: "5:30 AM",
                targetDate: Date().addingTimeInterval(2 * 3600 + 15 * 60))
}

#Preview(as: .systemMedium) {
    PrayerWidget()
} timeline: {
    PrayerEntry(date: .now, prayerName: "Dhuhr", prayerTime: "1:05 PM",
                targetDate: Date().addingTimeInterval(45 * 60))
}
