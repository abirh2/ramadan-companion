import WidgetKit
import SwiftUI

// MARK: - Data Model

struct PrayerEntry: TimelineEntry {
    let date: Date          // when this entry becomes active
    let prayerName: String  // name of the NEXT prayer we're counting down TO
    let prayerTime: String  // display time of that prayer, e.g. "12:15 PM"
    let targetDate: Date?   // non-nil = live countdown via Text(date, style: .relative)
    let countdown: String   // static fallback string for when targetDate is nil
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
/// B: embedded algorithm (permanent accuracy)
/// A: 14-day JSON schedule (from app)
/// Legacy: single-day 24hr strings (from app)
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
        func makeDate(_ hhmm: String) -> Date? {
            let parts = hhmm.split(separator: ":").compactMap { Int($0) }
            guard parts.count == 2 else { return nil }
            var c = Calendar.current.dateComponents([.year, .month, .day], from: Date())
            c.hour = parts[0]; c.minute = parts[1]; c.second = 0
            return Calendar.current.date(from: c)
        }
        if let f = makeDate(t24[0]), let d = makeDate(t24[1]),
           let a = makeDate(t24[2]), let m = makeDate(t24[3]), let i = makeDate(t24[4]) {
            return [PrayerTimes(fajr: f, dhuhr: d, asr: a, maghrib: m, isha: i)]
        }
    }

    return []
}

/// Find the next upcoming prayer from a schedule, returning both the
/// prayer info and a computed countdown string.
private func findNextPrayer(in schedule: [PrayerTimes]) -> (name: String, display: String, target: Date)? {
    let now = Date()
    for (dayIndex, times) in schedule.enumerated() {
        let prayers = namedPrayers(from: times)
        for prayer in prayers {
            if prayer.date > now {
                return (prayer.name, prayer.display, prayer.date)
            }
        }
        // All prayers passed for this day; check tomorrow's Fajr
        if dayIndex + 1 < schedule.count {
            let tomorrowFajr = namedPrayers(from: schedule[dayIndex + 1])[0]
            if tomorrowFajr.date > now {
                return (tomorrowFajr.name, tomorrowFajr.display, tomorrowFajr.date)
            }
        }
    }
    return nil
}

private func countdownString(to target: Date) -> String {
    let diff = Int(target.timeIntervalSince(Date()))
    guard diff > 0 else { return "now" }
    let h = diff / 3600
    let m = (diff % 3600) / 60
    if h > 0 { return "\(h)h \(m)m" }
    if m > 0 { return "\(m)m" }
    return "<1m"
}

// MARK: - Timeline Provider

struct PrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(date: Date(), prayerName: "Fajr", prayerTime: "5:30 AM",
                    targetDate: Date().addingTimeInterval(2 * 3600), countdown: "2h 0m")
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(buildCurrentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let schedule = resolveSchedule()

        guard !schedule.isEmpty else {
            // No computed schedule available — fall back to legacy stored keys
            let entry = buildLegacyEntry()
            let retry = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(retry)))
            return
        }

        // Build entries: one per prayer transition across all available days.
        // Each entry becomes active when a prayer PASSES, and shows the NEXT one.
        var entries: [PrayerEntry] = []

        for (dayIndex, times) in schedule.enumerated() {
            let prayers = namedPrayers(from: times)
            for j in 0..<prayers.count {
                let entryDate = prayers[j].date

                let next: NamedPrayer
                if j + 1 < prayers.count {
                    next = prayers[j + 1]
                } else if dayIndex + 1 < schedule.count {
                    next = namedPrayers(from: schedule[dayIndex + 1])[0]
                } else {
                    continue
                }

                entries.append(PrayerEntry(
                    date: entryDate,
                    prayerName: next.name,
                    prayerTime: next.display,
                    targetDate: next.date,
                    countdown: countdownString(to: next.date)
                ))
            }
        }

        // Ensure there is an entry for RIGHT NOW (before the first prayer of the day)
        // WidgetKit needs an entry with date <= now to have something to display.
        if let next = findNextPrayer(in: schedule) {
            let nowEntry = PrayerEntry(
                date: .distantPast,
                prayerName: next.name,
                prayerTime: next.display,
                targetDate: next.target,
                countdown: countdownString(to: next.target)
            )
            entries.insert(nowEntry, at: 0)
        }

        if entries.isEmpty {
            let entry = buildLegacyEntry()
            let retry = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(retry)))
        } else {
            completion(Timeline(entries: entries, policy: .atEnd))
        }
    }

    /// Build an entry using computed schedule data.
    private func buildCurrentEntry() -> PrayerEntry {
        let schedule = resolveSchedule()
        if let next = findNextPrayer(in: schedule) {
            return PrayerEntry(
                date: Date(),
                prayerName: next.name,
                prayerTime: next.display,
                targetDate: next.target,
                countdown: countdownString(to: next.target)
            )
        }
        return buildLegacyEntry()
    }

    /// Last-resort fallback: read the simple single-prayer keys written by the app.
    /// These exist even before any of the new strategy keys are written.
    private func buildLegacyEntry() -> PrayerEntry {
        let name = SharedDefaults.prayerName.isEmpty ? "---" : SharedDefaults.prayerName
        let time = SharedDefaults.prayerTime.isEmpty ? "Open app" : SharedDefaults.prayerTime

        // Try to parse the legacy ISO target time for a live countdown
        var targetDate: Date? = nil
        var countdown = "---"
        let targetISO = SharedDefaults.prayerTargetTime
        if !targetISO.isEmpty {
            let fmt = ISO8601DateFormatter()
            fmt.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let d = fmt.date(from: targetISO) ?? ISO8601DateFormatter().date(from: targetISO) {
                targetDate = d
                countdown = countdownString(to: d)
            }
        }

        return PrayerEntry(date: Date(), prayerName: name, prayerTime: time,
                           targetDate: targetDate, countdown: countdown)
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
                if let target = entry.targetDate, target > Date() {
                    Text(target, style: .relative)
                        .font(.caption2.weight(.bold))
                } else {
                    Text(entry.countdown)
                        .font(.caption2.weight(.bold))
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

                if let target = entry.targetDate, target > Date() {
                    Text(target, style: .relative)
                        .font(.headline.weight(.bold))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                        .multilineTextAlignment(.trailing)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                } else {
                    Text(entry.countdown)
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
            if let target = entry.targetDate, target > Date() {
                Text(target, style: .relative)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                Text(entry.countdown)
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
            if let target = entry.targetDate, target > Date() {
                Text(target, style: .timer)
                    .font(.system(size: 10, weight: .bold).monospacedDigit())
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
            } else {
                Text(entry.countdown)
                    .font(.system(size: 12, weight: .bold))
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
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
                targetDate: Date().addingTimeInterval(2 * 3600 + 15 * 60), countdown: "2h 15m")
}

#Preview(as: .systemMedium) {
    PrayerWidget()
} timeline: {
    PrayerEntry(date: .now, prayerName: "Dhuhr", prayerTime: "1:05 PM",
                targetDate: Date().addingTimeInterval(45 * 60), countdown: "45m")
}
