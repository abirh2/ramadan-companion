import UIKit
import Capacitor
import WidgetKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    private static let widgetKeys = [
        "widget_prayer_name",
        "widget_prayer_time",
        "widget_prayer_target_time",
        "widget_prayer_countdown",
        "widget_prayer_update",
        "widget_all_prayers_fajr",
        "widget_all_prayers_dhuhr",
        "widget_all_prayers_asr",
        "widget_all_prayers_maghrib",
        "widget_all_prayers_isha",
        "widget_all_prayers_next",
        "widget_all_prayers_update",
        "widget_all_prayers_fajr_24",
        "widget_all_prayers_dhuhr_24",
        "widget_all_prayers_asr_24",
        "widget_all_prayers_maghrib_24",
        "widget_all_prayers_isha_24",
        "widget_config_lat",
        "widget_config_lng",
        "widget_config_method",
        "widget_config_madhab",
        "widget_config_timezone",
        "widget_config_update",
        "widget_prayer_schedule",
        "widget_prayer_schedule_update",
        "widget_verse_type",
        "widget_verse_arabic",
        "widget_verse_translation",
        "widget_verse_source",
        "widget_verse_update",
        "widget_hadith_arabic",
        "widget_hadith_translation",
        "widget_hadith_source",
        "widget_hadith_update",
        "widget_zikr_arabic",
        "widget_zikr_transliteration",
        "widget_zikr_count",
        "widget_zikr_target",
        "widget_zikr_update",
        "widget_hijri_day",
        "widget_hijri_month_name",
        "widget_hijri_year",
        "widget_hijri_gregorian_date",
        "widget_hijri_weekday",
        "widget_hijri_update",
        "widget_charity_monthly",
        "widget_charity_yearly",
        "widget_charity_currency",
        "widget_charity_update",
        "widget_qibla_direction",
        "widget_qibla_compass",
        "widget_qibla_city",
        "widget_qibla_update",
        "widget_mosque_name",
        "widget_mosque_distance",
        "widget_mosque_address",
        "widget_mosque_update",
    ]

    private static let appGroupId = "group.com.deencompanion.app"

    // Capacitor Preferences uses UserDefaults.standard with a prefix.
    // The prefix depends on whether configure() was called from JS.
    // Default is "CapacitorStorage.", but if the web app calls configure()
    // with the group from capacitor.config.json it becomes
    // "group.com.deencompanion.app." -- we check both.
    private static let possiblePrefixes = [
        "CapacitorStorage.",
        "group.com.deencompanion.app.",
    ]

    /// Snapshot of the last-seen values in the App Group suite for change detection.
    private var lastSnapshot: [String: String] = [:]

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Take initial snapshot from App Group suite
        if let shared = UserDefaults(suiteName: Self.appGroupId) {
            for key in Self.widgetKeys {
                if let value = shared.string(forKey: key) {
                    lastSnapshot[key] = value
                }
            }
        }

        syncWidgetData()

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

    /// Mirror widget data from UserDefaults.standard (where Capacitor
    /// Preferences writes with a key prefix) into the App Group suite
    /// (where widget extensions read via SharedDefaults).
    ///
    /// Only writes to the App Group suite when a newer value is found in
    /// standard. Never deletes from the App Group suite -- if Capacitor
    /// hasn't written a key yet, the existing App Group value is preserved.
    private func syncWidgetData() {
        let standard = UserDefaults.standard
        guard let shared = UserDefaults(suiteName: Self.appGroupId) else { return }

        var didChange = false

        for key in Self.widgetKeys {
            // Try each known prefix to find the value Capacitor wrote
            var value: String? = nil
            for prefix in Self.possiblePrefixes {
                if let v = standard.string(forKey: prefix + key) {
                    value = v
                    break
                }
            }

            // Only update App Group suite if we found a value in standard
            // and it differs from what's already there. Never delete.
            guard let newValue = value else { continue }

            let existing = shared.string(forKey: key)
            if newValue != existing {
                shared.set(newValue, forKey: key)
                didChange = true
            }

            // Track for snapshot-based change detection
            if lastSnapshot[key] != newValue {
                lastSnapshot[key] = newValue
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
        WidgetCenter.shared.reloadAllTimelines()
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
