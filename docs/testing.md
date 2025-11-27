# Testing Guide - Deen Companion

## Overview

This project uses **Jest** and **React Testing Library** for unit and integration testing. The testing infrastructure follows Next.js 15 best practices and focuses on testing user behavior rather than implementation details.

---

## Testing Stack

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom DOM matchers
- **@testing-library/user-event** - Realistic user interaction simulation
- **jest-environment-jsdom** - Browser environment simulation

---

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:ci

# Run tests with coverage report
npm run test:coverage
```

---

## Test File Structure

Tests are colocated with source code in `__tests__` directories:

```
src/
├── app/
│   └── __tests__/
│       └── page.test.tsx
├── components/
│   ├── __tests__/
│   │   └── ThemeToggle.test.tsx
│   └── dashboard/
│       └── __tests__/
│           ├── NextPrayerCard.test.tsx
│           ├── RamadanCard.test.tsx
│           ├── QuranCard.test.tsx
│           ├── HadithCard.test.tsx
│           └── CharityCard.test.tsx
```

---

## Testing Philosophy

### 1. Test User Behavior, Not Implementation

**Good:**
```typescript
// Test what users see and do
expect(screen.getByText('Next Prayer')).toBeInTheDocument()
await user.click(screen.getByRole('button', { name: /toggle theme/i }))
```

**Bad:**
```typescript
// Don't test internal state or props
expect(component.state.theme).toBe('dark')
expect(component.props.onClick).toHaveBeenCalled()
```

### 2. Use Accessible Queries

Prefer queries in this order:
1. `getByRole` - Most accessible
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Form inputs
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

### 3. Test Accessibility

```typescript
it('has proper accessibility attributes', () => {
  render(<ThemeToggle />)
  
  const button = screen.getByRole('button', { name: /toggle theme/i })
  expect(button).toHaveAttribute('aria-label', 'Toggle theme')
})
```

---

## Writing New Tests

### Component Test Template

```typescript
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { YourComponent } from '../YourComponent'

describe('YourComponent', () => {
  it('renders component', () => {
    render(<YourComponent />)
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<YourComponent />)
    
    await user.click(screen.getByRole('button'))
    
    expect(screen.getByText('Updated Text')).toBeInTheDocument()
  })
})
```

---

## Mocking

### Next.js Utilities

Next.js router and navigation are mocked globally in `jest.setup.js`:

```javascript
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }
  },
}))
```

### next-themes

Theme provider is mocked to avoid SSR hydration issues:

```javascript
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}))
```

### External APIs

When adding API calls, mock them in individual test files:

```typescript
jest.mock('@/lib/api', () => ({
  fetchPrayerTimes: jest.fn(() => 
    Promise.resolve({ fajr: '05:30', dhuhr: '12:00' })
  ),
}))
```

---

## Test Coverage

Current test coverage:

- ✅ ThemeToggle component
- ✅ NextPrayerCard component
- ✅ RamadanCard component
- ✅ QuranCard component
- ✅ HadithCard component
- ✅ CharityCard component
- ✅ Dashboard page integration

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Check coverage:
```bash
npm run test:coverage
```

---

## Best Practices

### 1. Test File Naming

- Test files: `ComponentName.test.tsx`
- Colocate with source in `__tests__` directories
- Match source file names exactly

### 2. Describe Blocks

```typescript
describe('ComponentName', () => {
  describe('rendering', () => {
    it('renders title', () => { ... })
  })
  
  describe('user interactions', () => {
    it('handles button click', () => { ... })
  })
})
```

### 3. Clear Test Names

**Good:**
```typescript
it('toggles from light to dark theme when clicked')
it('displays error message when API fails')
```

**Bad:**
```typescript
it('works')
it('test button')
```

### 4. Arrange-Act-Assert

```typescript
it('updates count when button is clicked', async () => {
  // Arrange
  const user = userEvent.setup()
  render(<Counter />)
  
  // Act
  await user.click(screen.getByRole('button', { name: /increment/i }))
  
  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### 5. Avoid Implementation Details

**Good:**
```typescript
expect(screen.getByRole('heading')).toHaveTextContent('Dashboard')
```

**Bad:**
```typescript
expect(container.querySelector('.dashboard-title')).toHaveTextContent('Dashboard')
```

---

## Common Patterns

### Testing Async Components

```typescript
it('displays data after loading', async () => {
  render(<AsyncComponent />)
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText('Data Loaded')).toBeInTheDocument()
  })
})
```

### Testing Forms

```typescript
it('submits form with user input', async () => {
  const user = userEvent.setup()
  const onSubmit = jest.fn()
  
  render(<Form onSubmit={onSubmit} />)
  
  await user.type(screen.getByLabelText(/name/i), 'John Doe')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
})
```

### Testing Error States

```typescript
it('displays error message on failure', async () => {
  mockAPI.fetchData.mockRejectedValueOnce(new Error('Failed'))
  
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

---

## Debugging Tests

### 1. Print DOM Structure

```typescript
import { screen } from '@testing-library/react'

screen.debug() // Prints entire DOM
screen.debug(screen.getByRole('button')) // Prints specific element
```

### 2. Query Available Roles

```typescript
screen.logTestingPlaygroundURL()
```

### 3. Run Single Test

```bash
npm test -- ComponentName.test.tsx
```

### 4. Run in Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
- name: Run tests
  run: npm run test:ci
  
- name: Upload coverage
  run: npm run test:coverage
```

---

## Future Testing Enhancements

### V1 (Current)
- ✅ Component unit tests
- ✅ Page integration tests
- ✅ Accessibility testing

### Later
- [ ] E2E tests (Playwright/Cypress)
- [ ] Visual regression tests
- [ ] Performance tests
- [ ] API integration tests with MSW
- [ ] Snapshot tests for static content

---

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing Playground](https://testing-playground.com/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Getting Help

When tests fail:
1. Read the error message carefully
2. Use `screen.debug()` to inspect DOM
3. Check component implementation for changes
4. Verify mocks are configured correctly
5. Ensure async operations use `waitFor` or `await`

Remember: **If tests are hard to write, the component might be too complex. Consider refactoring.**

