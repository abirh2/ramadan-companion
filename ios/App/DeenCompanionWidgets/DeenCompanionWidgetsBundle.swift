import WidgetKit
import SwiftUI

@main
struct DeenCompanionWidgetsBundle: WidgetBundle {
    var body: some Widget {
        // Prayer widgets
        PrayerWidget()
        AllPrayersWidget()

        // Content widgets
        VerseWidget()
        HadithWidget()
        ZikrWidget()

        // Info widgets
        HijriDateWidget()
        QiblaWidget()
        MosqueWidget()
    }
}
