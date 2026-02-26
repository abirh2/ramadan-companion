import WidgetKit
import SwiftUI

// MARK: - Data Model

struct HijriEntry: TimelineEntry {
    let date: Date
    let hijriDay: String
    let hijriMonthName: String
    let hijriYear: String
    let gregorianDate: String
    let weekday: String
}

// MARK: - Timeline Provider

struct HijriProvider: TimelineProvider {
    func placeholder(in context: Context) -> HijriEntry {
        HijriEntry(
            date: Date(),
            hijriDay: "14", hijriMonthName: "Ramadan", hijriYear: "1447",
            gregorianDate: "Feb 26", weekday: "Friday"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (HijriEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HijriEntry>) -> Void) {
        let entry = currentEntry()
        // Refresh at midnight for the new day
        let calendar = Calendar.current
        let tomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: Date()) ?? Date())
        completion(Timeline(entries: [entry], policy: .after(tomorrow)))
    }

    private func currentEntry() -> HijriEntry {
        let day = SharedDefaults.hijriDay
        if day.isEmpty {
            return HijriEntry(
                date: Date(),
                hijriDay: "--", hijriMonthName: "Open app", hijriYear: "",
                gregorianDate: "", weekday: ""
            )
        }
        return HijriEntry(
            date: Date(),
            hijriDay: day,
            hijriMonthName: SharedDefaults.hijriMonthName,
            hijriYear: SharedDefaults.hijriYear,
            gregorianDate: SharedDefaults.hijriGregorianDate,
            weekday: SharedDefaults.hijriWeekday
        )
    }
}

// MARK: - Small Widget View

struct HijriSmallView: View {
    let entry: HijriEntry
    @Environment(\.colorScheme) var colorScheme

    private var isJummah: Bool {
        entry.weekday.lowercased() == "friday"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Image(systemName: "calendar")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                    .frame(width: 22, height: 22)
                    .background(
                        Circle()
                            .fill(WidgetTheme.highlightFill(for: colorScheme))
                    )

                Spacer()

                if isJummah {
                    PillBadge(text: "Jummah", color: WidgetTheme.gold)
                }
            }

            Spacer(minLength: 4)

            Text(entry.hijriDay)
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                .lineLimit(1)

            Text(entry.hijriMonthName)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            Spacer(minLength: 2)

            if !entry.gregorianDate.isEmpty {
                Text(entry.gregorianDate)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
            }
            if !entry.hijriYear.isEmpty {
                Text("\(entry.hijriYear) AH")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme).opacity(0.7))
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

// MARK: - Lock Screen Views

@available(iOS 16.0, *)
struct HijriAccessoryRectangularView: View {
    let entry: HijriEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(entry.hijriDay) \(entry.hijriMonthName)")
                .font(.headline.bold())
                .widgetAccentable()
            Text("\(entry.hijriYear) AH")
                .font(.subheadline)
            if !entry.gregorianDate.isEmpty {
                Text(entry.gregorianDate)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

@available(iOS 16.0, *)
struct HijriAccessoryInlineView: View {
    let entry: HijriEntry

    var body: some View {
        Label("\(entry.hijriDay) \(entry.hijriMonthName) \(entry.hijriYear)", systemImage: "calendar")
    }
}

// MARK: - Entry View

struct HijriWidgetEntryView: View {
    let entry: HijriEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            HijriSmallView(entry: entry)
        case .accessoryRectangular:
            if #available(iOS 16.0, *) {
                HijriAccessoryRectangularView(entry: entry)
            }
        case .accessoryInline:
            if #available(iOS 16.0, *) {
                HijriAccessoryInlineView(entry: entry)
            }
        default:
            HijriSmallView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration

struct HijriDateWidget: Widget {
    let kind = "HijriDateWidget"

    private var supportedFamilies: [WidgetFamily] {
        var families: [WidgetFamily] = [.systemSmall]
        if #available(iOS 16.0, *) {
            families.append(contentsOf: [.accessoryRectangular, .accessoryInline])
        }
        return families
    }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HijriProvider()) { entry in
            HijriWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Islamic Date")
        .description("Hijri calendar date with Gregorian reference.")
        .supportedFamilies(supportedFamilies)
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    HijriDateWidget()
} timeline: {
    HijriEntry(
        date: .now,
        hijriDay: "14", hijriMonthName: "Ramadan", hijriYear: "1447",
        gregorianDate: "Feb 26", weekday: "Friday"
    )
}
