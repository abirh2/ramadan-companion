import WidgetKit
import SwiftUI

private enum PrayerEntryStatus {
    case ready
    case setup
    case stale
}

private struct CachedPrayer: Decodable {
    let name: String
    let time: String
    let timestamp: String
}

private struct CachedPrayerSnapshot: Decodable {
    let version: Int
    let generatedAt: String
    let expiresAt: String
    let gregorianDate: String
    let hijriDate: String
    let prayers: [CachedPrayer]
}

private struct ResolvedPrayer: Identifiable {
    let name: String
    let time: String
    let date: Date

    var id: Date { date }
}

struct PrayerEntry: TimelineEntry {
    let date: Date
    let prayerName: String
    let prayerTime: String
    let targetDate: Date?
    fileprivate let upcoming: [ResolvedPrayer]
    let dateLabel: String
    fileprivate let status: PrayerEntryStatus

    fileprivate static func recovery(_ status: PrayerEntryStatus, at date: Date = Date()) -> PrayerEntry {
        PrayerEntry(
            date: date,
            prayerName: "",
            prayerTime: "",
            targetDate: nil,
            upcoming: [],
            dateLabel: "",
            status: status
        )
    }
}

private func parseISO8601(_ value: String) -> Date? {
    let fractional = ISO8601DateFormatter()
    fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return fractional.date(from: value) ?? ISO8601DateFormatter().date(from: value)
}

private func loadSnapshot() -> (snapshot: CachedPrayerSnapshot, prayers: [ResolvedPrayer], generated: Date, expires: Date)? {
    guard
        let data = SharedDefaults.prayerSnapshotJSON.data(using: .utf8),
        data.count <= 64 * 1024,
        let snapshot = try? JSONDecoder().decode(CachedPrayerSnapshot.self, from: data),
        snapshot.version == 1,
        snapshot.prayers.count <= 70,
        let generated = parseISO8601(snapshot.generatedAt),
        let expires = parseISO8601(snapshot.expiresAt),
        expires > generated
    else { return nil }

    let allowedNames = Set(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"])
    let prayers = snapshot.prayers.compactMap { prayer -> ResolvedPrayer? in
        guard allowedNames.contains(prayer.name),
              !prayer.time.isEmpty,
              prayer.time.count <= 16,
              let date = parseISO8601(prayer.timestamp)
        else { return nil }
        return ResolvedPrayer(name: prayer.name, time: prayer.time, date: date)
    }.sorted { $0.date < $1.date }

    guard !prayers.isEmpty else { return nil }
    return (snapshot, prayers, generated, expires)
}

private func dateLabel(for snapshot: CachedPrayerSnapshot, generated: Date, entryDate: Date) -> String {
    guard Calendar.current.isDate(generated, inSameDayAs: entryDate) else { return "" }
    return snapshot.hijriDate.isEmpty ? snapshot.gregorianDate : snapshot.hijriDate
}

private func readyEntry(
    at entryDate: Date,
    index: Int,
    snapshot: CachedPrayerSnapshot,
    prayers: [ResolvedPrayer],
    generated: Date
) -> PrayerEntry {
    let prayer = prayers[index]
    return PrayerEntry(
        date: entryDate,
        prayerName: prayer.name,
        prayerTime: prayer.time,
        targetDate: prayer.date,
        upcoming: Array(prayers.dropFirst(index + 1).prefix(2)),
        dateLabel: dateLabel(for: snapshot, generated: generated, entryDate: entryDate),
        status: .ready
    )
}

struct PrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(
            date: .now,
            prayerName: "Asr",
            prayerTime: "4:36 PM",
            targetDate: Date().addingTimeInterval(6_120),
            upcoming: [
                ResolvedPrayer(name: "Maghrib", time: "7:12 PM", date: Date().addingTimeInterval(15_000)),
                ResolvedPrayer(name: "Isha", time: "8:28 PM", date: Date().addingTimeInterval(19_500)),
            ],
            dateLabel: "27 Rabi al-Awwal 1448",
            status: .ready
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let now = Date()
        guard let loaded = loadSnapshot() else {
            completion(Timeline(entries: [.recovery(.setup, at: now)], policy: .after(now.addingTimeInterval(30 * 60))))
            return
        }

        guard loaded.expires > now,
              let currentIndex = loaded.prayers.firstIndex(where: { $0.date > now })
        else {
            completion(Timeline(entries: [.recovery(.stale, at: now)], policy: .after(now.addingTimeInterval(30 * 60))))
            return
        }

        var entries = [readyEntry(
            at: now,
            index: currentIndex,
            snapshot: loaded.snapshot,
            prayers: loaded.prayers,
            generated: loaded.generated
        )]

        if currentIndex + 1 < loaded.prayers.count {
            for index in (currentIndex + 1)..<loaded.prayers.count {
                let transition = loaded.prayers[index - 1].date
                guard transition < loaded.expires else { break }
                entries.append(readyEntry(
                    at: transition,
                    index: index,
                    snapshot: loaded.snapshot,
                    prayers: loaded.prayers,
                    generated: loaded.generated
                ))
            }
        }

        let finalTransition = min(loaded.prayers.last?.date ?? loaded.expires, loaded.expires)
        if finalTransition > now {
            entries.append(.recovery(.stale, at: finalTransition))
        }

        completion(Timeline(entries: entries, policy: .after(loaded.expires)))
    }

    private func currentEntry() -> PrayerEntry {
        let now = Date()
        guard let loaded = loadSnapshot() else { return .recovery(.setup, at: now) }
        guard loaded.expires > now,
              let index = loaded.prayers.firstIndex(where: { $0.date > now })
        else { return .recovery(.stale, at: now) }

        return readyEntry(
            at: now,
            index: index,
            snapshot: loaded.snapshot,
            prayers: loaded.prayers,
            generated: loaded.generated
        )
    }
}

