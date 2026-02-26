import WidgetKit
import SwiftUI

// MARK: - Data Model

struct VerseEntry: TimelineEntry {
    let date: Date
    let type: String
    let arabic: String
    let translation: String
    let source: String
}

// MARK: - Timeline Provider

struct VerseProvider: TimelineProvider {
    func placeholder(in context: Context) -> VerseEntry {
        VerseEntry(
            date: Date(),
            type: "quran",
            arabic: "\u{0628}\u{0650}\u{0633}\u{0652}\u{0645}\u{0650} \u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0670}\u{0647}\u{0650} \u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0652}\u{0645}\u{064E}\u{0670}\u{0646}\u{0650} \u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0650}\u{064A}\u{0645}\u{0650}",
            translation: "In the name of Allah, the Most Gracious, the Most Merciful.",
            source: "Surah Al-Fatiha 1:1"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let entry = currentEntry()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func currentEntry() -> VerseEntry {
        let arabic = SharedDefaults.verseArabic
        let translation = SharedDefaults.verseTranslation
        let source = SharedDefaults.verseSource
        let type = SharedDefaults.verseType

        if arabic.isEmpty {
            return VerseEntry(
                date: Date(),
                type: "quran",
                arabic: "\u{0628}\u{0650}\u{0633}\u{0652}\u{0645}\u{0650} \u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0670}\u{0647}\u{0650} \u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0652}\u{0645}\u{064E}\u{0670}\u{0646}\u{0650} \u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0650}\u{064A}\u{0645}\u{0650}",
                translation: "Open the app to load today's verse.",
                source: ""
            )
        }
        return VerseEntry(date: Date(), type: type, arabic: arabic, translation: translation, source: source)
    }
}

// MARK: - Medium Widget View

struct VerseMediumView: View {
    let entry: VerseEntry
    @Environment(\.colorScheme) var colorScheme

    var icon: String { entry.type == "hadith" ? "text.quote" : "book.closed.fill" }
    var label: String { entry.type == "hadith" ? "Hadith of the Day" : "Ayah of the Day" }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                WidgetHeader(icon: icon, title: label)
                Spacer()
                if entry.type == "quran" {
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 18))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme).opacity(0.6))
                }
            }

            Text(entry.arabic)
                .font(.system(size: 15, weight: .medium))
                .environment(\.layoutDirection, .rightToLeft)
                .multilineTextAlignment(.trailing)
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))

            Text(entry.translation)
                .font(.system(size: 12))
                .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .leading)

            Spacer(minLength: 0)

            if !entry.source.isEmpty {
                HStack {
                    Text(entry.source)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme).opacity(0.8))
                    Spacer()
                    Image(systemName: "book.closed")
                        .font(.system(size: 10))
                        .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme).opacity(0.5))
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

// MARK: - Large Widget View

struct VerseLargeView: View {
    let entry: VerseEntry
    @Environment(\.colorScheme) var colorScheme

    var icon: String { entry.type == "hadith" ? "text.quote" : "book.closed.fill" }
    var label: String { entry.type == "hadith" ? "Hadith of the Day" : "Ayah of the Day" }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            WidgetHeader(icon: icon, title: label)

            Rectangle()
                .fill(WidgetTheme.accent(for: colorScheme).opacity(0.2))
                .frame(height: 1)

            Text(entry.arabic)
                .font(.system(size: 20, weight: .medium))
                .environment(\.layoutDirection, .rightToLeft)
                .multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                .lineSpacing(6)
                .lineLimit(6)

            Text(entry.translation)
                .font(.subheadline)
                .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                .lineSpacing(4)
                .frame(maxWidth: .infinity, alignment: .leading)
                .lineLimit(5)

            Spacer()

            if !entry.source.isEmpty {
                HStack(spacing: 4) {
                    Image(systemName: icon)
                        .font(.caption2)
                    Text(entry.source)
                        .font(.caption)
                }
                .foregroundStyle(WidgetTheme.accent(for: colorScheme))
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

// MARK: - Entry View

struct VerseWidgetEntryView: View {
    let entry: VerseEntry
    @Environment(\.widgetFamily) var family

    var deepLinkURL: URL {
        let path = entry.type == "hadith" ? "/hadith" : "/quran"
        return URL(string: "deencompanion://\(path)") ?? URL(string: "https://ramadan-companion.vercel.app")!
    }

    var body: some View {
        Group {
            switch family {
            case .systemMedium:
                VerseMediumView(entry: entry)
            case .systemLarge:
                VerseLargeView(entry: entry)
            default:
                VerseMediumView(entry: entry)
            }
        }
        .widgetURL(deepLinkURL)
    }
}

// MARK: - Widget Configuration

struct VerseWidget: Widget {
    let kind = "VerseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VerseProvider()) { entry in
            VerseWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Ayah of the Day")
        .description("Daily Quran verse or Hadith with Arabic text and translation.")
        .supportedFamilies([.systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemMedium) {
    VerseWidget()
} timeline: {
    VerseEntry(
        date: .now,
        type: "quran",
        arabic: "\u{0625}\u{0650}\u{0646}\u{0651}\u{064E}\u{0645}\u{064E}\u{0627} \u{064A}\u{064E}\u{062E}\u{0652}\u{0634}\u{064E}\u{0649} \u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0670}\u{0647}\u{064E} \u{0645}\u{0650}\u{0646}\u{0652} \u{0639}\u{0650}\u{0628}\u{064E}\u{0627}\u{062F}\u{0650}\u{0647}\u{0650} \u{0671}\u{0644}\u{0652}\u{0639}\u{064F}\u{0644}\u{064E}\u{0645}\u{064E}\u{0670}\u{0653}\u{0624}\u{064F}\u{0627}\u{06DF}",
        translation: "Only those fear Allah, from among His servants, who have knowledge.",
        source: "Surah Fatir 35:28"
    )
}

#Preview(as: .systemLarge) {
    VerseWidget()
} timeline: {
    VerseEntry(
        date: .now,
        type: "hadith",
        arabic: "\u{0625}\u{0650}\u{0646}\u{0651}\u{064E}\u{0645}\u{064E}\u{0627} \u{0627}\u{0644}\u{0623}\u{064E}\u{0639}\u{0652}\u{0645}\u{064E}\u{0627}\u{0644}\u{064F} \u{0628}\u{0650}\u{0627}\u{0644}\u{0646}\u{0651}\u{0650}\u{064A}\u{0651}\u{064E}\u{0627}\u{062A}\u{0650}",
        translation: "Actions are judged by their intentions.",
        source: "Sahih al-Bukhari #1"
    )
}
