import Foundation

/// Shared UserDefaults suite used by both the main app (via Capacitor Preferences
/// plugin) and the widget extension. Both targets must have the App Group
/// "group.com.deencompanion.app" enabled in Signing & Capabilities.
enum SharedDefaults {
    static let suiteName = "group.com.deencompanion.app"

    private static var store: UserDefaults? {
        UserDefaults(suiteName: suiteName)
    }

    // MARK: - Prayer Widget

    static var prayerName: String { store?.string(forKey: "widget_prayer_name") ?? "" }
    static var prayerTime: String { store?.string(forKey: "widget_prayer_time") ?? "" }
    static var prayerCountdown: String { store?.string(forKey: "widget_prayer_countdown") ?? "" }

    // MARK: - Verse Widget

    static var verseType: String { store?.string(forKey: "widget_verse_type") ?? "quran" }
    static var verseArabic: String { store?.string(forKey: "widget_verse_arabic") ?? "" }
    static var verseTranslation: String { store?.string(forKey: "widget_verse_translation") ?? "" }
    static var verseSource: String { store?.string(forKey: "widget_verse_source") ?? "" }

    // MARK: - Zikr Widget

    static var zikrArabic: String { store?.string(forKey: "widget_zikr_arabic") ?? "سُبْحَانَ ٱللَّٰهِ" }
    static var zikrTransliteration: String { store?.string(forKey: "widget_zikr_transliteration") ?? "SubhanAllah" }
    static var zikrCount: Int {
        Int(store?.string(forKey: "widget_zikr_count") ?? "0") ?? 0
    }
    static var zikrTarget: Int {
        Int(store?.string(forKey: "widget_zikr_target") ?? "33") ?? 33
    }

    /// Write incremented zikr count back to shared storage (used by ZikrIntent on iOS 17+)
    static func setZikrCount(_ count: Int) {
        store?.set(String(count), forKey: "widget_zikr_count")
    }
}
