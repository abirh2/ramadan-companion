import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { triggerQiblaAlignmentHaptic } from '@/lib/qiblaHaptics'

jest.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: jest.fn() },
}))

jest.mock('@capacitor/haptics', () => ({
  Haptics: { impact: jest.fn() },
  ImpactStyle: { Light: 'LIGHT' },
}))

describe('triggerQiblaAlignmentHaptic', () => {
  beforeEach(() => jest.clearAllMocks())

  it('uses a light impact on native platforms', async () => {
    jest.mocked(Capacitor.isNativePlatform).mockReturnValue(true)

    await triggerQiblaAlignmentHaptic()

    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light })
  })

  it('does not vibrate in the browser', async () => {
    jest.mocked(Capacitor.isNativePlatform).mockReturnValue(false)

    await triggerQiblaAlignmentHaptic()

    expect(Haptics.impact).not.toHaveBeenCalled()
  })
})
