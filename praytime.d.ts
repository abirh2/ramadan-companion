/**
 * Type declarations for praytime library
 * @see https://praytimes.org/manual
 */

declare module 'praytime' {
  export interface PrayTimeTimes {
    fajr: string
    sunrise: string
    dhuhr: string
    asr: string
    sunset: string
    maghrib: string
    isha: string
    midnight: string
  }

  export interface PrayTimeAdjustParams {
    fajr?: number | string
    dhuhr?: number | string
    asr?: 'Standard' | 'Hanafi' | number
    factor?: number
    maghrib?: number | string
    isha?: number | string
    midnight?: 'Standard' | 'Jafari'
    highLats?: 'None' | 'NightMiddle' | 'OneSeventh' | 'AngleBased'
  }

  export interface PrayTimeTuneParams {
    fajr?: number
    sunrise?: number
    dhuhr?: number
    asr?: number
    sunset?: number
    maghrib?: number
    isha?: number
    midnight?: number
  }

  export interface PrayTimeMethods {
    MWL: { fajr: number; isha: number }
    ISNA: { fajr: number; isha: number }
    Egypt: { fajr: number; isha: number }
    Makkah: { fajr: number; isha: string }
    Karachi: { fajr: number; isha: number }
    Tehran: { fajr: number; maghrib: number; midnight: string }
    Jafari: { fajr: number; maghrib: number; midnight: string }
    France: { fajr: number; isha: number }
    Russia: { fajr: number; isha: number }
    Singapore: { fajr: number; isha: number }
    defaults: { isha: number; maghrib: string; midnight: string }
    [key: string]: any
  }

  export type PrayTimeFormat = '24h' | '12h' | '12H' | 'x' | 'X'
  export type PrayTimeRounding = 'nearest' | 'up' | 'down' | 'none'

  export class PrayTime {
    methods: PrayTimeMethods
    settings: any

    constructor(method?: string)

    // Setters (chainable)
    method(method: string): this
    adjust(params: PrayTimeAdjustParams): this
    location(location: [number, number]): this
    timezone(timezone: string): this
    tune(tune: PrayTimeTuneParams): this
    round(rounding?: PrayTimeRounding): this
    format(format: PrayTimeFormat): this
    set(settings: any): this
    utcOffset(utcOffset?: number | 'auto'): this

    // Getters
    times(date?: Date | number[] | number): PrayTimeTimes
    getTimes(
      date?: Date | number[] | number,
      location?: [number, number],
      timezone?: string | number,
      dst?: number,
      format?: PrayTimeFormat
    ): PrayTimeTimes

    // Deprecated
    setMethod(method: string): void
  }
}

