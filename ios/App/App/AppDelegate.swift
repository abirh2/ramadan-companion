import UIKit
import Capacitor
import WidgetKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    // Keys that @capacitor/preferences writes to UserDefaults.standard
    // (with "CapacitorStorage." prefix). These are mirrored to the App Group
    // suite so the widget extension can read them.
    private static let widgetKeys = [
        // Next Prayer widget
        "widget_prayer_name",
        "widget_prayer_time",
        "widget_prayer_target_time",
        "widget_prayer_countdown",
        "widget_prayer_update",
        // All Prayers widget
        "widget_all_prayers_fajr",
        "widget_all_prayers_dhuhr",
        "widget_all_prayers_asr",
        "widget_all_prayers_maghrib",
        "widget_all_prayers_isha",
        "widget_all_prayers_next",
        "widget_all_prayers_update",
        // Verse widget
        "widget_verse_type",
        "widget_verse_arabic",
        "widget_verse_translation",
        "widget_verse_source",
        "widget_verse_update",
        // Zikr widget
        "widget_zikr_arabic",
        "widget_zikr_transliteration",
        "widget_zikr_count",
        "widget_zikr_target",
        "widget_zikr_update",
        // Hijri Date widget
        "widget_hijri_day",
        "widget_hijri_month_name",
        "widget_hijri_year",
        "widget_hijri_gregorian_date",
        "widget_hijri_weekday",
        "widget_hijri_update",
        // Charity widget
        "widget_charity_monthly",
        "widget_charity_yearly",
        "widget_charity_currency",
        "widget_charity_update",
        // Qibla widget
        "widget_qibla_direction",
        "widget_qibla_compass",
        "widget_qibla_city",
        "widget_qibla_update",
        // Mosque widget
        "widget_mosque_name",
        "widget_mosque_distance",
        "widget_mosque_address",
        "widget_mosque_update",
    ]

    private static let preferencesPrefix = "CapacitorStorage."
    private static let appGroupId = "group.com.deencompanion.app"

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(defaultsDidChange),
            name: UserDefaults.didChangeNotification,
            object: nil
        )
        return true
    }

    @objc private func defaultsDidChange(_ notification: Notification) {
        syncWidgetData()
    }

    /// Mirror widget-related keys from UserDefaults.standard (where
    /// @capacitor/preferences writes) to the App Group suite (where the
    /// widget extension reads via SharedDefaults).
    private func syncWidgetData() {
        let standard = UserDefaults.standard
        guard let shared = UserDefaults(suiteName: Self.appGroupId) else { return }

        var didChange = false

        for key in Self.widgetKeys {
            let prefixedKey = Self.preferencesPrefix + key
            guard let value = standard.string(forKey: prefixedKey) else { continue }

            let existing = shared.string(forKey: key)
            if existing != value {
                shared.set(value, forKey: key)
                didChange = true
            }
        }

        if didChange {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        syncWidgetData()
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        syncWidgetData()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        syncWidgetData()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        syncWidgetData()
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
