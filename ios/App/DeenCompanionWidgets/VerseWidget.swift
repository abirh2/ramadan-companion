import WidgetKit
import SwiftUI

// MARK: - Data Model

struct VerseEntry: TimelineEntry {
    let date: Date
    /// "quran" or "hadith" — determines deep-link and icon
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
            arabic: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
            translation: "In the name of Allah, the Most Gracious, the Most Merciful.",
            source: "Surah Al-Fatiha 1:1"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let entry = currentEntry()
        // Refresh once per hour; the app updates storage when it fetches daily content.
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
                arabic: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                translation: "Open the app to load today's verse.",
                source: ""
            )
        }
        return VerseEntry(date: Date(), type: type, arabic: arabic, translation: translation, source: source)
    }
}

// MARK: - Shared Verse Header

private struct VerseTypeLabel: View {
    let type: String

    var icon: String { type == "hadith" ? "text.quote" : "book.closed.fill" }
    var label: String { type == "hadith" ? "Hadith of the Day" : "Verse of the Day" }

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundStyle(Color(red: 0.06, green: 0.24, blue: 0.24))
            Text(label)
                .font(.caption2.weight(.medium))
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Medium Widget View (Arabic + truncated translation)

struct VerseMediumView: View {
    let entry: VerseEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            VerseTypeLabel(type: entry.type)

            // Arabic text — always RTL, larger, prominent
            Text(entry.arabic)
                .font(.system(size: 16, weight: .medium, design: .default))
                .environment(\.layoutDirection, .rightToLeft)
                .multilineTextAlignment(.trailing)
                .lineLimit(3)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .foregroundStyle(.primary)

            // English translation — smaller, secondary
            Text(entry.translation)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .leading)

            Spacer(minLength: 0)

            if !entry.source.isEmpty {
                Text(entry.source)
                    .font(.caption2)
                    .foregroundStyle(Color(red: 0.06, green: 0.24, blue: 0.24).opacity(0.8))
                    .lineLimit(1)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

// MARK: - Large Widget View (Full content)

struct VerseLargeView: View {
    let entry: VerseEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VerseTypeLabel(type: entry.type)

            Divider()
                .background(Color(red: 0.06, green: 0.24, blue: 0.24).opacity(0.2))

            // Arabic text — full, RTL
            Text(entry.arabic)
                .font(.system(size: 20, weight: .medium, design: .default))
                .environment(\.layoutDirection, .rightToLeft)
                .multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .foregroundStyle(.primary)
                .lineSpacing(6)

            // English translation — full text
            Text(entry.translation)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineSpacing(4)
                .frame(maxWidth: .infinity, alignment: .leading)

            Spacer()

            if !entry.source.isEmpty {
                HStack {
                    Image(systemName: entry.type == "hadith" ? "text.quote" : "book.closed")
                        .font(.caption2)
                    Text(entry.source)
                        .font(.caption)
                }
                .foregroundStyle(Color(red: 0.06, green: 0.24, blue: 0.24))
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

    // Deep-link URL to open the correct section in the app
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
                .containerBackground(.ultraThinMaterial, for: .widget)
        }
        .configurationDisplayName("Verse of the Day")
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
        arabic: "إِنَّمَا يَخْشَى ٱللَّٰهَ مِنْ عِبَادِهِ ٱلْعُلَمَٰٓؤُا۟",
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
        arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
        translation: "Actions are judged by their intentions.",
        source: "Sahih al-Bukhari #1"
    )
}
