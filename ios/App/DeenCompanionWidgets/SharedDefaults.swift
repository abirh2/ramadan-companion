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

    static var prayerName: String { store?.string(forKey: "widget_prayer_name") ?? "" }
    static var prayerTime: String { store?.string(forKey: "widget_prayer_time") ?? "" }
    /// ISO 8601 date string of next prayer occurrence (widget computes countdown from this)
    static var prayerTargetTime: String { store?.string(forKey: "widget_prayer_target_time") ?? "" }

    // MARK: - All Prayers Widget

    static var allPrayersFajr: String { store?.string(forKey: "widget_all_prayers_fajr") ?? "" }
    static var allPrayersDhuhr: String { store?.string(forKey: "widget_all_prayers_dhuhr") ?? "" }
    static var allPrayersAsr: String { store?.string(forKey: "widget_all_prayers_asr") ?? "" }
    static var allPrayersMaghrib: String { store?.string(forKey: "widget_all_prayers_maghrib") ?? "" }
    static var allPrayersIsha: String { store?.string(forKey: "widget_all_prayers_isha") ?? "" }
    static var allPrayersNext: String { store?.string(forKey: "widget_all_prayers_next") ?? "" }

    // 24hr times (HH:MM) for widget self-computation of next prayer
    static var allPrayersFajr24: String { store?.string(forKey: "widget_all_prayers_fajr_24") ?? "" }
    static var allPrayersDhuhr24: String { store?.string(forKey: "widget_all_prayers_dhuhr_24") ?? "" }
    static var allPrayersAsr24: String { store?.string(forKey: "widget_all_prayers_asr_24") ?? "" }
    static var allPrayersMaghrib24: String { store?.string(forKey: "widget_all_prayers_maghrib_24") ?? "" }
    static var allPrayersIsha24: String { store?.string(forKey: "widget_all_prayers_isha_24") ?? "" }

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

    // MARK: - Charity Widget

    static var charityMonthly: String { store?.string(forKey: "widget_charity_monthly") ?? "" }
    static var charityYearly: String { store?.string(forKey: "widget_charity_yearly") ?? "" }
    static var charityCurrency: String { store?.string(forKey: "widget_charity_currency") ?? "$" }

    // MARK: - Qibla Widget

    static var qiblaDirection: String { store?.string(forKey: "widget_qibla_direction") ?? "" }
    static var qiblaCompass: String { store?.string(forKey: "widget_qibla_compass") ?? "" }
    static var qiblaCity: String { store?.string(forKey: "widget_qibla_city") ?? "" }

    // MARK: - Mosque Widget

    static var mosqueName: String { store?.string(forKey: "widget_mosque_name") ?? "" }
    static var mosqueDistance: String { store?.string(forKey: "widget_mosque_distance") ?? "" }
    static var mosqueAddress: String { store?.string(forKey: "widget_mosque_address") ?? "" }

    // MARK: - Widget Config (for embedded prayer time calculator – Strategy B)

    /// Latitude stored by the web app so widget extensions can compute prayer times without the app.
    static var configLat: Double { Double(store?.string(forKey: "widget_config_lat") ?? "") ?? 0 }
    static var configLng: Double { Double(store?.string(forKey: "widget_config_lng") ?? "") ?? 0 }
    /// AlAdhan calculation method ID, e.g. "4" (Umm al-Qura)
    static var configMethod: String { store?.string(forKey: "widget_config_method") ?? "4" }
    /// AlAdhan madhab ID: "0" = Standard, "1" = Hanafi
    static var configMadhab: String { store?.string(forKey: "widget_config_madhab") ?? "0" }
    /// IANA timezone string, e.g. "America/New_York"
    static var configTimezone: String { store?.string(forKey: "widget_config_timezone") ?? TimeZone.current.identifier }
    /// Returns true when the config keys have been populated by the app
    static var hasConfig: Bool { configLat != 0 && configLng != 0 }

    // MARK: - 14-Day Prayer Schedule (Strategy A fallback JSON blob)

    /// JSON-encoded dict of "YYYY-MM-DD" → { fajr, dhuhr, asr, maghrib, isha } in HH:MM 24hr format.
    static var prayerScheduleJSON: String { store?.string(forKey: "widget_prayer_schedule") ?? "" }
}
