import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

/** A native-only, optional confirmation when the compass enters Qibla alignment. */
export async function triggerQiblaAlignmentHaptic(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch (error) {
    // Alignment remains fully communicated in the UI if haptics are unavailable.
    console.debug('[QiblaCompass] Alignment haptic unavailable:', error)
  }
}
