import AppIntents
import WidgetKit

/// Increments the zikr counter directly from the widget without opening the app.
/// Available on iOS 17+ only — the widget uses a conditional fallback on iOS 15/16.
@available(iOS 17.0, *)
struct IncrementZikrIntent: AppIntent {
    static var title: LocalizedStringResource = "Increment Zikr"
    static var description = IntentDescription("Tap to count one zikr.")

    // Make it perform as quickly as possible (no UI presentation)
    static var openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult {
        let currentCount = SharedDefaults.zikrCount
        SharedDefaults.setZikrCount(currentCount + 1)
        // Ask WidgetKit to reload the zikr widget timeline immediately
        WidgetCenter.shared.reloadTimelines(ofKind: "ZikrWidget")
        return .result()
    }
}
