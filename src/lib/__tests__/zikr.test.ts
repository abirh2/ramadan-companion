import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { triggerHapticFeedback } from '../zikr'

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
})
