import SwiftUI
import WidgetKit

// MARK: - Brand Colors

enum WidgetTheme {

    // Deep teal from app brand
    static let deepTeal = Color(red: 0.06, green: 0.24, blue: 0.24)

    // Emerald accent for highlights (light mode)
    static let emerald = Color(red: 0.06, green: 0.73, blue: 0.51)

    // Brighter emerald for dark mode highlights
    static let emeraldBright = Color(red: 0.20, green: 0.83, blue: 0.60)

    // Gold accent for special elements (Jummah, Ramadan)
    static let gold = Color(red: 0.83, green: 0.69, blue: 0.22)

    // MARK: - Background Colors

    static let lightBg = Color(red: 0.96, green: 0.95, blue: 0.94)
    static let darkBg = Color(red: 0.04, green: 0.10, blue: 0.08)

    // MARK: - Text Colors

    static let lightPrimary = Color(red: 0.06, green: 0.24, blue: 0.24)
    static let lightSecondary = Color(red: 0.42, green: 0.44, blue: 0.50)
    static let darkPrimary = Color(red: 0.94, green: 0.93, blue: 0.91)
    static let darkSecondary = Color(red: 0.60, green: 0.62, blue: 0.60)

    // MARK: - Adaptive Helpers

    static func accent(for scheme: ColorScheme) -> Color {
        scheme == .dark ? emeraldBright : emerald
    }

    static func primaryText(for scheme: ColorScheme) -> Color {
        scheme == .dark ? darkPrimary : lightPrimary
    }

    static func secondaryText(for scheme: ColorScheme) -> Color {
        scheme == .dark ? darkSecondary : lightSecondary
    }

    static func background(for scheme: ColorScheme) -> Color {
        scheme == .dark ? darkBg : lightBg
    }

    static func cardFill(for scheme: ColorScheme) -> Color {
        scheme == .dark ? Color.white.opacity(0.06) : Color.white.opacity(0.7)
    }

    static func subtleBorder(for scheme: ColorScheme) -> Color {
        scheme == .dark ? Color.white.opacity(0.08) : Color.black.opacity(0.06)
    }

    static func highlightFill(for scheme: ColorScheme) -> Color {
        accent(for: scheme).opacity(scheme == .dark ? 0.18 : 0.12)
    }
}

// MARK: - Themed Container Background

struct ThemedWidgetBackground: View {
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            WidgetTheme.background(for: colorScheme)

            // Subtle radial glow for depth
            RadialGradient(
                colors: [
                    WidgetTheme.accent(for: colorScheme).opacity(colorScheme == .dark ? 0.08 : 0.06),
                    Color.clear
                ],
                center: .topTrailing,
                startRadius: 0,
                endRadius: 200
            )
        }
    }
}

// MARK: - Pill Badge

struct PillBadge: View {
    let text: String
    var color: Color? = nil
    @Environment(\.colorScheme) var colorScheme

    var resolvedColor: Color {
        color ?? WidgetTheme.accent(for: colorScheme)
    }

    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 9, weight: .bold))
            .foregroundStyle(resolvedColor)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(
                Capsule()
                    .fill(resolvedColor.opacity(colorScheme == .dark ? 0.20 : 0.12))
            )
    }
}

// MARK: - Section Header

struct WidgetHeader: View {
    let icon: String
    let title: String
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(WidgetTheme.accent(for: colorScheme))
            Text(title.uppercased())
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(WidgetTheme.secondaryText(for: colorScheme))
                .tracking(0.5)
        }
    }
}
