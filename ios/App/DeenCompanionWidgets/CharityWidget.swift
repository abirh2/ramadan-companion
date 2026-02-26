import WidgetKit
import SwiftUI

// MARK: - Data Model

struct CharityEntry: TimelineEntry {
    let date: Date
    let monthly: String
    let yearly: String
    let currency: String
}

// MARK: - Timeline Provider

struct CharityProvider: TimelineProvider {
    func placeholder(in context: Context) -> CharityEntry {
        CharityEntry(date: Date(), monthly: "$45.00", yearly: "$540.00", currency: "$")
    }

    func getSnapshot(in context: Context, completion: @escaping (CharityEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CharityEntry>) -> Void) {
        let entry = currentEntry()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func currentEntry() -> CharityEntry {
        let monthly = SharedDefaults.charityMonthly
        if monthly.isEmpty {
            return CharityEntry(date: Date(), monthly: "--", yearly: "--", currency: "$")
        }
        return CharityEntry(
            date: Date(),
            monthly: monthly,
            yearly: SharedDefaults.charityYearly,
            currency: SharedDefaults.charityCurrency
        )
    }
}

// MARK: - Small Widget View

struct CharitySmallView: View {
    let entry: CharityEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Icon
            Image(systemName: "heart.fill")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                .frame(width: 28, height: 28)
                .background(
                    Circle()
                        .fill(WidgetTheme.highlightFill(for: colorScheme))
                )

            Spacer(minLength: 8)

            // Monthly
            VStack(alignment: .leading, spacing: 1) {
                Text("MONTHLY")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                    .tracking(0.5)
                Text(entry.monthly)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
            }

            Spacer(minLength: 6)

            // Yearly
            VStack(alignment: .leading, spacing: 1) {
                Text("YEARLY")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                    .tracking(0.5)
                Text(entry.yearly)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

// MARK: - Entry View

struct CharityWidgetEntryView: View {
    let entry: CharityEntry

    var body: some View {
        CharitySmallView(entry: entry)
            .widgetURL(URL(string: "deencompanion:///charity"))
    }
}

// MARK: - Widget Configuration

struct CharityWidget: Widget {
    let kind = "CharityWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CharityProvider()) { entry in
            CharityWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Charity Tracker")
        .description("Monthly and yearly donation totals.")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    CharityWidget()
} timeline: {
    CharityEntry(date: .now, monthly: "$45.00", yearly: "$540.00", currency: "$")
}
