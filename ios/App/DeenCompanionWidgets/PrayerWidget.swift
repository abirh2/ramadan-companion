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
        let name = SharedDefaults.prayerName.isEmpty ? "---" : SharedDefaults.prayerName
        let time = SharedDefaults.prayerTime.isEmpty ? "Open app" : SharedDefaults.prayerTime
        let targetStr = SharedDefaults.prayerTargetTime

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard !targetStr.isEmpty, let targetDate = formatter.date(from: targetStr) else {
            let entry = currentEntry()
            let next = Calendar.current.date(byAdding: .minute, value: 1, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(next)))
            return
        }

        let now = Date()
        var entries: [PrayerEntry] = []
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

            entries.append(PrayerEntry(date: entryDate, prayerName: name, prayerTime: time, countdown: countdown))
        }

        if entries.isEmpty {
            entries.append(PrayerEntry(date: now, prayerName: name, prayerTime: time, countdown: "now"))
        }

        let reloadDate = targetDate.addingTimeInterval(60)
        completion(Timeline(entries: entries, policy: .after(reloadDate)))
    }

    private func currentEntry() -> PrayerEntry {
        let name = SharedDefaults.prayerName.isEmpty ? "---" : SharedDefaults.prayerName
        let time = SharedDefaults.prayerTime.isEmpty ? "Open app" : SharedDefaults.prayerTime
        return PrayerEntry(date: Date(), prayerName: name, prayerTime: time, countdown: "---")
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
                Text(entry.countdown)
                    .font(.caption2.weight(.bold))
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

                Text(entry.countdown)
                    .font(.headline.weight(.bold))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                    .multilineTextAlignment(.trailing)
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)
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
            Text(entry.countdown)
                .font(.caption)
                .foregroundStyle(.secondary)
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
            Text(entry.countdown)
                .font(.system(size: 12, weight: .bold).monospacedDigit())
                .minimumScaleFactor(0.6)
                .lineLimit(1)
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
    PrayerEntry(date: .now, prayerName: "Fajr", prayerTime: "5:30 AM", countdown: "2h 15m")
}

#Preview(as: .systemMedium) {
    PrayerWidget()
} timeline: {
    PrayerEntry(date: .now, prayerName: "Dhuhr", prayerTime: "1:05 PM", countdown: "45m")
}
