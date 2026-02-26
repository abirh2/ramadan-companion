import WidgetKit
import SwiftUI

// MARK: - Data Model

struct QiblaEntry: TimelineEntry {
    let date: Date
    let direction: String
    let compass: String
    let city: String
}

// MARK: - Timeline Provider

struct QiblaProvider: TimelineProvider {
    func placeholder(in context: Context) -> QiblaEntry {
        QiblaEntry(date: Date(), direction: "58", compass: "NE", city: "New York")
    }

    func getSnapshot(in context: Context, completion: @escaping (QiblaEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QiblaEntry>) -> Void) {
        let entry = currentEntry()
        // Qibla bearing is static per location; refresh every 6 hours
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 6, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func currentEntry() -> QiblaEntry {
        let direction = SharedDefaults.qiblaDirection
        if direction.isEmpty {
            return QiblaEntry(date: Date(), direction: "--", compass: "", city: "Open app")
        }
        return QiblaEntry(
            date: Date(),
            direction: direction,
            compass: SharedDefaults.qiblaCompass,
            city: SharedDefaults.qiblaCity
        )
    }
}

// MARK: - Compass Visual

private struct CompassView: View {
    let bearing: Double
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            // Outer ring
            Circle()
                .stroke(WidgetTheme.subtleBorder(for: colorScheme), lineWidth: 1.5)

            // Tick marks at cardinal points
            ForEach([0, 90, 180, 270], id: \.self) { angle in
                Rectangle()
                    .fill(WidgetTheme.secondaryText(for: colorScheme).opacity(0.3))
                    .frame(width: 1, height: 4)
                    .offset(y: -28)
                    .rotationEffect(.degrees(Double(angle)))
            }

            // Center dot
            Circle()
                .fill(WidgetTheme.secondaryText(for: colorScheme).opacity(0.3))
                .frame(width: 4, height: 4)

            // Qibla direction arrow
            VStack(spacing: 0) {
                Image(systemName: "arrowtriangle.up.fill")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                Rectangle()
                    .fill(WidgetTheme.accent(for: colorScheme))
                    .frame(width: 2, height: 12)
            }
            .offset(y: -12)
            .rotationEffect(.degrees(bearing))
        }
    }
}

// MARK: - Small Widget View

struct QiblaSmallView: View {
    let entry: QiblaEntry
    @Environment(\.colorScheme) var colorScheme

    private var bearingDegrees: Double {
        Double(entry.direction) ?? 0
    }

    private var displayBearing: String {
        if let d = Double(entry.direction) {
            return "\(Int(d))\u{00B0}"
        }
        return entry.direction
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("\(displayBearing) \(entry.compass)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                Spacer()
            }

            Spacer(minLength: 4)

            CompassView(bearing: bearingDegrees)
                .frame(width: 64, height: 64)

            Spacer(minLength: 4)

            HStack(spacing: 3) {
                Image(systemName: "location.fill")
                    .font(.system(size: 8))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                Text(entry.city)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                    .lineLimit(1)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Entry View

struct QiblaWidgetEntryView: View {
    let entry: QiblaEntry

    var body: some View {
        QiblaSmallView(entry: entry)
            .widgetURL(URL(string: "deencompanion:///qibla"))
    }
}

// MARK: - Widget Configuration

struct QiblaWidget: Widget {
    let kind = "QiblaWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QiblaProvider()) { entry in
            QiblaWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Qibla Direction")
        .description("Compass bearing towards Mecca.")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    QiblaWidget()
} timeline: {
    QiblaEntry(date: .now, direction: "58", compass: "NE", city: "New York")
}
