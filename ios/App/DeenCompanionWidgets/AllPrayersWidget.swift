import WidgetKit
import SwiftUI

// MARK: - Data Model

struct AllPrayersEntry: TimelineEntry {
    let date: Date
    let fajr: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let nextPrayer: String
}

// MARK: - Timeline Provider

struct AllPrayersProvider: TimelineProvider {
    func placeholder(in context: Context) -> AllPrayersEntry {
        AllPrayersEntry(
            date: Date(),
            fajr: "5:30 AM", dhuhr: "1:05 PM", asr: "4:30 PM",
            maghrib: "6:15 PM", isha: "7:45 PM", nextPrayer: "Asr"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (AllPrayersEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AllPrayersEntry>) -> Void) {
        let schedule = resolveAllPrayersSchedule()
        if schedule.isEmpty {
            let entry = currentEntryFromStoredStrings()
            let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(next)))
            return
        }

        // Build one entry per prayer-period so the highlighted row updates automatically
        var entries: [AllPrayersEntry] = []
        let now = Date()

        for (dayIndex, times) in schedule.enumerated() {
            let prayers: [(name: String, date: Date)] = [
                ("Fajr", times.fajr), ("Dhuhr", times.dhuhr), ("Asr", times.asr),
                ("Maghrib", times.maghrib), ("Isha", times.isha),
            ]
            for j in 0..<prayers.count {
                let entryDate = prayers[j].date
                // Determine which prayer is NEXT at entryDate
                let nextName: String
                if j + 1 < prayers.count {
                    nextName = prayers[j + 1].name
                } else if dayIndex + 1 < schedule.count {
                    nextName = "Fajr"
                } else {
                    continue
                }
                entries.append(AllPrayersEntry(
                    date: entryDate,
                    fajr: formatPrayerDate(times.fajr),
                    dhuhr: formatPrayerDate(times.dhuhr),
                    asr: formatPrayerDate(times.asr),
                    maghrib: formatPrayerDate(times.maghrib),
                    isha: formatPrayerDate(times.isha),
                    nextPrayer: nextName
                ))
            }
        }

        // Ensure there's always an entry active "now"
        if entries.first(where: { $0.date <= now }) == nil, let first = entries.first {
            entries.insert(AllPrayersEntry(date: .distantPast, fajr: first.fajr,
                dhuhr: first.dhuhr, asr: first.asr, maghrib: first.maghrib,
                isha: first.isha, nextPrayer: first.nextPrayer), at: 0)
        }

