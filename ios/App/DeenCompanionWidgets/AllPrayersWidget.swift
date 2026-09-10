import WidgetKit
import SwiftUI

// MARK: - Entry

private enum AllPrayersStatus {
    case ready
    case setup
    case stale
}

struct AllPrayersEntry: TimelineEntry {
    let date: Date
    let fajr: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let nextPrayer: String
    let headerTitle: String
    fileprivate let status: AllPrayersStatus

    fileprivate static func recovery(_ status: AllPrayersStatus, at date: Date = Date()) -> AllPrayersEntry {
        AllPrayersEntry(
            date: date,
            fajr: "—",
            dhuhr: "—",
            asr: "—",
            maghrib: "—",
            isha: "—",
            nextPrayer: "",
            headerTitle: status == .stale ? "Prayer Times" : "Daily Prayers",
            status: status
        )
    }
}

// MARK: - Snapshot decode (mirrors PrayerWidget contract)

private struct AllPrayersCachedPrayer: Decodable {
    let name: String
    let time: String
    let timestamp: String
    let dayKey: String
}

private struct AllPrayersCachedSnapshot: Decodable {
    let version: Int
    let expiresAt: String
    let prayers: [AllPrayersCachedPrayer]
}

private func allPrayersParseISO8601(_ value: String) -> Date? {
    let fractional = ISO8601DateFormatter()
    fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return fractional.date(from: value) ?? ISO8601DateFormatter().date(from: value)
}

private func loadAllPrayersSnapshot() -> (prayers: [AllPrayersCachedPrayer], expires: Date)? {
    guard
        let data = SharedDefaults.prayerSnapshotJSON.data(using: .utf8),
        data.count <= 64 * 1024,
        let snapshot = try? JSONDecoder().decode(AllPrayersCachedSnapshot.self, from: data),
        snapshot.version == 1,
        snapshot.prayers.count <= 70,
        let expires = allPrayersParseISO8601(snapshot.expiresAt)
    else { return nil }

    let allowed = Set(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"])
    let prayers = snapshot.prayers.filter { prayer in
        allowed.contains(prayer.name) &&
            !prayer.time.isEmpty &&
            prayer.time.count <= 16 &&
            prayer.dayKey.range(of: #"^\d{4}-\d{2}-\d{2}$"#, options: .regularExpression) != nil &&
            allPrayersParseISO8601(prayer.timestamp) != nil
    }
    guard !prayers.isEmpty else { return nil }
    return (prayers, expires)
}

private func dayKeyString(for date: Date) -> String {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.timeZone = .current
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
}

private func allPrayersEntry(at entryDate: Date) -> AllPrayersEntry {
    guard let loaded = loadAllPrayersSnapshot() else {
        return .recovery(.setup, at: entryDate)
    }
    guard loaded.expires > entryDate else {
        return .recovery(.stale, at: entryDate)
    }

    let dated = loaded.prayers.compactMap { prayer -> (AllPrayersCachedPrayer, Date)? in
        guard let date = allPrayersParseISO8601(prayer.timestamp) else { return nil }
        return (prayer, date)
    }.sorted { $0.1 < $1.1 }

    guard let next = dated.first(where: { $0.1 > entryDate }) else {
        return .recovery(.stale, at: entryDate)
    }

    let todayKey = dayKeyString(for: entryDate)
    let todayPrayers = dated.filter { $0.0.dayKey == todayKey }
    let displayDayKey = todayPrayers.count >= 5 ? todayKey : next.0.dayKey
    let dayPrayers = dated.filter { $0.0.dayKey == displayDayKey }
    let byName = Dictionary(uniqueKeysWithValues: dayPrayers.map { ($0.0.name, $0.0.time) })

    let header = displayDayKey == todayKey ? "Daily Prayers" : "Tomorrow"

    return AllPrayersEntry(
        date: entryDate,
        fajr: byName["Fajr"] ?? "—",
        dhuhr: byName["Dhuhr"] ?? "—",
        asr: byName["Asr"] ?? "—",
        maghrib: byName["Maghrib"] ?? "—",
        isha: byName["Isha"] ?? "—",
        nextPrayer: next.0.name,
        headerTitle: header,
        status: .ready
    )
}

// MARK: - Provider

struct AllPrayersProvider: TimelineProvider {
    func placeholder(in context: Context) -> AllPrayersEntry {
        AllPrayersEntry(
            date: Date(),
            fajr: "5:30 AM",
            dhuhr: "1:05 PM",
            asr: "4:30 PM",
            maghrib: "6:15 PM",
            isha: "7:45 PM",
            nextPrayer: "Asr",
            headerTitle: "Daily Prayers",
            status: .ready
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (AllPrayersEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : allPrayersEntry(at: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AllPrayersEntry>) -> Void) {
        let now = Date()
        guard let loaded = loadAllPrayersSnapshot() else {
            completion(Timeline(entries: [.recovery(.setup, at: now)], policy: .after(now.addingTimeInterval(30 * 60))))
            return
        }

        let dated = loaded.prayers.compactMap { prayer -> (AllPrayersCachedPrayer, Date)? in
            guard let date = allPrayersParseISO8601(prayer.timestamp) else { return nil }
            return (prayer, date)
        }.sorted { $0.1 < $1.1 }

        guard loaded.expires > now, dated.contains(where: { $0.1 > now }) else {
            completion(Timeline(entries: [.recovery(.stale, at: now)], policy: .after(now.addingTimeInterval(30 * 60))))
            return
        }

        var entries = [allPrayersEntry(at: now)]
        for (prayer, date) in dated where date > now && date < loaded.expires {
            entries.append(allPrayersEntry(at: date))
        }
        if loaded.expires > now {
            entries.append(.recovery(.stale, at: loaded.expires))
        }

        completion(Timeline(entries: entries, policy: .after(loaded.expires)))
    }
}

// MARK: - UI

private struct AllPrayersColumn: View {
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

private struct AllPrayersMediumView: View {
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
            WidgetHeader(icon: "sun.and.horizon.fill", title: entry.headerTitle)

            if entry.status != .ready {
                Spacer(minLength: 0)
                Text(entry.status == .stale ? "Prayer times need refreshing" : "Set up prayer times")
                    .font(.headline)
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                Text("Open Deen Companion")
                    .font(.caption)
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                Spacer(minLength: 0)
            } else {
                HStack(spacing: 5) {
                    ForEach(prayers, id: \.name) { prayer in
                        AllPrayersColumn(
                            name: prayer.name,
                            time: prayer.time,
                            isNext: prayer.name == entry.nextPrayer
                        )
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct AllPrayersWidgetEntryView: View {
    let entry: AllPrayersEntry

    var body: some View {
        AllPrayersMediumView(entry: entry)
            .widgetURL(URL(string: "com.deencompanion.app:///times"))
    }
}

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

#Preview(as: .systemMedium) {
    AllPrayersWidget()
} timeline: {
    AllPrayersEntry(
        date: .now,
        fajr: "5:30 AM",
        dhuhr: "1:05 PM",
        asr: "4:30 PM",
        maghrib: "6:15 PM",
        isha: "7:45 PM",
        nextPrayer: "Asr",
        headerTitle: "Daily Prayers",
        status: .ready
    )
}
