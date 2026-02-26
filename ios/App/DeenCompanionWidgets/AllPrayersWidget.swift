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

// MARK: - Prayer Row

private struct PrayerRow: View {
    let name: String
    let time: String
    let isNext: Bool

    var body: some View {
        HStack {
            if isNext {
                Circle()
                    .fill(tealAccent)
                    .frame(width: 6, height: 6)
            } else {
                // Invisible placeholder to keep alignment
                Color.clear
                    .frame(width: 6, height: 6)
            }

            Text(name)
                .font(.caption.weight(isNext ? .semibold : .regular))
                .foregroundStyle(isNext ? tealAccent : Color.primary)
                .frame(width: 60, alignment: .leading)

            Spacer()

            Text(time)
                .font(.caption.weight(isNext ? .semibold : .regular).monospacedDigit())
                .foregroundStyle(isNext ? tealAccent : Color.secondary)
        }
    }
}

// MARK: - Medium View

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
        HStack(spacing: 16) {
            // Left: header + icon
            VStack(alignment: .leading, spacing: 6) {
                Image(systemName: "sun.and.horizon.fill")
                    .font(.title2)
                    .foregroundStyle(tealAccent)
                Text("Daily\nPrayers")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                Spacer()
            }
            .frame(width: 56)

            // Right: prayer list
            VStack(spacing: 4) {
                ForEach(prayers, id: \.name) { prayer in
                    PrayerRow(
                        name: prayer.name,
                        time: prayer.time,
                        isNext: prayer.name == entry.nextPrayer
                    )
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Entry View

struct AllPrayersWidgetEntryView: View {
    let entry: AllPrayersEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        AllPrayersMediumView(entry: entry)
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
