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
        ZikrEntry(date: Date(), arabic: "\u{0633}\u{064F}\u{0628}\u{0652}\u{062D}\u{064E}\u{0627}\u{0646}\u{064E} \u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0670}\u{0647}\u{0650}", transliteration: "SubhanAllah", count: 12, target: 33)
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

// MARK: - Progress Ring

private struct ProgressRing: View {
    let progress: Double
    let lineWidth: CGFloat
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            Circle()
                .stroke(WidgetTheme.accent(for: colorScheme).opacity(0.12), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: min(progress, 1.0))
                .stroke(WidgetTheme.accent(for: colorScheme), style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 0.3), value: progress)
        }
    }
}

// MARK: - Shared Content Views

private struct ZikrSmallContent: View {
    let entry: ZikrEntry
    @Environment(\.colorScheme) var colorScheme

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
                    .foregroundStyle(isComplete ? WidgetTheme.accent(for: colorScheme) : WidgetTheme.primaryText(for: colorScheme))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.6)

                Text("\(entry.count)")
                    .font(.title2.bold().monospacedDigit())
                    .foregroundStyle(isComplete ? WidgetTheme.accent(for: colorScheme) : WidgetTheme.primaryText(for: colorScheme))

                if entry.target > 0 {
                    Text("/ \(entry.target)")
                        .font(.caption2)
                        .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                }
            }
        }
        .padding(10)
    }
}

private struct ZikrMediumContent: View {
    let entry: ZikrEntry
    @Environment(\.colorScheme) var colorScheme

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
                        .foregroundStyle(isComplete ? WidgetTheme.accent(for: colorScheme) : WidgetTheme.primaryText(for: colorScheme))
                    if entry.target > 0 {
                        Text("/ \(entry.target)")
                            .font(.caption2)
                            .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                    }
                }
            }
            .frame(width: 80, height: 80)

            VStack(alignment: .leading, spacing: 4) {
                WidgetHeader(icon: "hand.raised.fill", title: "Tasbeeh")

                Text(entry.arabic)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                    .lineLimit(2)

                Text(entry.transliteration)
                    .font(.subheadline)
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))

                if isComplete {
                    Label("Complete", systemImage: "checkmark.circle.fill")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
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

// MARK: - Lock Screen Views

@available(iOS 16.0, *)
struct ZikrAccessoryCircularView: View {
    let entry: ZikrEntry

    var progress: Double {
        entry.target > 0 ? min(Double(entry.count) / Double(entry.target), 1.0) : 0
    }

    var body: some View {
        ZStack {
            if entry.target > 0 {
                Gauge(value: progress) {
                    EmptyView()
                }
                .gaugeStyle(.accessoryCircularCapacity)
            }
            VStack(spacing: 0) {
                Text("\(entry.count)")
                    .font(.system(size: 16, weight: .bold).monospacedDigit())
                if entry.target > 0 {
                    Text("/\(entry.target)")
                        .font(.system(size: 8))
                        .foregroundStyle(.secondary)
                }
            }
        }
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
        case .accessoryCircular:
            if #available(iOS 16.0, *) {
                ZikrAccessoryCircularView(entry: entry)
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

// MARK: - Widget Configuration

struct ZikrWidget: Widget {
    let kind = "ZikrWidget"

    private var supportedFamilies: [WidgetFamily] {
        var families: [WidgetFamily] = [.systemSmall, .systemMedium]
        if #available(iOS 16.0, *) {
            families.append(.accessoryCircular)
        }
        return families
    }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ZikrProvider()) { entry in
            ZikrWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Zikr Counter")
        .description("Count your daily zikr. Tap to increment (iOS 17+).")
        .supportedFamilies(supportedFamilies)
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    ZikrWidget()
} timeline: {
    ZikrEntry(date: .now, arabic: "\u{0633}\u{064F}\u{0628}\u{0652}\u{062D}\u{064E}\u{0627}\u{0646}\u{064E} \u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0670}\u{0647}\u{0650}", transliteration: "SubhanAllah", count: 21, target: 33)
}

#Preview(as: .systemMedium) {
    ZikrWidget()
} timeline: {
    ZikrEntry(date: .now, arabic: "\u{0671}\u{0644}\u{0652}\u{062D}\u{064E}\u{0645}\u{0652}\u{062F}\u{064F} \u{0644}\u{0650}\u{0644}\u{0651}\u{064E}\u{0670}\u{0647}\u{0650}", transliteration: "Alhamdulillah", count: 33, target: 33)
}
