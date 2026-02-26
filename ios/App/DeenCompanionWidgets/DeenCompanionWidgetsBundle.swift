import WidgetKit
import SwiftUI

@main
struct DeenCompanionWidgetsBundle: WidgetBundle {
    var body: some Widget {
        // Material background (default)
        PrayerWidget()
        AllPrayersWidget()
        VerseWidget()
        ZikrWidget()

        // Transparent background variants
        PrayerWidgetClear()
        AllPrayersWidgetClear()
        VerseWidgetClear()
        ZikrWidgetClear()
    }
}
