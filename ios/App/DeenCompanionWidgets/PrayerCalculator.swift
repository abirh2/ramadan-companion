import Foundation

// MARK: - Faithful Swift port of praytime.js v3.2 by Hamid Zarrabi-Zadeh
// Source: https://praytimes.org  |  License: MIT
//
// Design:
//   Strategy B (primary)  – Widget computes prayer times from stored lat/lng/method,
//                           never goes stale regardless of how long since app was opened.
//   Strategy A (fallback) – Widget reads the 14-day JSON schedule written by the app.
//   Legacy (last resort)  – Widget reads the single-day 24hr strings written previously.

// MARK: - Result type

struct PrayerTimes {
    let fajr: Date
    let dhuhr: Date
    let asr: Date
    let maghrib: Date
    let isha: Date
}

struct PrayerDaySchedule {
    let date: String  // YYYY-MM-DD
    let times: PrayerTimes
}

// MARK: - Method parameters

private struct MethodParams {
    let fajrAngle: Double
    /// Nil → isha is specified in minutes after Maghrib
    let ishaAngle: Double?
    let ishaMinutes: Double?
    /// > 0 → Maghrib is computed as an angle (Tehran/Jafari); 0 → Maghrib = Sunset + 1 min
    let maghribAngle: Double

    static func angle(_ fajr: Double, isha: Double, maghrib: Double = 0) -> MethodParams {
        MethodParams(fajrAngle: fajr, ishaAngle: isha, ishaMinutes: nil, maghribAngle: maghrib)
    }
    static func minutes(_ fajr: Double, isha: Double) -> MethodParams {
        MethodParams(fajrAngle: fajr, ishaAngle: nil, ishaMinutes: isha, maghribAngle: 0)
    }
}

private let methodTable: [String: MethodParams] = [
    "0": .angle(16.0, isha: 14.0, maghrib: 4.0),   // Jafari
    "1": .angle(18.0, isha: 18.0),                  // Karachi
    "2": .angle(15.0, isha: 15.0),                  // ISNA
    "3": .angle(19.5, isha: 17.5),                  // Egypt
    "4": .minutes(18.5, isha: 90.0),                // Makkah (Umm al-Qura)
    "5": .angle(18.0, isha: 17.0),                  // MWL
    "7": .angle(17.7, isha: 14.0, maghrib: 4.5),    // Tehran
]
private let defaultMethod = methodTable["4"]!  // Makkah fallback

// MARK: - Calculator

struct PrayerCalculator {

    let latitude: Double
    let longitude: Double
    /// AlAdhan method ID stored by widgetBridge ("0"–"7")
    let methodId: String
    /// "0" = Standard (factor 1), "1" = Hanafi (factor 2)
    let madhabId: String

    private var method: MethodParams { methodTable[methodId] ?? defaultMethod }
    private var asrFactor: Double { madhabId == "1" ? 2.0 : 1.0 }

    // MARK: - Public interface

    /// Compute prayer times for a given local calendar date.
    func compute(for localDate: Date = Date()) -> PrayerTimes? {
        guard let utcTime = utcMidnightMs(for: localDate) else { return nil }

        var times: [String: Double] = [
            "fajr": 5, "sunrise": 6, "dhuhr": 12,
            "asr": 13, "sunset": 18, "maghrib": 18, "isha": 18, "midnight": 24
        ]

        for _ in 0..<2 { times = processTimes(times, utcTime: utcTime) }
        adjustHighLats(&times, utcTime: utcTime)
        updateTimes(&times)

        return prayerTimesFromMap(times, utcTime: utcTime)
    }

    /// Compute a schedule for the next `days` calendar days starting from today.
    func computeSchedule(days: Int = 14) -> [PrayerDaySchedule] {
        var result: [PrayerDaySchedule] = []
        let cal = Calendar.current
        for i in 0..<days {
            guard let date = cal.date(byAdding: .day, value: i, to: Date()),
                  let times = compute(for: date) else { continue }
            result.append(PrayerDaySchedule(date: localDateString(date), times: times))
        }
        return result
    }

    // MARK: - Pipeline

