import Foundation

/// Shared UserDefaults suite used by both the main app (via Capacitor Preferences
/// plugin) and the widget extension. Both targets must have the App Group
/// "group.com.deencompanion.app" enabled in Signing & Capabilities.
enum SharedDefaults {
    static let suiteName = "group.com.deencompanion.app"

    private static var store: UserDefaults? {
        UserDefaults(suiteName: suiteName)
    }

    // MARK: - Next Prayer Widget

    static var prayerSnapshotJSON: String { store?.string(forKey: "widget_prayer_snapshot_v1") ?? "" }

    // MARK: - Verse Widget (Quran only)

    static var verseType: String { store?.string(forKey: "widget_verse_type") ?? "quran" }
    static var verseArabic: String { store?.string(forKey: "widget_verse_arabic") ?? "" }
    static var verseTranslation: String { store?.string(forKey: "widget_verse_translation") ?? "" }
    static var verseSource: String { store?.string(forKey: "widget_verse_source") ?? "" }

    // MARK: - Hadith Widget (separate from verse)

    static var hadithArabic: String { store?.string(forKey: "widget_hadith_arabic") ?? "" }
    static var hadithTranslation: String { store?.string(forKey: "widget_hadith_translation") ?? "" }
    static var hadithSource: String { store?.string(forKey: "widget_hadith_source") ?? "" }

    // MARK: - Zikr Widget

    static var zikrArabic: String { store?.string(forKey: "widget_zikr_arabic") ?? "سُبْحَانَ ٱللَّٰهِ" }
    static var zikrTransliteration: String { store?.string(forKey: "widget_zikr_transliteration") ?? "SubhanAllah" }
    static var zikrCount: Int {
        Int(store?.string(forKey: "widget_zikr_count") ?? "0") ?? 0
    }
    static var zikrTarget: Int {
        Int(store?.string(forKey: "widget_zikr_target") ?? "33") ?? 33
    }

    static func setZikrCount(_ count: Int) {
        store?.set(String(count), forKey: "widget_zikr_count")
    }

    // MARK: - Hijri Date Widget

    static var hijriDay: String { store?.string(forKey: "widget_hijri_day") ?? "" }
    static var hijriMonthName: String { store?.string(forKey: "widget_hijri_month_name") ?? "" }
    static var hijriYear: String { store?.string(forKey: "widget_hijri_year") ?? "" }
    static var hijriGregorianDate: String { store?.string(forKey: "widget_hijri_gregorian_date") ?? "" }
    static var hijriWeekday: String { store?.string(forKey: "widget_hijri_weekday") ?? "" }

    // MARK: - Qibla Widget

    static var qiblaDirection: String { store?.string(forKey: "widget_qibla_direction") ?? "" }
    static var qiblaCompass: String { store?.string(forKey: "widget_qibla_compass") ?? "" }
    static var qiblaCity: String { store?.string(forKey: "widget_qibla_city") ?? "" }

    // MARK: - Mosque Widget

    static var mosqueName: String { store?.string(forKey: "widget_mosque_name") ?? "" }
    static var mosqueDistance: String { store?.string(forKey: "widget_mosque_distance") ?? "" }
    static var mosqueAddress: String { store?.string(forKey: "widget_mosque_address") ?? "" }

}