        completion(Timeline(entries: entries.isEmpty ? [currentEntryFromStoredStrings()] : entries,
                            policy: .atEnd))
    }

    /// Resolve today's prayer times using the three-tier strategy.
    private func resolveAllPrayersSchedule() -> [PrayerTimes] {
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

    private func currentEntry() -> AllPrayersEntry {
        let sched = resolveAllPrayersSchedule()
        if let today = sched.first {
            return AllPrayersEntry(
                date: Date(),
                fajr: formatPrayerDate(today.fajr),
                dhuhr: formatPrayerDate(today.dhuhr),
                asr: formatPrayerDate(today.asr),
                maghrib: formatPrayerDate(today.maghrib),
                isha: formatPrayerDate(today.isha),
                nextPrayer: computeNextPrayerName(from: today)
            )
        }
        return currentEntryFromStoredStrings()
    }

    private func currentEntryFromStoredStrings() -> AllPrayersEntry {
        AllPrayersEntry(
            date: Date(),
            fajr: SharedDefaults.allPrayersFajr.isEmpty ? "---" : SharedDefaults.allPrayersFajr,
            dhuhr: SharedDefaults.allPrayersDhuhr.isEmpty ? "---" : SharedDefaults.allPrayersDhuhr,
            asr: SharedDefaults.allPrayersAsr.isEmpty ? "---" : SharedDefaults.allPrayersAsr,
            maghrib: SharedDefaults.allPrayersMaghrib.isEmpty ? "---" : SharedDefaults.allPrayersMaghrib,
            isha: SharedDefaults.allPrayersIsha.isEmpty ? "---" : SharedDefaults.allPrayersIsha,
            nextPrayer: computeNextPrayerNameFromStored()
        )
    }

    private func computeNextPrayerName(from times: PrayerTimes) -> String {
        let now = Date()
        if times.fajr > now { return "Fajr" }
        if times.dhuhr > now { return "Dhuhr" }
        if times.asr > now { return "Asr" }
        if times.maghrib > now { return "Maghrib" }
        if times.isha > now { return "Isha" }
        return "Fajr"  // all passed; tomorrow's Fajr
    }

    private func computeNextPrayerNameFromStored() -> String {
        let names = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
        let times24 = [
            SharedDefaults.allPrayersFajr24, SharedDefaults.allPrayersDhuhr24,
            SharedDefaults.allPrayersAsr24, SharedDefaults.allPrayersMaghrib24,
            SharedDefaults.allPrayersIsha24,
        ]
        let now = Date()
        let cal = Calendar.current
        for (i, t24) in times24.enumerated() {
            let parts = t24.split(separator: ":").compactMap { Int($0) }
            guard parts.count == 2 else { continue }
            var comps = cal.dateComponents([.year, .month, .day], from: now)
            comps.hour = parts[0]; comps.minute = parts[1]; comps.second = 0
            if let target = cal.date(from: comps), target > now { return names[i] }
        }
        return SharedDefaults.allPrayersNext.isEmpty ? "Fajr" : SharedDefaults.allPrayersNext
    }
}

// MARK: - Prayer Column

private struct PrayerColumn: View {
    let name: String
    let time: String
    let isNext: Bool
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(spacing: 5) {
            Text(name.uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(isNext ? WidgetTheme.accent(for: colorScheme) : WidgetTheme.secondaryText(for: colorScheme))
                .minimumScaleFactor(0.7)
                .lineLimit(1)

            Text(time)
                .font(.system(size: 11, weight: .semibold).monospacedDigit())
                .foregroundStyle(isNext ? WidgetTheme.accent(for: colorScheme) : WidgetTheme.primaryText(for: colorScheme))
                .minimumScaleFactor(0.7)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(isNext ? WidgetTheme.highlightFill(for: colorScheme) : WidgetTheme.cardFill(for: colorScheme))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .stroke(isNext ? WidgetTheme.accent(for: colorScheme).opacity(0.3) : Color.clear, lineWidth: 0.5)
        )
    }
}

// MARK: - Widget Content

struct AllPrayersMediumView: View {
    let entry: AllPrayersEntry
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
        VStack(alignment: .leading, spacing: 8) {
            WidgetHeader(icon: "sun.and.horizon.fill", title: "Daily Prayers")

            HStack(spacing: 5) {
                ForEach(prayers, id: \.name) { prayer in
                    PrayerColumn(
                        name: prayer.name,
                        time: prayer.time,
                        isNext: prayer.name == entry.nextPrayer
                    )
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Entry View

struct AllPrayersWidgetEntryView: View {
    let entry: AllPrayersEntry

    var body: some View {
        AllPrayersMediumView(entry: entry)
            .widgetURL(URL(string: "deencompanion:///times"))
    }
}

// MARK: - Widget Configuration

struct AllPrayersWidget: Widget {
    let kind = "AllPrayersWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AllPrayersProvider()) { entry in
            AllPrayersWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Daily Prayers")
        .description("All five prayer times for today.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemMedium) {
    AllPrayersWidget()
} timeline: {
    AllPrayersEntry(
        date: .now,
        fajr: "5:30 AM", dhuhr: "1:05 PM", asr: "4:30 PM",
        maghrib: "6:15 PM", isha: "7:45 PM", nextPrayer: "Asr"
    )
}
