package com.deencompanion.app.widgets

import org.json.JSONObject
import java.util.Calendar
import java.util.Date
import java.util.TimeZone
import kotlin.math.*

// Faithful Kotlin port of praytime.js v3.2 by Hamid Zarrabi-Zadeh
// Source: https://praytimes.org  |  License: MIT
//
// Strategy B (primary)  – compute from stored lat/lng/method so widget never goes stale.
// Strategy A (fallback) – read 14-day JSON schedule written by the app.

data class PrayerTimes(
    val fajr: Date,
    val dhuhr: Date,
    val asr: Date,
    val maghrib: Date,
    val isha: Date
)

private data class MethodParams(
    val fajrAngle: Double,
    val ishaAngle: Double?,    // null → use ishaMinutes
    val ishaMinutes: Double?,
    val maghribAngle: Double   // 0 → Sunset + 1 min; > 0 → computed as angle
)

private fun angleMethod(fajr: Double, isha: Double, maghrib: Double = 0.0) =
    MethodParams(fajr, isha, null, maghrib)

private fun minutesMethod(fajr: Double, isha: Double) =
    MethodParams(fajr, null, isha, 0.0)

private val METHOD_TABLE = mapOf(
    "0" to angleMethod(16.0, 14.0, 4.0),   // Jafari
    "1" to angleMethod(18.0, 18.0),          // Karachi
    "2" to angleMethod(15.0, 15.0),          // ISNA
    "3" to angleMethod(19.5, 17.5),          // Egypt
    "4" to minutesMethod(18.5, 90.0),        // Makkah (Umm al-Qura)
    "5" to angleMethod(18.0, 17.0),          // MWL
    "7" to angleMethod(17.7, 14.0, 4.5),    // Tehran
)
private val DEFAULT_METHOD = METHOD_TABLE["4"]!!

