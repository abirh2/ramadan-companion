import UIKit
import Capacitor
import WidgetKit

private struct LegacyPrayerDay: Decodable {
    let fajr: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
}

private struct MigratedPrayerOccurrence: Codable {
    let name: String
    let time: String
    let timestamp: String
    let dayKey: String
}

private struct MigratedPrayerSnapshot: Codable {
    let version: Int
    let generatedAt: String
    let expiresAt: String
    let locationLabel: String
    let timezone: String
    let gregorianDate: String
    let hijriDate: String
    let prayers: [MigratedPrayerOccurrence]
    let nextPrayer: MigratedPrayerOccurrence
    let deepLink: String
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    private static let widgetKeys = [
        "widget_prayer_snapshot_v1",
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
    private static let prayerSnapshotKey = "widget_prayer_snapshot_v1"

    /// Removed from widget storage in Step 12. City-level labels are sufficient
    /// for the UI; prayer timestamps now arrive in the normalized snapshot.
    private static let deprecatedSensitiveWidgetKeys = [
        "widget_config_lat",
        "widget_config_lng",
        "widget_config_method",
        "widget_config_madhab",
        "widget_config_timezone",
        "widget_config_update",
        "widget_charity_monthly",
        "widget_charity_yearly",
        "widget_charity_currency",
        "widget_charity_update",
    ]

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

    /// UserDefaults mutations synchronously emit didChangeNotification. Keep a
    /// mirror pass from recursively entering itself while it cleans or writes.
    private var isSyncingWidgetData = false

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
            object: UserDefaults.standard
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
    /// Writes current widget values into the App Group suite and removes
    /// deprecated sensitive keys. Missing current keys are preserved until
    /// Capacitor supplies their replacements.
    private func syncWidgetData() {
        guard !isSyncingWidgetData else { return }
        isSyncingWidgetData = true
        defer { isSyncingWidgetData = false }

        let standard = UserDefaults.standard
        guard let shared = UserDefaults(suiteName: Self.appGroupId) else { return }

        var didChange = false

        for key in Self.deprecatedSensitiveWidgetKeys {
            if shared.object(forKey: key) != nil {
                shared.removeObject(forKey: key)
                lastSnapshot.removeValue(forKey: key)
                didChange = true
            }
            for prefix in Self.possiblePrefixes {
                let storedKey = prefix + key
                if standard.object(forKey: storedKey) != nil {
                    standard.removeObject(forKey: storedKey)
                }
            }
        }

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

        if migrateLegacyPrayerSnapshot(standard: standard, shared: shared) {
            didChange = true
        }

        if didChange {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }

    /// Compatibility bridge for the currently deployed web bundle, which still
    /// writes an app-computed 14-day schedule under the pre-Step-12 keys. This
    /// only normalizes cached results; it does not calculate prayer times.
    private func migrateLegacyPrayerSnapshot(standard: UserDefaults, shared: UserDefaults) -> Bool {
        let now = Date()
        let parsedLegacyUpdatedAt = prefixedString(forKey: "widget_prayer_schedule_update", in: standard)
            .flatMap(parseISO8601)
        let legacyRevision = parsedLegacyUpdatedAt ?? .distantPast

        if let existingJSON = shared.string(forKey: Self.prayerSnapshotKey),
           let existingData = existingJSON.data(using: .utf8),
           let existing = try? JSONDecoder().decode(MigratedPrayerSnapshot.self, from: existingData),
           existing.version == 1,
           let generatedAt = parseISO8601(existing.generatedAt),
           let expiresAt = parseISO8601(existing.expiresAt),
           generatedAt >= legacyRevision,
           expiresAt > now {
            return false
        }

        var prayers = migratedLegacySchedule(from: standard, after: now)
        if prayers.isEmpty,
           let name = prefixedString(forKey: "widget_prayer_name", in: standard),
           let time = prefixedString(forKey: "widget_prayer_time", in: standard),
           let targetText = prefixedString(forKey: "widget_prayer_target_time", in: standard),
           let target = parseISO8601(targetText),
           target > now,
           ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].contains(name) {
            prayers = [MigratedPrayerOccurrence(
                name: name,
                time: String(time.prefix(16)),
                timestamp: ISO8601DateFormatter().string(from: target),
                dayKey: dayKeyFormatter.string(from: target)
            )]
        }

        guard let nextPrayer = prayers.first,
              let lastTimestamp = prayers.last.flatMap({ parseISO8601($0.timestamp) })
        else { return false }

        let gregorian = DateFormatter()
        gregorian.locale = Locale(identifier: "en_US_POSIX")
        gregorian.timeZone = .current
        gregorian.dateStyle = .long

        let hijri = DateFormatter()
        hijri.locale = Locale(identifier: "en_US_POSIX")
        hijri.timeZone = .current
        hijri.calendar = Calendar(identifier: .islamicUmmAlQura)
        hijri.dateStyle = .long

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let snapshot = MigratedPrayerSnapshot(
            version: 1,
            generatedAt: formatter.string(from: parsedLegacyUpdatedAt ?? now),
            expiresAt: formatter.string(from: lastTimestamp.addingTimeInterval(6 * 60 * 60)),
            locationLabel: String((prefixedString(forKey: "widget_qibla_city", in: standard) ?? "").prefix(80)),
            timezone: TimeZone.current.identifier,
            gregorianDate: gregorian.string(from: now),
            hijriDate: hijri.string(from: now),
            prayers: prayers,
            nextPrayer: nextPrayer,
            deepLink: "/times"
        )

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        guard let data = try? encoder.encode(snapshot),
              data.count <= 64 * 1024,
              let json = String(data: data, encoding: .utf8),
              shared.string(forKey: Self.prayerSnapshotKey) != json
        else { return false }

        shared.set(json, forKey: Self.prayerSnapshotKey)
        lastSnapshot[Self.prayerSnapshotKey] = json
        return true
    }

    private func migratedLegacySchedule(from standard: UserDefaults, after now: Date) -> [MigratedPrayerOccurrence] {
        guard let json = prefixedString(forKey: "widget_prayer_schedule", in: standard),
              let data = json.data(using: .utf8),
              data.count <= 64 * 1024,
              let schedule = try? JSONDecoder().decode([String: LegacyPrayerDay].self, from: data),
              schedule.count <= 14
        else { return [] }

        let parser = DateFormatter()
        parser.locale = Locale(identifier: "en_US_POSIX")
        parser.calendar = Calendar(identifier: .gregorian)
        parser.timeZone = .current
        parser.dateFormat = "yyyy-MM-dd HH:mm"
        parser.isLenient = false

        let display = DateFormatter()
        display.locale = Locale(identifier: "en_US_POSIX")
        display.timeZone = .current
        display.dateFormat = "h:mm a"

        var result: [MigratedPrayerOccurrence] = []
        for dayKey in schedule.keys.sorted() {
            guard dayKey.range(of: #"^\d{4}-\d{2}-\d{2}$"#, options: .regularExpression) != nil,
                  let day = schedule[dayKey]
            else { continue }

            let values = [
                ("Fajr", day.fajr),
                ("Dhuhr", day.dhuhr),
                ("Asr", day.asr),
                ("Maghrib", day.maghrib),
                ("Isha", day.isha),
            ]
            for (name, time) in values {
                guard time.range(of: #"^\d{1,2}:\d{2}$"#, options: .regularExpression) != nil,
                      let date = parser.date(from: "\(dayKey) \(time)"),
                      date > now
                else { continue }
                result.append(MigratedPrayerOccurrence(
                    name: name,
                    time: display.string(from: date),
                    timestamp: ISO8601DateFormatter().string(from: date),
                    dayKey: dayKey
                ))
            }
        }
        return result.sorted { $0.timestamp < $1.timestamp }.prefix(70).map { $0 }
    }

    private func prefixedString(forKey key: String, in defaults: UserDefaults) -> String? {
        for prefix in Self.possiblePrefixes {
            if let value = defaults.string(forKey: prefix + key), !value.isEmpty {
                return value
            }
        }
        return nil
    }

    private func parseISO8601(_ value: String) -> Date? {
        let fractional = ISO8601DateFormatter()
        fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return fractional.date(from: value) ?? ISO8601DateFormatter().date(from: value)
    }

    private var dayKeyFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
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
