import WidgetKit
import SwiftUI

// MARK: - Data Model

struct MosqueEntry: TimelineEntry {
    let date: Date
    let name: String
    let distance: String
    let address: String
}

// MARK: - Timeline Provider

struct MosqueProvider: TimelineProvider {
    func placeholder(in context: Context) -> MosqueEntry {
        MosqueEntry(date: Date(), name: "East London Mosque", distance: "0.8 mi", address: "Whitechapel Rd")
    }

    func getSnapshot(in context: Context, completion: @escaping (MosqueEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MosqueEntry>) -> Void) {
        let entry = currentEntry()
        // Mosque data is location-dependent; refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func currentEntry() -> MosqueEntry {
        let name = SharedDefaults.mosqueName
        if name.isEmpty {
            return MosqueEntry(date: Date(), name: "Open app", distance: "", address: "Find nearby mosques")
        }
        return MosqueEntry(
            date: Date(),
            name: name,
            distance: SharedDefaults.mosqueDistance,
            address: SharedDefaults.mosqueAddress
        )
    }
}

// MARK: - Small Widget View

struct MosqueSmallView: View {
    let entry: MosqueEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Image(systemName: "building.columns.fill")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                    .frame(width: 28, height: 28)
                    .background(
                        Circle()
                            .fill(WidgetTheme.highlightFill(for: colorScheme))
                    )

                Spacer()

                if !entry.distance.isEmpty {
                    Image(systemName: "location.fill")
                        .font(.system(size: 9))
                        .foregroundStyle(WidgetTheme.accent(for: colorScheme))
                }
            }

            Spacer(minLength: 4)

            Text("NEAREST")
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                .tracking(0.5)

            Text(entry.name)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(WidgetTheme.primaryText(for: colorScheme))
                .lineLimit(2)
                .minimumScaleFactor(0.7)

            Spacer(minLength: 4)

            if !entry.distance.isEmpty {
                Text(entry.distance)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(WidgetTheme.accent(for: colorScheme))
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

// MARK: - Entry View

struct MosqueWidgetEntryView: View {
    let entry: MosqueEntry

    var body: some View {
        MosqueSmallView(entry: entry)
            .widgetURL(URL(string: "deencompanion:///mosques"))
    }
}

// MARK: - Widget Configuration

struct MosqueWidget: Widget {
    let kind = "MosqueWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: MosqueProvider()) { entry in
            MosqueWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    ThemedWidgetBackground()
                }
        }
        .configurationDisplayName("Nearest Mosque")
        .description("Your closest mosque at a glance.")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    MosqueWidget()
} timeline: {
    MosqueEntry(date: .now, name: "East London Mosque", distance: "0.8 mi", address: "Whitechapel Rd")
}
