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
        let entry = currentEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func currentEntry() -> AllPrayersEntry {
        AllPrayersEntry(
            date: Date(),
            fajr: SharedDefaults.allPrayersFajr.isEmpty ? "---" : SharedDefaults.allPrayersFajr,
            dhuhr: SharedDefaults.allPrayersDhuhr.isEmpty ? "---" : SharedDefaults.allPrayersDhuhr,
            asr: SharedDefaults.allPrayersAsr.isEmpty ? "---" : SharedDefaults.allPrayersAsr,
            maghrib: SharedDefaults.allPrayersMaghrib.isEmpty ? "---" : SharedDefaults.allPrayersMaghrib,
            isha: SharedDefaults.allPrayersIsha.isEmpty ? "---" : SharedDefaults.allPrayersIsha,
            nextPrayer: SharedDefaults.allPrayersNext
        )
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
