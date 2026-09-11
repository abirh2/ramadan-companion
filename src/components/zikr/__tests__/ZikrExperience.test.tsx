import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ZikrCounter } from '../ZikrCounter'
import { ZikrPhraseSelector } from '../ZikrPhraseSelector'
import { STANDARD_PHRASES } from '@/lib/zikr'

const phrase = STANDARD_PHRASES[0]

function CounterHarness({ target = 3 }: { target?: number | null }) {
  const [count, setCount] = useState(0)
  const progress = target ? Math.min((count / target) * 100, 100) : 0

  return (
    <ZikrCounter
      count={count}
      target={target}
      progress={progress}
      isGoalReached={target !== null && count >= target}
      currentPhrase={phrase}
      onIncrement={() => setCount((value) => value + 1)}
    />
  )
}

describe('ZikrCounter', () => {
  it('uses the full feature surface as a button and handles rapid taps', async () => {
    const user = userEvent.setup()
    render(<CounterHarness target={10} />)

    const counter = screen.getByRole('button', { name: /count subhanallah/i })
    for (let tap = 0; tap < 10; tap += 1) await user.click(counter)

    expect(screen.getByRole('status')).toHaveTextContent(/target complete/i)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10')
  })

  it('increments once for native keyboard activation', async () => {
    const user = userEvent.setup()
    render(<CounterHarness />)

    const counter = screen.getByRole('button', { name: /current count: 0 of 3/i })
    counter.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: /current count: 1 of 3/i })).toBeInTheDocument()
  })

  it('communicates free-count mode without rendering a progress bar', () => {
    render(<CounterHarness target={null} />)

    expect(screen.getByRole('button', { name: /free count/i })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})

describe('ZikrPhraseSelector', () => {
  it('opens an accessible sheet with Arabic, meanings, and default targets', async () => {
    const user = userEvent.setup()
    render(
      <ZikrPhraseSelector
        phrases={STANDARD_PHRASES}
        currentPhraseId={phrase.id}
        currentTarget={phrase.defaultTarget}
        onSelectPhrase={jest.fn()}
        onSetTarget={jest.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /change zikr or target/i }))
    const sheet = screen.getByRole('dialog', { name: /choose your zikr/i })

    expect(within(sheet).getByText(STANDARD_PHRASES[1].arabic)).toHaveAttribute('dir', 'rtl')
    expect(within(sheet).getByText(STANDARD_PHRASES[1].meaning)).toBeVisible()
    const alhamdulillahOption = within(sheet).getByRole('option', { name: /alhamdulillah/i })
    expect(within(alhamdulillahOption).getByText(`${STANDARD_PHRASES[1].defaultTarget}×`)).toBeVisible()
  })

  it('preserves phrase switching, free count, and custom targets', async () => {
    const user = userEvent.setup()
    const onSelectPhrase = jest.fn()
    const onSetTarget = jest.fn()
    render(
      <ZikrPhraseSelector
        phrases={STANDARD_PHRASES}
        currentPhraseId={phrase.id}
        currentTarget={phrase.defaultTarget}
        onSelectPhrase={onSelectPhrase}
        onSetTarget={onSetTarget}
      />
    )

    const trigger = screen.getByRole('button', { name: /change zikr or target/i })
    await user.click(trigger)
    await user.click(screen.getByRole('option', { name: /alhamdulillah/i }))
    expect(onSelectPhrase).toHaveBeenCalledWith('alhamdulillah')

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: /free count/i }))
    expect(onSetTarget).toHaveBeenCalledWith(null)

    const input = screen.getByLabelText(/custom target count/i)
    await user.clear(input)
    await user.type(input, '40')
    await user.click(screen.getByRole('button', { name: /^set$/i }))
    expect(onSetTarget).toHaveBeenCalledWith(40)
  })
})
