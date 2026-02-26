import WidgetKit
import SwiftUI

// MARK: - Data Model

struct PrayerEntry: TimelineEntry {
    let date: Date
    let prayerName: String
    let prayerTime: String
    let countdown: String
}

// MARK: - Timeline Provider

struct PrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(date: Date(), prayerName: "Fajr", prayerTime: "5:30 AM", countdown: "2h 15m")
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let entry = currentEntry()
        // Refresh every minute so the countdown stays reasonably current.
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 1, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func currentEntry() -> PrayerEntry {
        let name = SharedDefaults.prayerName.isEmpty ? "—" : SharedDefaults.prayerName
        let time = SharedDefaults.prayerTime.isEmpty ? "Open app" : SharedDefaults.prayerTime
        let countdown = SharedDefaults.prayerCountdown.isEmpty ? "—" : SharedDefaults.prayerCountdown
        return PrayerEntry(date: Date(), prayerName: name, prayerTime: time, countdown: countdown)
    }
}

// MARK: - Small Widget View

struct PrayerSmallView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 4) {
                Image(systemName: "moon.stars.fill")
                    .font(.caption2)
                    .foregroundStyle(Color(red: 0.06, green: 0.24, blue: 0.24))
                Text("Next Prayer")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 4)

            Text(entry.prayerName)
                .font(.title2.bold())
                .foregroundStyle(.primary)
                .minimumScaleFactor(0.7)
                .lineLimit(1)

            Text(entry.prayerTime)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.primary)

            Spacer(minLength: 4)

            Label(entry.countdown, systemImage: "clock")
                .font(.caption2.weight(.medium))
                .foregroundStyle(Color(red: 0.06, green: 0.24, blue: 0.24))
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

    var body: some View {
        HStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Image(systemName: "moon.stars.fill")
                        .font(.caption)
                        .foregroundStyle(Color(red: 0.06, green: 0.24, blue: 0.24))
                    Text("Next Prayer")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Text(entry.prayerName)
                    .font(.largeTitle.bold())
                    .foregroundStyle(.primary)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)

                Text(entry.prayerTime)
                    .font(.title3.weight(.medium))
                    .foregroundStyle(.primary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 6) {
                Image(systemName: "clock.fill")
                    .font(.title2)
                    .foregroundStyle(Color(red: 0.06, green: 0.24, blue: 0.24))

                Text(entry.countdown)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(Color(red: 0.06, green: 0.24, blue: 0.24))
                    .multilineTextAlignment(.trailing)
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
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
        default:
            PrayerSmallView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration

struct PrayerWidget: Widget {
    let kind = "PrayerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
                .containerBackground(.ultraThinMaterial, for: .widget)
        }
        .configurationDisplayName("Prayer Times")
        .description("See the next prayer and countdown at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    PrayerWidget()
} timeline: {
    PrayerEntry(date: .now, prayerName: "Fajr", prayerTime: "5:30 AM", countdown: "2h 15m")
}

#Preview(as: .systemMedium) {
    PrayerWidget()
} timeline: {
    PrayerEntry(date: .now, prayerName: "Dhuhr", prayerTime: "1:05 PM", countdown: "45m 10s")
}