class PrayerCalculator(
    private val latitude: Double,
    private val longitude: Double,
    /** AlAdhan method ID ("0"–"7") */
    private val methodId: String,
    /** "0" = Standard (factor 1), "1" = Hanafi (factor 2) */
    private val madhabId: String
) {
    private val method get() = METHOD_TABLE[methodId] ?: DEFAULT_METHOD
    private val asrFactor get() = if (madhabId == "1") 2.0 else 1.0

    // -------------------------------------------------------------------------
    // Public interface
    // -------------------------------------------------------------------------

    fun compute(date: Date = Date()): PrayerTimes? {
        val utcTime = utcMidnightMs(date) ?: return null

        val init = mutableMapOf(
            "fajr" to 5.0, "sunrise" to 6.0, "dhuhr" to 12.0,
            "asr" to 13.0, "sunset" to 18.0, "maghrib" to 18.0,
            "isha" to 18.0, "midnight" to 24.0
        )

        var times = init
        repeat(2) { times = processTimes(times, utcTime) }
        adjustHighLats(times, utcTime)
        updateTimes(times)

        return prayerTimesFromMap(times, utcTime)
    }

    /** Convenience: format a Date as "h:mm AM/PM" in local timezone */
    fun formatTime(date: Date): String {
        val cal = Calendar.getInstance()
        cal.time = date
        val h = cal.get(Calendar.HOUR)
        val m = cal.get(Calendar.MINUTE)
        val ampm = if (cal.get(Calendar.AM_PM) == Calendar.AM) "AM" else "PM"
        val hDisplay = if (h == 0) 12 else h
        return "%d:%02d %s".format(hDisplay, m, ampm)
    }

    /** Format countdown from now to a future Date as "Xh Ym" */
    fun countdownTo(target: Date): String {
        val diffMs = target.time - System.currentTimeMillis()
        if (diffMs <= 0) return "0m"
        val totalMin = (diffMs / 60_000).toInt()
        val h = totalMin / 60
        val m = totalMin % 60
        return if (h > 0) "${h}h ${m}m" else "${m}m"
    }

    // -------------------------------------------------------------------------
    // Pipeline
    // -------------------------------------------------------------------------

    private fun processTimes(
        times: Map<String, Double>,
        utcTime: Double
    ): MutableMap<String, Double> {
        val horizon = 0.833
        val m = method
        val t = times.toMutableMap()

        t["fajr"]    = angleTime(m.fajrAngle, utcTime, times["fajr"]!!, -1.0)
        t["sunrise"] = angleTime(horizon,      utcTime, times["sunrise"]!!, -1.0)
        t["dhuhr"]   = midDay(utcTime, times["dhuhr"]!!)
        t["asr"]     = angleTime(asrAngle(utcTime, times["asr"]!!), utcTime, times["asr"]!!)
        t["sunset"]  = angleTime(horizon, utcTime, times["sunset"]!!)

        t["maghrib"] = if (m.maghribAngle > 0)
            angleTime(m.maghribAngle, utcTime, times["maghrib"]!!)
        else Double.NaN

        t["isha"] = m.ishaAngle?.let { angleTime(it, utcTime, times["isha"]!!) } ?: Double.NaN

        t["midnight"] = midDay(utcTime, times["midnight"] ?: 0.0) + 12.0
        return t
    }

    private fun updateTimes(times: MutableMap<String, Double>) {
        val m = method
        if (m.maghribAngle == 0.0) {
            times["maghrib"] = (times["sunset"] ?: 18.0) + 1.0 / 60.0
        }
        m.ishaMinutes?.let { mins ->
            times["isha"] = (times["maghrib"] ?: 18.0) + mins / 60.0
        }
    }

    private fun adjustHighLats(times: MutableMap<String, Double>, utcTime: Double) {
        val night = 24.0 + (times["sunrise"] ?: 6.0) - (times["sunset"] ?: 18.0)
        val portion = night / 2.0

        val fajrDiff = ((times["fajr"] ?: Double.NaN) - (times["sunrise"] ?: 0.0)) * -1.0
        if ((times["fajr"] ?: Double.NaN).isNaN() || fajrDiff > portion) {
            times["fajr"] = (times["sunrise"] ?: 0.0) - portion
        }
        val ishaDiff = (times["isha"] ?: Double.NaN) - (times["sunset"] ?: 0.0)
        if ((times["isha"] ?: Double.NaN).isNaN() || ishaDiff > portion) {
            times["isha"] = (times["sunset"] ?: 0.0) + portion
        }
        if (method.maghribAngle > 0) {
            val maghribDiff = (times["maghrib"] ?: Double.NaN) - (times["sunset"] ?: 0.0)
            if ((times["maghrib"] ?: Double.NaN).isNaN() || maghribDiff > portion) {
                times["maghrib"] = (times["sunset"] ?: 0.0) + portion
            }
        }
    }

    private fun prayerTimesFromMap(times: Map<String, Double>, utcTime: Double): PrayerTimes? {
        fun toDate(key: String): Date? {
            val h = times[key] ?: return null
            if (h.isNaN()) return null
            val ms = utcTime + (h - longitude / 15.0) * 3_600_000.0
            val rounded = kotlin.math.round(ms / 60_000.0) * 60_000L
            return Date(rounded)
        }
        return PrayerTimes(
            fajr    = toDate("fajr")    ?: return null,
            dhuhr   = toDate("dhuhr")   ?: return null,
            asr     = toDate("asr")     ?: return null,
            maghrib = toDate("maghrib") ?: return null,
            isha    = toDate("isha")    ?: return null
        )
    }

    // -------------------------------------------------------------------------
    // Sun position (degree-based arithmetic mirrors praytime.js)
    // -------------------------------------------------------------------------

    private data class SunPos(val decl: Double, val eq: Double)

    private fun sunPosition(utcTime: Double, h: Double): SunPos {
        val D = utcTime / 864e5 - 10957.5 + h / 24.0 - longitude / 360.0
        val g = dmod(357.529 + 0.98560028 * D, 360.0)
        val q = dmod(280.459 + 0.98564736 * D, 360.0)
        val L = dmod(q + 1.915 * sind(g) + 0.020 * sind(2 * g), 360.0)
        val e = 23.439 - 0.00000036 * D
        val RA = dmod(atan2d(cosd(e) * sind(L), cosd(L)) / 15.0, 24.0)
        return SunPos(decl = asind(sind(e) * sind(L)), eq = q / 15.0 - RA)
    }

    private fun midDay(utcTime: Double, h: Double): Double {
        val (_, eq) = sunPosition(utcTime, h)
        return dmod(12.0 - eq, 24.0)
    }

    private fun angleTime(angle: Double, utcTime: Double, h: Double, dir: Double = 1.0): Double {
        val (decl, _) = sunPosition(utcTime, h)
        val num = -sind(angle) - sind(latitude) * sind(decl)
        val denom = cosd(latitude) * cosd(decl)
        if (abs(denom) < 1e-10) return Double.NaN
        val ratio = num / denom
        if (ratio < -1 || ratio > 1) return Double.NaN
        val diff = acosd(ratio) / 15.0
        return midDay(utcTime, h) + diff * dir
    }

    private fun asrAngle(utcTime: Double, h: Double): Double {
        val (decl, _) = sunPosition(utcTime, h)
        return -acotd(asrFactor + tand(abs(latitude - decl)))
    }

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    /** UTC milliseconds for local year/month/day at 00:00:00 UTC — mirrors Date.UTC(y,m-1,d) */
    private fun utcMidnightMs(date: Date): Double? {
        val local = Calendar.getInstance()
        local.time = date
        val y = local.get(Calendar.YEAR)
        val mo = local.get(Calendar.MONTH)
        val d = local.get(Calendar.DAY_OF_MONTH)
        val utcCal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        utcCal.set(y, mo, d, 0, 0, 0)
        utcCal.set(Calendar.MILLISECOND, 0)
        return utcCal.timeInMillis.toDouble()
    }

    // Degree-based trig
    private fun sind(d: Double) = sin(d * PI / 180)
    private fun cosd(d: Double) = cos(d * PI / 180)
    private fun tand(d: Double) = tan(d * PI / 180)
    private fun asind(d: Double) = asin(d) * 180 / PI
    private fun acosd(d: Double) = acos(d) * 180 / PI
    private fun atan2d(y: Double, x: Double) = atan2(y, x) * 180 / PI
    private fun acotd(x: Double) = atan(1.0 / x) * 180 / PI
    private fun dmod(a: Double, b: Double) = ((a % b) + b) % b
}

