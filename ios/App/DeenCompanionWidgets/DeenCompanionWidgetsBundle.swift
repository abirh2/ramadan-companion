import WidgetKit
import SwiftUI

/// Main entry point for the widget extension.
/// Declares all three widget types in a single bundle so only one Xcode
/// target / App Groups entitlement is needed.
@main
struct DeenCompanionWidgetsBundle: WidgetBundle {
    var body: some Widget {
        PrayerWidget()
        VerseWidget()
        ZikrWidget()
    }
}
