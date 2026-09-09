import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { shouldTriggerZikrHaptic, triggerHapticFeedback } from '../zikr'

describe('zikr haptic feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses a light native impact for a normal increment', async () => {
    jest.mocked(Capacitor.isNativePlatform).mockReturnValue(true)

    await triggerHapticFeedback('increment')

    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light })
    expect(Haptics.notification).not.toHaveBeenCalled()
  })

  it('uses a distinct, calm native completion notification', async () => {
    jest.mocked(Capacitor.isNativePlatform).mockReturnValue(true)

    await triggerHapticFeedback('completion')

    expect(Haptics.notification).toHaveBeenCalledWith({ type: NotificationType.Success })
    expect(Haptics.impact).not.toHaveBeenCalled()
  })

  it('throttles only rapid increment feedback while preserving target completion', () => {
    expect(shouldTriggerZikrHaptic('increment', 1_000, 1_030)).toBe(false)
    expect(shouldTriggerZikrHaptic('increment', 1_000, 1_080)).toBe(true)
    expect(shouldTriggerZikrHaptic('completion', 1_000, 1_001)).toBe(true)
  })
})
