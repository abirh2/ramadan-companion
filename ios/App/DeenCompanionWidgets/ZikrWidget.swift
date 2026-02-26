import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Data Model

struct ZikrEntry: TimelineEntry {
    let date: Date
    let arabic: String
    let transliteration: String
    let count: Int
    let target: Int
}

// MARK: - Timeline Provider

struct ZikrProvider: TimelineProvider {
    func placeholder(in context: Context) -> ZikrEntry {
        ZikrEntry(date: Date(), arabic: "سُبْحَانَ ٱللَّٰهِ", transliteration: "SubhanAllah", count: 12, target: 33)
    }

    func getSnapshot(in context: Context, completion: @escaping (ZikrEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ZikrEntry>) -> Void) {
        let entry = currentEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func currentEntry() -> ZikrEntry {
        ZikrEntry(
            date: Date(),
            arabic: SharedDefaults.zikrArabic,
            transliteration: SharedDefaults.zikrTransliteration,
            count: SharedDefaults.zikrCount,
            target: SharedDefaults.zikrTarget
        )
    }
}

// MARK: - Theme Color

private let tealAccent = Color(red: 0.06, green: 0.24, blue: 0.24)

// MARK: - Progress Ring

private struct ProgressRing: View {
    let progress: Double
    let lineWidth: CGFloat

    var body: some View {
        ZStack {
            Circle()
                .stroke(tealAccent.opacity(0.12), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: min(progress, 1.0))
                .stroke(tealAccent, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 0.3), value: progress)
        }
    }
}

// MARK: - Shared Content Views (used by both interactive and fallback)

private struct ZikrSmallContent: View {
    let entry: ZikrEntry

    var progress: Double {
        entry.target > 0 ? min(Double(entry.count) / Double(entry.target), 1.0) : 0
    }

    var isComplete: Bool { entry.target > 0 && entry.count >= entry.target }

    var body: some View {
        ZStack {
            ProgressRing(progress: progress, lineWidth: 6)
                .padding(4)

            VStack(spacing: 2) {
                Text(entry.arabic)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(isComplete ? tealAccent : Color.primary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.6)

                Text("\(entry.count)")
                    .font(.title2.bold().monospacedDigit())
                    .foregroundStyle(isComplete ? tealAccent : Color.primary)

                if entry.target > 0 {
                    Text("/ \(entry.target)")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(10)
    }
}

private struct ZikrMediumContent: View {
    let entry: ZikrEntry

    var progress: Double {
        entry.target > 0 ? min(Double(entry.count) / Double(entry.target), 1.0) : 0
    }

    var isComplete: Bool { entry.target > 0 && entry.count >= entry.target }

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                ProgressRing(progress: progress, lineWidth: 8)
                VStack(spacing: 0) {
                Text("\(entry.count)")
                    .font(.title.bold().monospacedDigit())
                    .foregroundStyle(isComplete ? tealAccent : Color.primary)
                    if entry.target > 0 {
                        Text("/ \(entry.target)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .frame(width: 80, height: 80)

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Image(systemName: "hand.raised.fill")
                        .font(.caption2)
                        .foregroundStyle(tealAccent)
                    Text("Tasbeeh")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                Text(entry.arabic)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(.primary)
                    .lineLimit(2)

                Text(entry.transliteration)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                if isComplete {
                    Label("Complete", systemImage: "checkmark.circle.fill")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(tealAccent)
                }
            }

            Spacer()
        }
        .padding(16)
    }
}

// MARK: - Interactive Views (iOS 17+)

@available(iOS 17.0, *)
struct ZikrSmallInteractiveView: View {
    let entry: ZikrEntry

    var body: some View {
        Button(intent: IncrementZikrIntent()) {
            ZikrSmallContent(entry: entry)
        }
        .buttonStyle(.plain)
    }
}

@available(iOS 17.0, *)
struct ZikrMediumInteractiveView: View {
    let entry: ZikrEntry

    var body: some View {
        Button(intent: IncrementZikrIntent()) {
            ZikrMediumContent(entry: entry)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Fallback Views (iOS 15/16)

struct ZikrSmallFallbackView: View {
    let entry: ZikrEntry

    var body: some View {
        ZikrSmallContent(entry: entry)
            .widgetURL(URL(string: "deencompanion:///zikr"))
    }
}

struct ZikrMediumFallbackView: View {
    let entry: ZikrEntry

    var body: some View {
        ZikrMediumContent(entry: entry)
            .widgetURL(URL(string: "deencompanion:///zikr"))
    }
}

// MARK: - Entry View

struct ZikrWidgetEntryView: View {
    let entry: ZikrEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            if #available(iOS 17.0, *) {
                ZikrSmallInteractiveView(entry: entry)
            } else {
                ZikrSmallFallbackView(entry: entry)
            }
        case .systemMedium:
            if #available(iOS 17.0, *) {
                ZikrMediumInteractiveView(entry: entry)
            } else {
                ZikrMediumFallbackView(entry: entry)
            }
        default:
            if #available(iOS 17.0, *) {
                ZikrSmallInteractiveView(entry: entry)
            } else {
                ZikrSmallFallbackView(entry: entry)
            }
        }
    }
}

// MARK: - Widget Configurations

struct ZikrWidget: Widget {
    let kind = "ZikrWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ZikrProvider()) { entry in
            ZikrWidgetEntryView(entry: entry)
                .containerBackground(.ultraThinMaterial, for: .widget)
        }
        .configurationDisplayName("Zikr Counter")
        .description("Count your daily zikr. Tap to increment (iOS 17+).")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

struct ZikrWidgetClear: Widget {
    let kind = "ZikrWidgetClear"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ZikrProvider()) { entry in
            ZikrWidgetEntryView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Zikr Counter - Clear")
        .description("Zikr counter with transparent background.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    ZikrWidget()
} timeline: {
    ZikrEntry(date: .now, arabic: "سُبْحَانَ ٱللَّٰهِ", transliteration: "SubhanAllah", count: 21, target: 33)
}

#Preview(as: .systemMedium) {
    ZikrWidget()
} timeline: {
    ZikrEntry(date: .now, arabic: "ٱلْحَمْدُ لِلَّٰهِ", transliteration: "Alhamdulillah", count: 33, target: 33)
}