    private func processTimes(_ times: [String: Double], utcTime: Double) -> [String: Double] {
        let horizon = 0.833
        let m = method
        var t = times
        t["fajr"]    = angleTime(m.fajrAngle,  utcTime: utcTime, h: times["fajr"]!,    dir: -1)
        t["sunrise"] = angleTime(horizon,       utcTime: utcTime, h: times["sunrise"]!, dir: -1)
        t["dhuhr"]   = midDay(utcTime: utcTime, h: times["dhuhr"]!)
        t["asr"]     = angleTime(asrAngle(utcTime: utcTime, h: times["asr"]!),
                                 utcTime: utcTime, h: times["asr"]!)
        t["sunset"]  = angleTime(horizon,       utcTime: utcTime, h: times["sunset"]!)
        // Maghrib: angle if Tehran/Jafari, else NaN (overridden in updateTimes)
        if m.maghribAngle > 0 {
            t["maghrib"] = angleTime(m.maghribAngle, utcTime: utcTime, h: times["maghrib"]!)
        } else {
            t["maghrib"] = .nan
        }
        // Isha: angle if angle-based, else NaN (overridden in updateTimes)
        if let ishaA = m.ishaAngle {
            t["isha"] = angleTime(ishaA, utcTime: utcTime, h: times["isha"]!)
        } else {
            t["isha"] = .nan
        }
        t["midnight"] = midDay(utcTime: utcTime, h: times["midnight"] ?? 0) + 12
        return t
    }

    private func updateTimes(_ times: inout [String: Double]) {
        let m = method
        // Standard Maghrib = Sunset + 1 min
        if m.maghribAngle == 0 {
            times["maghrib"] = times["sunset"]! + 1.0 / 60.0
        }
        // Minute-based Isha (e.g. Makkah: 90 min after Maghrib)
        if let mins = m.ishaMinutes {
            times["isha"] = times["maghrib"]! + mins / 60.0
        }
    }

    private func adjustHighLats(_ times: inout [String: Double], utcTime: Double) {
        let night = 24.0 + (times["sunrise"] ?? 6) - (times["sunset"] ?? 18)
        let portion = night / 2.0  // NightMiddle method

        // Fajr
        let fajrDiff = ((times["fajr"] ?? .nan) - (times["sunrise"] ?? 0)) * -1
        if (times["fajr"]?.isNaN ?? true) || fajrDiff > portion {
            times["fajr"] = (times["sunrise"] ?? 0) - portion
        }
        // Isha
        let ishaDiff = (times["isha"] ?? .nan) - (times["sunset"] ?? 0)
        if (times["isha"]?.isNaN ?? true) || ishaDiff > portion {
            times["isha"] = (times["sunset"] ?? 0) + portion
        }
        // Maghrib (only angle-based methods)
        if method.maghribAngle > 0 {
            let maghribDiff = (times["maghrib"] ?? .nan) - (times["sunset"] ?? 0)
            if (times["maghrib"]?.isNaN ?? true) || maghribDiff > portion {
                times["maghrib"] = (times["sunset"] ?? 0) + portion
            }
        }
    }

    private func prayerTimesFromMap(_ times: [String: Double], utcTime: Double) -> PrayerTimes? {
        func toDate(_ key: String) -> Date? {
            guard let h = times[key], !h.isNaN else { return nil }
            let ms = utcTime + (h - longitude / 15.0) * 3_600_000.0
            let rounded = (ms / 60_000.0).rounded() * 60_000.0
            return Date(timeIntervalSince1970: rounded / 1000.0)
        }
        guard let fajr    = toDate("fajr"),
              let dhuhr   = toDate("dhuhr"),
              let asr     = toDate("asr"),
              let maghrib = toDate("maghrib"),
              let isha    = toDate("isha") else { return nil }
        return PrayerTimes(fajr: fajr, dhuhr: dhuhr, asr: asr, maghrib: maghrib, isha: isha)
    }

    // MARK: - Sun position

    private func sunPosition(utcTime: Double, h: Double) -> (decl: Double, eq: Double) {
        let D = utcTime / 864e5 - 10957.5 + h / 24.0 - longitude / 360.0
        let g = dmod(357.529 + 0.98560028 * D, 360)
        let q = dmod(280.459 + 0.98564736 * D, 360)
        let L = dmod(q + 1.915 * sind(g) + 0.020 * sind(2 * g), 360)
        let e = 23.439 - 0.00000036 * D
        let RA = dmod(atan2d(cosd(e) * sind(L), cosd(L)) / 15.0, 24)
        return (decl: asind(sind(e) * sind(L)), eq: q / 15.0 - RA)
    }

    private func midDay(utcTime: Double, h: Double) -> Double {
        let (_, eq) = sunPosition(utcTime: utcTime, h: h)
        return dmod(12.0 - eq, 24.0)
    }

