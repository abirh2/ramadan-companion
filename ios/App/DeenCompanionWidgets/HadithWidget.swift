import WidgetKit
import SwiftUI

// MARK: - Data Model (reuses verse data from SharedDefaults)

struct HadithEntry: TimelineEntry {
    let date: Date
    let translation: String
    let source: String
}

// MARK: - Timeline Provider

struct HadithProvider: TimelineProvider {
    func placeholder(in context: Context) -> HadithEntry {
        HadithEntry(
            date: Date(),
            translation: "Faith consists of more than sixty branches. And Haya (modesty) is a part of faith.",
            source: "Sahih Bukhari"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (HadithEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HadithEntry>) -> Void) {
        let entry = currentEntry()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func currentEntry() -> HadithEntry {
        let type = SharedDefaults.verseType
        let translation = SharedDefaults.verseTranslation
        let source = SharedDefaults.verseSource

        if type == "hadith" && !translation.isEmpty {
            return HadithEntry(date: Date(), translation: translation, source: source)
        }

        return HadithEntry(
            date: Date(),
            translation: "Open the app to load today's hadith.",
            source: ""
        )
    }
}

// MARK: - Medium Widget View

struct HadithMediumView: View {
    let entry: HadithEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "quote.opening")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                    Text("HADITH OF THE DAY")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                        .tracking(0.5)
                }
                Spacer()
                PillBadge(text: "Sahih")
            }

            Spacer(minLength: 6)

            // Quote text
            Text("\u{201C}\(entry.translation)\u{201D}")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                .lineSpacing(2)
                .lineLimit(4)
                .minimumScaleFactor(0.8)

            Spacer(minLength: 6)

            // Source attribution
            if !entry.source.isEmpty {
                Text(entry.source)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

// MARK: - Entry View

struct HadithWidgetEntryView: View {
    let entry: HadithEntry

    var body: some View {
        HadithMediumView(entry: entry)
            .widgetURL(URL(string: "deencompanion:///hadith"))
    }
}

// MARK: - Widget Configuration

struct HadithWidget: Widget {
    let kind = "HadithWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HadithProvider()) { entry in
            HadithWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Hadith of the Day")
        .description("Daily hadith with scholarly attribution.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemMedium) {
    HadithWidget()
} timeline: {
    HadithEntry(
        date: .now,
        translation: "The strong man is not the one who can overpower others. Rather, the strong man is the one who controls himself when he is angry.",
        source: "Sahih Bukhari"
    )
}