private struct PrayerRecoveryView: View {
    let stale: Bool
    @Environment(\.widgetFamily) private var family

    @ViewBuilder
    var body: some View {
        Group {
            switch family {
            case .accessoryInline:
                Label(stale ? "Refresh prayer times" : "Set up prayer times", systemImage: "moon.stars.fill")
            case .accessoryCircular:
                VStack(spacing: 1) {
                    Image(systemName: stale ? "arrow.clockwise" : "moon.stars.fill")
                    Text(stale ? "Refresh" : "Setup")
                        .font(.caption2)
                }
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 2) {
                    Text(stale ? "Refresh prayer times" : "Set up prayer times")
                        .font(.headline)
                    Text("Open Deen Companion")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            default:
                VStack(alignment: .leading, spacing: 8) {
                    Label("Deen Companion", systemImage: "moon.stars.fill")
                        .font(.caption.weight(.semibold))
                    Spacer(minLength: 0)
                    Text(stale ? "Prayer times need refreshing" : "Set up prayer times")
                        .font(.headline)
                        .fixedSize(horizontal: false, vertical: true)
                    Text("Open Deen Companion")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(16)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

private struct PrayerCountdown: View {
    let target: Date?

    var body: some View {
        if let target, target > Date() {
            Text(target, style: .relative)
        } else {
            Text("now")
        }
    }
}

struct PrayerSmallView: View {
    let entry: PrayerEntry
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("DEEN COMPANION")
                .font(.caption2.weight(.semibold))
                .tracking(0.4)
                .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))

            Spacer(minLength: 6)

            Text(entry.prayerName)
                .font(.title2.bold())
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                .lineLimit(1)

            Text(entry.prayerTime)
                .font(.headline.monospacedDigit())
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))

            Spacer(minLength: 6)

            PrayerCountdown(target: entry.targetDate)
                .font(.caption.weight(.semibold))
                .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                .lineLimit(1)

            if !entry.dateLabel.isEmpty {
                Text(entry.dateLabel)
                    .font(.caption2)
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Next prayer, \(entry.prayerName), at \(entry.prayerTime)")
    }
}

private struct UpcomingPrayerRow: View {
    let prayer: ResolvedPrayer

