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

// MARK: - Theme Color

private let tealAccent = Color(red: 0.06, green: 0.24, blue: 0.24)

// MARK: - Prayer Column (mirrors the 5-column grid in NextPrayerCard)

private struct PrayerColumn: View {
    let name: String
    let time: String
    let isNext: Bool

    var body: some View {
        VStack(spacing: 3) {
            Text(name.prefix(3).uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(isNext ? tealAccent : Color.secondary)

            Text(time)
                .font(.system(size: 10, weight: .semibold).monospacedDigit())
                .foregroundStyle(isNext ? tealAccent : Color.primary)
                .minimumScaleFactor(0.7)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(isNext ? tealAccent.opacity(0.12) : Color.primary.opacity(0.05))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(isNext ? tealAccent.opacity(0.25) : Color.clear, lineWidth: 0.5)
        )
    }
}

// MARK: - Widget Content

struct AllPrayersMediumView: View {
    let entry: AllPrayersEntry

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
            // Header
            HStack(spacing: 4) {
                Image(systemName: "sun.and.horizon.fill")
                    .font(.caption2)
                    .foregroundStyle(tealAccent)
                Text("Daily Prayers")
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(.secondary)
            }

            // 5-column prayer grid
            HStack(spacing: 4) {
                ForEach(prayers, id: \.name) { prayer in
                    PrayerColumn(
                        name: prayer.name,
                        time: prayer.time,
                        isNext: prayer.name == entry.nextPrayer
                    )
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
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

// MARK: - Widget Configurations

struct AllPrayersWidget: Widget {
    let kind = "AllPrayersWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AllPrayersProvider()) { entry in
            AllPrayersWidgetEntryView(entry: entry)
                .containerBackground(.ultraThinMaterial, for: .widget)
        }
        .configurationDisplayName("Daily Prayers")
        .description("All five prayer times for today.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct AllPrayersWidgetClear: Widget {
    let kind = "AllPrayersWidgetClear"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AllPrayersProvider()) { entry in
            AllPrayersWidgetEntryView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Daily Prayers - Clear")
        .description("All five prayer times with transparent background.")
        .supportedFamilies([.systemMedium])
        // No contentMarginsDisabled — system margins preserved for clear background widgets
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
