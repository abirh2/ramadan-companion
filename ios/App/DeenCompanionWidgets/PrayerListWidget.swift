import WidgetKit
import SwiftUI

// MARK: - Combined Entry (reuses data from both Prayer + AllPrayers)

struct PrayerListEntry: TimelineEntry {
    let date: Date
    let nextPrayerName: String
    let nextPrayerTime: String
    let targetDate: Date?   // for live countdown via Text(date, style: .relative)
    let fajr: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
}

// MARK: - Schedule resolution (shared logic with PrayerWidget)

private func listResolveSchedule() -> [PrayerTimes] {
    if SharedDefaults.hasConfig {
        let calc = PrayerCalculator(
            latitude: SharedDefaults.configLat,
            longitude: SharedDefaults.configLng,
            methodId: SharedDefaults.configMethod,
            madhabId: SharedDefaults.configMadhab
        )
        let sched = calc.computeSchedule(days: 14)
        if !sched.isEmpty { return sched.map(\.times) }
    }
    let json = SharedDefaults.prayerScheduleJSON
    if !json.isEmpty {
        var result: [PrayerTimes] = []
        for i in 0..<14 {
            guard let date = Calendar.current.date(byAdding: .day, value: i, to: Date()),
                  let t = prayerTimesFromScheduleJSON(json, for: date) else { continue }
            result.append(t)
        }
        if !result.isEmpty { return result }
    }
    return []
}

private func listNextPrayer(from schedule: [PrayerTimes]) -> (name: String, display: String, target: Date)? {
    let now = Date()
    for times in schedule {
        let pairs: [(String, Date)] = [
            ("Fajr", times.fajr), ("Dhuhr", times.dhuhr), ("Asr", times.asr),
            ("Maghrib", times.maghrib), ("Isha", times.isha),
        ]
        for (name, date) in pairs where date > now {
            return (name, formatPrayerDate(date), date)
        }
    }
    return nil
}

// MARK: - Timeline Provider

struct PrayerListProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerListEntry {
        PrayerListEntry(
            date: Date(),
            nextPrayerName: "Asr", nextPrayerTime: "3:45 PM",
            targetDate: Date().addingTimeInterval(2 * 3600),
            fajr: "5:12 AM", dhuhr: "12:30 PM", asr: "3:45 PM",
            maghrib: "6:15 PM", isha: "7:45 PM"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerListEntry) -> Void) {
        completion(buildCurrentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerListEntry>) -> Void) {
        let schedule = listResolveSchedule()
        guard !schedule.isEmpty else {
            let entry = buildFallbackEntry()
            let reload = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(reload)))
            return
        }

        var entries: [PrayerListEntry] = []

        for (dayIndex, times) in schedule.enumerated() {
            let displayTimes = (
                fajr: formatPrayerDate(times.fajr), dhuhr: formatPrayerDate(times.dhuhr),
                asr: formatPrayerDate(times.asr), maghrib: formatPrayerDate(times.maghrib),
                isha: formatPrayerDate(times.isha)
            )
            let prayers: [(name: String, date: Date)] = [
                ("Fajr", times.fajr), ("Dhuhr", times.dhuhr), ("Asr", times.asr),
                ("Maghrib", times.maghrib), ("Isha", times.isha),
            ]
            for j in 0..<prayers.count {
                let entryDate = prayers[j].date
                let next: (name: String, date: Date)
                if j + 1 < prayers.count {
                    next = prayers[j + 1]
                } else if dayIndex + 1 < schedule.count {
                    next = ("Fajr", schedule[dayIndex + 1].fajr)
                } else { continue }

                entries.append(PrayerListEntry(
                    date: entryDate,
                    nextPrayerName: next.name,
                    nextPrayerTime: formatPrayerDate(next.date),
                    targetDate: next.date,
                    fajr: displayTimes.fajr, dhuhr: displayTimes.dhuhr,
                    asr: displayTimes.asr, maghrib: displayTimes.maghrib,
                    isha: displayTimes.isha
                ))
            }
        }

        completion(Timeline(entries: entries.isEmpty ? [buildCurrentEntry()] : entries,
                            policy: .atEnd))
    }

    private func buildCurrentEntry() -> PrayerListEntry {
        let schedule = listResolveSchedule()
        if let next = listNextPrayer(from: schedule), let today = schedule.first {
            return PrayerListEntry(
                date: Date(), nextPrayerName: next.name, nextPrayerTime: next.display,
                targetDate: next.target,
                fajr: formatPrayerDate(today.fajr), dhuhr: formatPrayerDate(today.dhuhr),
                asr: formatPrayerDate(today.asr), maghrib: formatPrayerDate(today.maghrib),
                isha: formatPrayerDate(today.isha)
            )
        }
        return buildFallbackEntry()
    }

    private func buildFallbackEntry() -> PrayerListEntry {
        PrayerListEntry(
            date: Date(),
            nextPrayerName: SharedDefaults.prayerName.isEmpty ? "---" : SharedDefaults.prayerName,
            nextPrayerTime: SharedDefaults.prayerTime.isEmpty ? "Open app" : SharedDefaults.prayerTime,
            targetDate: nil,
            fajr: SharedDefaults.allPrayersFajr.isEmpty ? "---" : SharedDefaults.allPrayersFajr,
            dhuhr: SharedDefaults.allPrayersDhuhr.isEmpty ? "---" : SharedDefaults.allPrayersDhuhr,
            asr: SharedDefaults.allPrayersAsr.isEmpty ? "---" : SharedDefaults.allPrayersAsr,
            maghrib: SharedDefaults.allPrayersMaghrib.isEmpty ? "---" : SharedDefaults.allPrayersMaghrib,
            isha: SharedDefaults.allPrayersIsha.isEmpty ? "---" : SharedDefaults.allPrayersIsha
        )
    }
}

