import WidgetKit
import SwiftUI

// MARK: - Combined Entry (reuses data from both Prayer + AllPrayers)

struct PrayerListEntry: TimelineEntry {
    let date: Date
    let nextPrayerName: String
    let nextPrayerTime: String
    let countdown: String
    let fajr: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
}

// MARK: - Timeline Provider

struct PrayerListProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerListEntry {
        PrayerListEntry(
            date: Date(),
            nextPrayerName: "Asr", nextPrayerTime: "3:45 PM", countdown: "2h 14m",
            fajr: "5:12 AM", dhuhr: "12:30 PM", asr: "3:45 PM",
            maghrib: "6:15 PM", isha: "7:45 PM"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerListEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerListEntry>) -> Void) {
        let name = SharedDefaults.prayerName
        let targetStr = SharedDefaults.prayerTargetTime

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard !name.isEmpty, !targetStr.isEmpty, let targetDate = formatter.date(from: targetStr) else {
            let entry = currentEntry()
            let next = Calendar.current.date(byAdding: .minute, value: 1, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(next)))
            return
        }

        let now = Date()
        var entries: [PrayerListEntry] = []
        let maxEntries = 300

        for i in 0..<maxEntries {
            guard let entryDate = Calendar.current.date(byAdding: .minute, value: i, to: now) else { break }
            if entryDate >= targetDate { break }

            let diff = Int(targetDate.timeIntervalSince(entryDate))
            guard diff > 0 else { break }

            let hours = diff / 3600
            let minutes = (diff % 3600) / 60
            let countdown: String
            if hours > 0 {
                countdown = "\(hours)h \(minutes)m"
            } else if minutes > 0 {
                countdown = "\(minutes)m"
            } else {
                countdown = "<1m"
            }

            entries.append(PrayerListEntry(
                date: entryDate,
                nextPrayerName: SharedDefaults.prayerName,
                nextPrayerTime: SharedDefaults.prayerTime,
                countdown: countdown,
                fajr: SharedDefaults.allPrayersFajr.isEmpty ? "---" : SharedDefaults.allPrayersFajr,
                dhuhr: SharedDefaults.allPrayersDhuhr.isEmpty ? "---" : SharedDefaults.allPrayersDhuhr,
                asr: SharedDefaults.allPrayersAsr.isEmpty ? "---" : SharedDefaults.allPrayersAsr,
                maghrib: SharedDefaults.allPrayersMaghrib.isEmpty ? "---" : SharedDefaults.allPrayersMaghrib,
                isha: SharedDefaults.allPrayersIsha.isEmpty ? "---" : SharedDefaults.allPrayersIsha
            ))
        }

        if entries.isEmpty {
            entries.append(currentEntry())
        }

        let reloadDate = targetDate.addingTimeInterval(60)
        completion(Timeline(entries: entries, policy: .after(reloadDate)))
    }

    private func currentEntry() -> PrayerListEntry {
        PrayerListEntry(
            date: Date(),
            nextPrayerName: SharedDefaults.prayerName.isEmpty ? "---" : SharedDefaults.prayerName,
            nextPrayerTime: SharedDefaults.prayerTime.isEmpty ? "Open app" : SharedDefaults.prayerTime,
            countdown: "---",
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
            // Left: Hero next prayer
            VStack(alignment: .leading, spacing: 4) {
                WidgetHeader(icon: "moon.stars.fill", title: "Next")

                Spacer(minLength: 4)

                Text(entry.nextPrayerName)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)

                Text("in \(entry.countdown)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))

                Spacer(minLength: 4)

                Image(systemName: "building.columns.fill")
                    .font(.system(size: 16))
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme).opacity(0.4))
            }
            .padding(14)
            .frame(maxHeight: .infinity)

            // Divider
            Rectangle()
                .fill(WidgetTheme.subtleBorder(for: colorScheme))
                .frame(width: 1)
                .padding(.vertical, 10)

            // Right: Prayer list
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
        nextPrayerName: "Asr", nextPrayerTime: "3:45 PM", countdown: "2h 14m",
        fajr: "5:12 AM", dhuhr: "12:30 PM", asr: "3:45 PM",
        maghrib: "6:15 PM", isha: "7:45 PM"
    )
}
