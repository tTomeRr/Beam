# Frontend Testing Guide

## Quick Start

```bash
# Navigate to frontend directory
cd /home/tomer/Projects/beam/frontend

# Run all tests
npm test

# Run tests without coverage (recommended due to import.meta.env issue)
npm test -- --no-coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/__tests__/pages/Login.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should login successfully"
```

## Test File Structure

```
frontend/src/__tests__/
├── helpers/
│   ├── fixtures.ts          # Mock data for testing
│   └── test-utils.tsx       # Testing utility functions
├── constants/
│   └── index.test.tsx       # Constants utility tests
├── services/
│   └── api.test.ts          # API service tests
├── components/
│   ├── layout/
│   │   └── Layout.test.tsx
│   └── insights/
│       └── GeminiInsights.test.tsx
└── pages/
    ├── Login.test.tsx
    ├── Dashboard.test.tsx
    ├── Categories.test.tsx
    ├── Transactions.test.tsx
    ├── BudgetPlanning.test.tsx
    └── Savings.test.tsx
```

## Writing New Tests

### 1. Unit Tests for Utilities

```typescript
// Example: Testing a utility function
import { myUtility } from '../../utils/myUtility';

describe('MyUtility', () => {
  it('should handle valid input', () => {
    const result = myUtility('test');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myUtility('')).toBe('');
    expect(myUtility(null)).toBe(null);
  });
});
```

### 2. Component Tests

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### 3. Component Tests with Router

```typescript
import { renderWithRouter } from '../helpers/test-utils';

describe('MyPage', () => {
  it('should navigate correctly', () => {
    renderWithRouter(<MyPage />, { route: '/my-route' });
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});
```

### 4. API Tests

```typescript
import { api } from '../../services/api';
import { mockFetch } from '../helpers/test-utils';

jest.mock('../../services/api');

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockFetch(mockData);

    const result = await api.myEndpoint.get();
    expect(result).toEqual(mockData);
  });
});
```

### 5. Async Tests

```typescript
import { waitFor } from '@testing-library/react';

it('should handle async operations', async () => {
  render(<MyAsyncComponent />);

  const button = screen.getByRole('button', { name: /load/i });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });
});
```

## Testing Patterns

### 1. Test Organization

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render basic elements', () => {});
    it('should render with props', () => {});
  });

  describe('User Interactions', () => {
    it('should handle clicks', () => {});
    it('should handle form submission', () => {});
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {});
    it('should handle errors', () => {});
  });
});
```

### 2. Using Mock Data

```typescript
import { mockUser, mockCategories } from '../helpers/fixtures';

it('should display user data', () => {
  render(<UserProfile user={mockUser} />);
  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
});
```

### 3. Testing Loading States

```typescript
it('should show loading indicator', async () => {
  mockApi.getData.mockImplementation(
    () => new Promise(resolve => setTimeout(() => resolve(data), 100))
  );

  render(<MyComponent />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

### 4. Testing Error States

```typescript
it('should handle errors gracefully', async () => {
  mockApi.getData.mockRejectedValue(new Error('Failed'));

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### 5. Testing Forms

```typescript
it('should submit form with valid data', async () => {
  const onSubmit = jest.fn();
  render(<MyForm onSubmit={onSubmit} />);

  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'John Doe' },
  });

  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
  });
});
```

## Common Testing Utilities

### From test-utils.tsx

```typescript
// Render with router
import { renderWithRouter } from '../helpers/test-utils';
renderWithRouter(<MyComponent />, { route: '/specific-route' });

// Mock fetch responses
import { mockFetch, mockFetchError } from '../helpers/test-utils';
mockFetch({ data: 'response' });
mockFetchError(404, 'Not Found');

// Mock localStorage
import { mockLocalStorage } from '../helpers/test-utils';
const storage = mockLocalStorage();
storage.setItem('key', 'value');
```

### From fixtures.ts

```typescript
import {
  mockUser,
  mockCategories,
  mockTransactions,
  mockBudgets,
  mockSavings,
  createMockTransaction,
  createMockCategory,
} from '../helpers/fixtures';

// Use predefined mocks
render(<Dashboard transactions={mockTransactions} />);

// Create custom mocks
const customTx = createMockTransaction({ amount: 500 });
```

## Query Priority

Follow this order when selecting elements:

1. **Accessible queries (preferred):**
   - `getByRole`
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`

2. **Semantic queries:**
   - `getByAltText`
   - `getByTitle`

3. **Test IDs (last resort):**
   - `getByTestId`

```typescript
// Good
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// Acceptable
screen.getByText(/welcome message/i);

// Avoid if possible
screen.getByTestId('submit-button');
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// Bad - Testing implementation
expect(component.state.isOpen).toBe(true);

// Good - Testing behavior
expect(screen.getByText('Modal Content')).toBeVisible();
```

### 2. Use Descriptive Test Names

```typescript
// Bad
it('works', () => {});

// Good
it('should display error message when login fails', () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should update counter on click', () => {
  // Arrange
  render(<Counter initialValue={0} />);

  // Act
  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);

  // Assert
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### 4. Clean Up After Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

### 5. Test Edge Cases

```typescript
it('should handle edge cases', () => {
  // Empty data
  render(<List items={[]} />);
  expect(screen.getByText(/no items/i)).toBeInTheDocument();

  // Large numbers
  render(<Amount value={999999999} />);

  // Special characters
  render(<Input value="test@#$%^" />);

  // Null/undefined
  render(<Component data={null} />);
});
```

## Debugging Tests

### 1. Print DOM

```typescript
import { screen } from '@testing-library/react';

it('debugging test', () => {
  render(<MyComponent />);
  screen.debug(); // Prints current DOM
});
```

### 2. Print Specific Element

```typescript
const element = screen.getByRole('button');
screen.debug(element);
```

### 3. Check Available Roles

```typescript
screen.logTestingPlaygroundURL();
```

### 4. Use --verbose Flag

```bash
npm test -- --verbose
```

## Common Issues & Solutions

### Issue 1: "Unable to find element"

**Solution:** Use `screen.debug()` to see actual DOM, then adjust query.

```typescript
// If this fails
screen.getByRole('button', { name: /submit/i });

// Try this
screen.getByText(/submit/i);
```

### Issue 2: Async Update Warning

**Solution:** Wrap in `act()` or use `waitFor()`.

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Issue 3: Test Timeout

**Solution:** Increase timeout or fix async handling.

```typescript
it('long running test', async () => {
  // code
}, 10000); // 10 second timeout
```

## Coverage Reports

After running tests with coverage:

```bash
npm test

# View HTML coverage report
open coverage/lcov-report/index.html
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Frontend Tests
  run: |
    cd frontend
    npm test -- --no-coverage --passWithNoTests
```

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Tips for Beam-Specific Testing

1. **Month Indexing:** Remember months are stored as 1-12, not 0-11
2. **Category Status:** Never delete categories, only set `isActive: false`
3. **Negative Budgets:** Test overspending scenarios (negative availableToSpend)
4. **Hebrew Text:** Ensure RTL layout tests
5. **localStorage:** Always mock it in tests
6. **API Mocking:** Use `jest.mock()` for api imports

## Conclusion

This testing guide provides the foundation for maintaining and extending the Beam frontend test suite. Follow TDD principles: write tests first, make them pass, then refactor.

For questions or issues, refer to the test files themselves as they contain many practical examples.
