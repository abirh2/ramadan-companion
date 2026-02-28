import WidgetKit
import SwiftUI

// MARK: - Data Model

struct HadithEntry: TimelineEntry {
    let date: Date
    let arabic: String
    let translation: String
    let source: String
}

// MARK: - Timeline Provider

struct HadithProvider: TimelineProvider {
    func placeholder(in context: Context) -> HadithEntry {
        HadithEntry(
            date: Date(),
            arabic: "\u{0625}\u{0650}\u{0646}\u{0651}\u{064E}\u{0645}\u{064E}\u{0627} \u{0627}\u{0644}\u{0623}\u{064E}\u{0639}\u{0652}\u{0645}\u{064E}\u{0627}\u{0644}\u{064F} \u{0628}\u{0650}\u{0627}\u{0644}\u{0646}\u{0651}\u{0650}\u{064A}\u{0651}\u{064E}\u{0627}\u{062A}\u{0650}",
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
        let arabic = SharedDefaults.hadithArabic
        let translation = SharedDefaults.hadithTranslation
        let source = SharedDefaults.hadithSource

        if translation.isEmpty {
            return HadithEntry(
                date: Date(),
                arabic: "",
                translation: "Open the app to load today's hadith.",
                source: ""
            )
        }

        return HadithEntry(date: Date(), arabic: arabic, translation: translation, source: source)
    }
}

// MARK: - Medium Widget View

struct HadithMediumView: View {
    let entry: HadithEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
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

            Text("\u{201C}\(entry.translation)\u{201D}")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                .lineSpacing(2)
                .lineLimit(4)
                .minimumScaleFactor(0.8)

            Spacer(minLength: 6)

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

// MARK: - Large Widget View

struct HadithLargeView: View {
    let entry: HadithEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "quote.opening")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                    Text("HADITH OF THE DAY")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                        .tracking(0.5)
                }
                Spacer()
                PillBadge(text: "Sahih")
            }

            Rectangle()
                .fill(WidgetTheme.accent(for: colorScheme).opacity(0.2))
                .frame(height: 1)

            if !entry.arabic.isEmpty {
                Text(entry.arabic)
                    .font(.system(size: 18, weight: .medium))
                    .environment(\.layoutDirection, .rightToLeft)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                    .lineSpacing(5)
                    .lineLimit(5)
            }

            Text("\u{201C}\(entry.translation)\u{201D}")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(entry.arabic.isEmpty ? WidgetTheme.primaryText(for: colorScheme) : WidgetTheme.secondaryText(for: colorScheme))
                .lineSpacing(4)
                .frame(maxWidth: .infinity, alignment: .leading)
                .lineLimit(entry.arabic.isEmpty ? 10 : 5)

            Spacer()

            if !entry.source.isEmpty {
                HStack(spacing: 4) {
                    Image(systemName: "text.quote")
                        .font(.caption2)
                    Text(entry.source)
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(WidgetTheme.accent(for: colorScheme))
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

// MARK: - Entry View

struct HadithWidgetEntryView: View {
    let entry: HadithEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            switch family {
            case .systemLarge:
                HadithLargeView(entry: entry)
            default:
                HadithMediumView(entry: entry)
            }
        }
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
        .description("Daily hadith with Arabic text and scholarly attribution.")
        .supportedFamilies([.systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemMedium) {
    HadithWidget()
} timeline: {
    HadithEntry(
        date: .now,
        arabic: "\u{0625}\u{0650}\u{0646}\u{0651}\u{064E}\u{0645}\u{064E}\u{0627} \u{0627}\u{0644}\u{0623}\u{064E}\u{0639}\u{0652}\u{0645}\u{064E}\u{0627}\u{0644}\u{064F} \u{0628}\u{0650}\u{0627}\u{0644}\u{0646}\u{0651}\u{0650}\u{064A}\u{0651}\u{064E}\u{0627}\u{062A}\u{0650}",
        translation: "The strong man is not the one who can overpower others. Rather, the strong man is the one who controls himself when he is angry.",
        source: "Sahih Bukhari"
    )
}

#Preview(as: .systemLarge) {
    HadithWidget()
} timeline: {
    HadithEntry(
        date: .now,
        arabic: "\u{0625}\u{0650}\u{0646}\u{0651}\u{064E}\u{0645}\u{064E}\u{0627} \u{0627}\u{0644}\u{0623}\u{064E}\u{0639}\u{0652}\u{0645}\u{064E}\u{0627}\u{0644}\u{064F} \u{0628}\u{0650}\u{0627}\u{0644}\u{0646}\u{0651}\u{0650}\u{064A}\u{0651}\u{064E}\u{0627}\u{062A}\u{0650}",
        translation: "The strong man is not the one who can overpower others. Rather, the strong man is the one who controls himself when he is angry.",
        source: "Sahih Bukhari"
    )
}