    private func angleTime(_ angle: Double, utcTime: Double, h: Double, dir: Double = 1) -> Double {
        let (decl, _) = sunPosition(utcTime: utcTime, h: h)
        let num = -sind(angle) - sind(latitude) * sind(decl)
        let denom = cosd(latitude) * cosd(decl)
        guard abs(denom) > 1e-10 else { return .nan }
        let ratio = num / denom
        guard ratio >= -1 && ratio <= 1 else { return .nan }
        let diff = acosd(ratio) / 15.0
        return midDay(utcTime: utcTime, h: h) + diff * dir
    }

    private func asrAngle(utcTime: Double, h: Double) -> Double {
        let (decl, _) = sunPosition(utcTime: utcTime, h: h)
        return -acotd(asrFactor + tand(abs(latitude - decl)))
    }

    // MARK: - Utilities

    /// UTC milliseconds for local year/month/day at 00:00:00 UTC.
    /// Mirrors JS: Date.UTC(year, month-1, day)
    private func utcMidnightMs(for date: Date) -> Double? {
        let cal = Calendar.current
        let c = cal.dateComponents([.year, .month, .day], from: date)
        guard let y = c.year, let mo = c.month, let d = c.day else { return nil }
        var utcComps = DateComponents()
        utcComps.year = y; utcComps.month = mo; utcComps.day = d
        utcComps.hour = 0; utcComps.minute = 0; utcComps.second = 0
        var utcCal = Calendar(identifier: .gregorian)
        utcCal.timeZone = TimeZone(abbreviation: "UTC")!
        guard let midnight = utcCal.date(from: utcComps) else { return nil }
        return midnight.timeIntervalSince1970 * 1000.0
    }

    private func localDateString(_ date: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        fmt.locale = Locale(identifier: "en_US_POSIX")
        return fmt.string(from: date)
    }

    // MARK: - Degree-based trig (mirrors praytime.js exactly)

    private func dmod(_ a: Double, _ b: Double) -> Double {
        return ((a.truncatingRemainder(dividingBy: b)) + b).truncatingRemainder(dividingBy: b)
    }
    private func sind(_ d: Double) -> Double { sin(d * .pi / 180) }
    private func cosd(_ d: Double) -> Double { cos(d * .pi / 180) }
    private func tand(_ d: Double) -> Double { tan(d * .pi / 180) }
    private func asind(_ d: Double) -> Double { asin(d) * 180 / .pi }
    private func acosd(_ d: Double) -> Double { acos(d) * 180 / .pi }
    private func atan2d(_ y: Double, _ x: Double) -> Double { atan2(y, x) * 180 / .pi }
    private func acotd(_ x: Double) -> Double { atan(1 / x) * 180 / .pi }
}

// MARK: - Schedule fallback (Strategy A)

/// Parse the 14-day JSON schedule blob and return prayer times for a given local date.
func prayerTimesFromScheduleJSON(_ json: String, for date: Date = Date()) -> PrayerTimes? {
    guard !json.isEmpty,
          let data = json.data(using: .utf8),
          let dict = try? JSONSerialization.jsonObject(with: data) as? [String: [String: String]]
    else { return nil }

    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM-dd"
    fmt.locale = Locale(identifier: "en_US_POSIX")
    let key = fmt.string(from: date)
    guard let day = dict[key] else { return nil }

    func parseTime(_ s: String?) -> Date? {
        guard let s, !s.isEmpty else { return nil }
        let parts = s.split(separator: ":").compactMap { Int($0) }
        guard parts.count == 2 else { return nil }
        var c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        c.hour = parts[0]; c.minute = parts[1]; c.second = 0
        return Calendar.current.date(from: c)
    }

    guard let fajr    = parseTime(day["fajr"]),
          let dhuhr   = parseTime(day["dhuhr"]),
          let asr     = parseTime(day["asr"]),
          let maghrib = parseTime(day["maghrib"]),
          let isha    = parseTime(day["isha"]) else { return nil }

    return PrayerTimes(fajr: fajr, dhuhr: dhuhr, asr: asr, maghrib: maghrib, isha: isha)
}

// MARK: - Helper: time formatting

func formatPrayerDate(_ date: Date) -> String {
    let fmt = DateFormatter()
    fmt.dateFormat = "h:mm a"
    fmt.amSymbol = "AM"; fmt.pmSymbol = "PM"
    return fmt.string(from: date)
}