// MARK: - Prayer Row

private struct PrayerRow: View {
    let name: String
    let time: String
    let isActive: Bool
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack {
            Text(name)
                .font(.system(size: 12, weight: isActive ? .bold : .medium))
                .foregroundStyle(isActive ? WidgetTheme.accent(for: colorScheme) : WidgetTheme.secondaryText(for: colorScheme))
                .frame(width: 56, alignment: .leading)

            Spacer()

            Text(time)
                .font(.system(size: 12, weight: .semibold).monospacedDigit())
                .foregroundStyle(isActive ? WidgetTheme.accent(for: colorScheme) : WidgetTheme.primaryText(for: colorScheme))

            if isActive {
                Circle()
                    .fill(WidgetTheme.accent(for: colorScheme))
                    .frame(width: 5, height: 5)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(
            isActive
                ? RoundedRectangle(cornerRadius: 6, style: .continuous)
                    .fill(WidgetTheme.highlightFill(for: colorScheme))
                : nil
        )
    }
}

// MARK: - Medium Widget View

struct PrayerListMediumView: View {
    let entry: PrayerListEntry
    @Environment(\.colorScheme) var colorScheme

    private var prayers: [(name: String, time: String)] {
        [
            ("Fajr", entry.fajr),
            ("Dhuhr", entry.dhuhr),
            ("Asr", entry.asr),
            ("Maghrib", entry.maghrib),
            ("Isha", entry.isha),
        ]
    }

    var body: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 4) {
                WidgetHeader(icon: "moon.stars.fill", title: "Next")

                Spacer(minLength: 4)

                Text(entry.nextPrayerName)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)

                Group {
                    if let target = entry.targetDate {
                        Text("in ") + Text(target, style: .relative)
                    } else {
                        Text("---")
                    }
                }
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(WidgetTheme.accent(for: colorScheme))

                Spacer(minLength: 4)

                Image(systemName: "building.columns.fill")
                    .font(.system(size: 16))
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme).opacity(0.4))
            }
            .padding(14)
            .frame(maxHeight: .infinity)

            Rectangle()
                .fill(WidgetTheme.subtleBorder(for: colorScheme))
                .frame(width: 1)
                .padding(.vertical, 10)

            VStack(spacing: 2) {
                ForEach(prayers, id: \.name) { prayer in
                    PrayerRow(
                        name: prayer.name,
                        time: prayer.time,
                        isActive: prayer.name == entry.nextPrayerName
                    )
                }
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 4)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Entry View

struct PrayerListWidgetEntryView: View {
    let entry: PrayerListEntry

    var body: some View {
        PrayerListMediumView(entry: entry)
            .widgetURL(URL(string: "deencompanion:///times"))
    }
}

// MARK: - Widget Configuration

struct PrayerListWidget: Widget {
    let kind = "PrayerListWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerListProvider()) { entry in
            PrayerListWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Prayer Schedule")
        .description("Next prayer with full daily prayer list.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemMedium) {
    PrayerListWidget()
} timeline: {
    PrayerListEntry(
        date: .now,
        nextPrayerName: "Asr", nextPrayerTime: "3:45 PM",
        targetDate: Date().addingTimeInterval(2 * 3600 + 14 * 60),
        fajr: "5:12 AM", dhuhr: "12:30 PM", asr: "3:45 PM",
        maghrib: "6:15 PM", isha: "7:45 PM"
    )
}