// -------------------------------------------------------------------------
// Strategy A fallback: parse 14-day schedule JSON
// -------------------------------------------------------------------------

/** Parse the JSON schedule blob and return prayer times for a given date. */
fun prayerTimesFromScheduleJSON(json: String, date: Date = Date()): PrayerTimes? {
    if (json.isEmpty()) return null
    return try {
        val obj = JSONObject(json)
        val cal = Calendar.getInstance()
        cal.time = date
        val key = "%04d-%02d-%02d".format(
            cal.get(Calendar.YEAR),
            cal.get(Calendar.MONTH) + 1,
            cal.get(Calendar.DAY_OF_MONTH)
        )
        val day = obj.optJSONObject(key) ?: return null

        fun parse(key2: String): Date? {
            val s = day.optString(key2).takeIf { it.isNotEmpty() } ?: return null
            val parts = s.split(":").mapNotNull { it.toIntOrNull() }
            if (parts.size < 2) return null
            val c = Calendar.getInstance()
            c.time = date
            c.set(Calendar.HOUR_OF_DAY, parts[0])
            c.set(Calendar.MINUTE, parts[1])
            c.set(Calendar.SECOND, 0)
            c.set(Calendar.MILLISECOND, 0)
            return c.time
        }

        PrayerTimes(
            fajr    = parse("fajr")    ?: return null,
            dhuhr   = parse("dhuhr")   ?: return null,
            asr     = parse("asr")     ?: return null,
            maghrib = parse("maghrib") ?: return null,
            isha    = parse("isha")    ?: return null
        )
    } catch (e: Exception) {
        null
    }
}