    var body: some View {
        HStack(spacing: 8) {
            Text(prayer.name)
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer(minLength: 8)
            Text(prayer.time)
                .font(.caption.weight(.semibold).monospacedDigit())
        }
    }
}

struct PrayerMediumView: View {
    let entry: PrayerEntry
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        HStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 3) {
                Text("NEXT PRAYER")
                    .font(.caption2.weight(.semibold))
                    .tracking(0.4)
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                Text(entry.prayerName)
                    .font(.largeTitle.bold())
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
                Text(entry.prayerTime)
                    .font(.title3.weight(.semibold).monospacedDigit())
                PrayerCountdown(target: entry.targetDate)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("UPCOMING")
                    .font(.caption2.weight(.semibold))
                    .tracking(0.4)
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                ForEach(entry.upcoming) { prayer in
                    UpcomingPrayerRow(prayer: prayer)
                }
                Spacer(minLength: 0)
                if !entry.dateLabel.isEmpty {
                    Text(entry.dateLabel)
                        .font(.caption2)
                        .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                        .lineLimit(2)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
    }
}

struct PrayerAccessoryRectangularView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(entry.prayerName)
                .font(.headline.bold())
                .widgetAccentable()
            Text(entry.prayerTime)
                .font(.subheadline.monospacedDigit())
            PrayerCountdown(target: entry.targetDate)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
    }
}

struct PrayerAccessoryCircularView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(spacing: 1) {
            Text(String(entry.prayerName.prefix(3)))
                .font(.caption2.weight(.semibold))
                .widgetAccentable()
            Text(entry.prayerTime.replacingOccurrences(of: " ", with: ""))
                .font(.system(.caption2, design: .rounded, weight: .bold).monospacedDigit())
                .minimumScaleFactor(0.55)
                .lineLimit(1)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(entry.prayerName) at \(entry.prayerTime)")
    }
}

struct PrayerAccessoryInlineView: View {
    let entry: PrayerEntry

    var body: some View {
        Label("\(entry.prayerName) · \(entry.prayerTime)", systemImage: "moon.stars.fill")
    }
}

struct PrayerWidgetEntryView: View {
    let entry: PrayerEntry
    @Environment(\.widgetFamily) private var family

    @ViewBuilder
    var body: some View {
        if entry.status != .ready {
            PrayerRecoveryView(stale: entry.status == .stale)
        } else {
            switch family {
            case .systemSmall:
                PrayerSmallView(entry: entry)
            case .systemMedium:
                PrayerMediumView(entry: entry)
            case .accessoryRectangular:
                PrayerAccessoryRectangularView(entry: entry)
            case .accessoryCircular:
                PrayerAccessoryCircularView(entry: entry)
            case .accessoryInline:
                PrayerAccessoryInlineView(entry: entry)
            default:
                PrayerSmallView(entry: entry)
            }
        }
    }
}

struct PrayerWidget: Widget {
    let kind = "PrayerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
                .widgetURL(URL(string: "com.deencompanion.app:///times"))
        }
        .configurationDisplayName("Next Prayer")
        .description("Next prayer, time, and a concise countdown.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .accessoryRectangular,
            .accessoryCircular,
            .accessoryInline,
        ])
        .contentMarginsDisabled()
    }
}

#Preview(as: .systemSmall) {
    PrayerWidget()
} timeline: {
    PrayerEntry(
        date: .now,
        prayerName: "Asr",
        prayerTime: "4:36 PM",
        targetDate: Date().addingTimeInterval(6_120),
        upcoming: [],
        dateLabel: "27 Rabi al-Awwal 1448",
        status: .ready
    )
}

#Preview(as: .systemMedium) {
    PrayerWidget()
} timeline: {
    PrayerEntry(
        date: .now,
        prayerName: "Asr",
        prayerTime: "4:36 PM",
        targetDate: Date().addingTimeInterval(6_120),
        upcoming: [],
        dateLabel: "27 Rabi al-Awwal 1448",
        status: .ready
    )
}
