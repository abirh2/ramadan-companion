import UIKit
import Capacitor
import WidgetKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    // All widget-related keys that @capacitor/preferences writes to the
    // App Group suite (group.com.deencompanion.app). When any of these
    // change we tell WidgetKit to reload timelines.
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
        // All Prayers 24hr keys (legacy fallback)
        "widget_all_prayers_fajr_24",
        "widget_all_prayers_dhuhr_24",
        "widget_all_prayers_asr_24",
        "widget_all_prayers_maghrib_24",
        "widget_all_prayers_isha_24",
        // Widget config (Strategy B -- embedded calculator)
        "widget_config_lat",
        "widget_config_lng",
        "widget_config_method",
        "widget_config_madhab",
        "widget_config_timezone",
        "widget_config_update",
        // 14-day prayer schedule (Strategy A)
        "widget_prayer_schedule",
        "widget_prayer_schedule_update",
        // Verse widget
        "widget_verse_type",
        "widget_verse_arabic",
        "widget_verse_translation",
        "widget_verse_source",
        "widget_verse_update",
        // Hadith widget
        "widget_hadith_arabic",
        "widget_hadith_translation",
        "widget_hadith_source",
        "widget_hadith_update",
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

    private static let appGroupId = "group.com.deencompanion.app"

    /// Snapshot of the last-seen values for change detection.
    private var lastSnapshot: [String: String] = [:]

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Take initial snapshot so the first real write is detected as a change
        if let shared = UserDefaults(suiteName: Self.appGroupId) {
            for key in Self.widgetKeys {
                if let value = shared.string(forKey: key) {
                    lastSnapshot[key] = value
                }
            }
        }

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(defaultsDidChange),
            name: UserDefaults.didChangeNotification,
            object: nil
        )
        return true
    }

    @objc private func defaultsDidChange(_ notification: Notification) {
        checkWidgetDataChanged()
    }

    /// Detect whether any widget keys in the App Group suite have changed
    /// since the last check and, if so, tell WidgetKit to reload timelines.
    ///
    /// Capacitor Preferences (with group config) writes directly to the App
    /// Group suite -- NOT to UserDefaults.standard. So we read from the App
    /// Group suite and compare against our in-memory snapshot.
    private func checkWidgetDataChanged() {
        guard let shared = UserDefaults(suiteName: Self.appGroupId) else { return }

        var didChange = false

        for key in Self.widgetKeys {
            let current = shared.string(forKey: key)
            let previous = lastSnapshot[key]
            if current != previous {
                lastSnapshot[key] = current ?? ""
                didChange = true
            }
        }

        if didChange {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        checkWidgetDataChanged()
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        checkWidgetDataChanged()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        WidgetCenter.shared.reloadAllTimelines()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        checkWidgetDataChanged()
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
