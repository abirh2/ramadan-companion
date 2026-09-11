import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SelectionSheet } from '../selection-sheet'

const options = [
  { value: 'asad', title: 'Muhammad Asad', subtitle: 'Contemporary translation' },
  { value: 'sahih', title: 'Saheeh International', subtitle: 'Clear modern English' },
  { value: 'pickthall', title: 'Marmaduke Pickthall', subtitle: 'Classic English' },
]

describe('SelectionSheet', () => {
  it('opens a labelled sheet, exposes selection state, and restores focus', async () => {
    const user = userEvent.setup()
    render(
      <SelectionSheet
        label="Translation"
        value="asad"
        options={options}
        onValueChange={jest.fn()}
      />
    )

    const trigger = screen.getByRole('combobox', { name: /translation/i })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog', { name: 'Translation' })
    expect(within(dialog).getByRole('option', { name: /muhammad asad/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('filters long lists immediately and shows an empty state', async () => {
    const user = userEvent.setup()
    render(
      <SelectionSheet
        label="Translation"
        value="asad"
        options={options}
        onValueChange={jest.fn()}
        searchable
      />
    )

    await user.click(screen.getByRole('combobox', { name: /translation/i }))
    const search = await screen.findByRole('searchbox', { name: /search translation/i })
    await user.type(search, 'pickthall')

    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: /pickthall/i })).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'not available')
    expect(screen.getByRole('status')).toHaveTextContent('No translations found')
  })

  it('commits a choice and closes the sheet', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    render(
      <SelectionSheet
        label="Translation"
        value="asad"
        options={options}
        onValueChange={onValueChange}
      />
    )

    const trigger = screen.getByRole('combobox', { name: /translation/i })
    await user.click(trigger)
    await user.click(await screen.findByRole('option', { name: /saheeh international/i }))

    expect(onValueChange).toHaveBeenCalledWith('sahih')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
