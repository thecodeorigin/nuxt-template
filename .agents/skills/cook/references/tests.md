# Tests

> Test types, how to run them, patterns that work, and how to read failures.

## Test projects

### Vitest — unit project (node env)

- **Location**: `test/unit/**` (project root, cross-cutting) and `layers/*/test/unit/**` (per-layer)
- **Environment**: node (no DOM, no Nuxt runtime)
- **What to test**: Zod schemas, pure utility functions, pure TypeScript logic
- **Run**: `pnpm vitest run --project unit` or `pnpm test`

```ts
// layers/todo/test/unit/todo-schema.test.ts
import { describe, it, expect } from 'vitest'
import { CreateTodoSchema } from '#layers/todo/shared/schemas/todo'

describe('CreateTodoSchema', () => {
  it('rejects empty title', () => {
    expect(() => CreateTodoSchema.parse({ title: '' })).toThrow()
  })
  it('accepts valid input', () => {
    expect(CreateTodoSchema.parse({ title: 'Buy milk' })).toEqual({ title: 'Buy milk' })
  })
})
```

### Vitest — nuxt project (happy-dom env)

- **Location**: `layers/*/test/nuxt/**`
- **Environment**: happy-dom (Nuxt runtime available, basic DOM)
- **What to test**: Vue components, composables, page-level logic
- **Run**: `pnpm vitest run --project nuxt` or `pnpm test`

```ts
// layers/todo/test/nuxt/todo-page.test.ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import TodoPage from '#layers/todo/app/pages/todos.vue'

describe('TodoPage', () => {
  it('renders empty state when no todos', async () => {
    const wrapper = await mountSuspended(TodoPage)
    expect(wrapper.text()).toContain('No todos yet')
  })
})
```

### Playwright — e2e

- **Location**: `layers/*/tests/**` (per-layer e2e specs)
- **What to test**: full user flows in a real browser against the dev server
- **Run**: `pnpm test:e2e` or `E2E_EXTERNAL_SERVER=1 pnpm exec playwright test`

```ts
// layers/todo/tests/todo.e2e.ts
import { test, expect } from '@playwright/test'

test('create and delete a todo', async ({ page }) => {
  await page.goto('/api/auth/agent?redirect=/todos')
  await page.getByRole('button', { name: 'Add Todo' }).click()
  await page.getByLabel('Title').fill('Buy milk')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Buy milk')).toBeVisible()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText('Buy milk')).not.toBeVisible()
})
```

## Authentication in tests

### Browser flow (Playwright)

Navigate to the auth agent endpoint — it sets an HttpOnly session cookie for the browser:

```ts
// In Playwright test
await page.goto('/api/auth/agent?redirect=/dashboard')
// Now the browser has a valid session cookie for alice@seed.local
```

### API-driven flow (faster for tests)

```ts
// POST to get a session
const response = await request.post('/api/auth/agent')
const sessionId = response.headers()['x-session-id']  // check actual header name in auth layer

// Use sessionid cookie for subsequent requests
await context.addCookies([{
  name: 'sessionid',
  value: sessionId,
  domain: 'localhost',
  path: '/',
  httpOnly: true,
  secure: false,
  sameSite: 'Lax'
}])
```

Check `layers/auth/server/api/auth/agent.post.ts` for the exact endpoint behavior and response shape.

## Patterns that work

### API-driven flows beat UI-driven for Nuxt UI components

Reka-UI-based components (USelect, UDropdownMenu, etc.) are often flaky in headless Playwright. When a form interaction is flaky:

1. Bypass the UI — call the API directly in the test
2. Verify the result by navigating to the feature and checking the rendered state

```ts
// Instead of: fill form → submit
// Do: POST to API directly
const todo = await request.post('/api/todos', {
  data: { title: 'Buy milk' },
  headers: { cookie: `sessionid=${sessionId}` }
})
expect(todo.status()).toBe(201)

// Then verify UI reflects the state
await page.goto('/todos')
await expect(page.getByText('Buy milk')).toBeVisible()
```

### Add `data-testid` for stable selectors

When a selector is flaky or the component doesn't expose a good aria role, add `data-testid` to the wrapper:

```vue
<UDropdownMenu data-testid="todo-actions-menu">
```

```ts
await page.locator('[data-testid="todo-actions-menu"]').click()
```

### Wait for responses, not timeouts

```ts
// GOOD — wait for the API response
await Promise.all([
  page.waitForResponse('/api/todos'),
  page.getByRole('button', { name: 'Save' }).click()
])

// BAD — arbitrary sleep
await page.waitForTimeout(1000)
```

### Keyboard nav for dropdowns

When click doesn't work in headless:

```ts
await page.getByTestId('todo-actions-menu').focus()
await page.keyboard.press('Enter')
await page.getByRole('menuitem', { name: 'Delete' }).click()
```

## Reading failures

### Vitest failures

1. Read the assertion diff — expected vs actual
2. Check if the import alias resolves: `#layers/todo/...` aliases require `nuxt prepare` to have been run
3. If `Cannot find module '#layers/...'` in unit tests: these aliases only work in the Nuxt runtime — move to a nuxt project test, or use relative imports

### Playwright failures

1. **Read `test-results/<spec>/error-context.md` first** — has the assertion, DOM snapshot at failure, and often a screenshot
2. If selector not found: check if the element rendered at all (`await expect(page.locator('.my-class')).toBeVisible({ timeout: 5000 })`)
3. If click doesn't trigger the expected action: check if a loading state blocked it, or if it's a Reka-UI component (use API-driven approach instead)
4. If page shows error: check `list_console_messages` or Playwright's `page.on('console', ...)` hook

## Common fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Locator not found | Selector matches wrong element / renders later | Use `data-testid` + `waitForSelector` |
| Network-driven content race | Component renders before data loads | `page.waitForResponse('/api/...')` then assert |
| Stale uid after navigation | uid from snapshot is invalidated | Re-snapshot after navigation, get fresh uid |
| Reka dropdown won't open in headless | Reka-UI headless issue | Add `data-testid` + keyboard, or API-driven |
| `Cannot find module '#layers/todo/...'` in unit tests | Alias not in node env | Move test to nuxt project, or use relative path |

## When to write tests

Write a test when:
- Behavior has state machine / conditions / multiple branches
- You just fixed a regression (write the test that would have caught it)
- Permission / role gating matters (auth tests are worth writing)
- Flow involves session / cookie / SSR

Don't write a test when:
- Pure glue code with no branches
- The test would be more brittle than the thing it tests (pixel positions, exact CSS classes)
- The feature is a configuration change with no logic

## Don't fight the framework

If a test passes with `pnpm test:e2e:ui` (real browser) but fails in headless:
- Don't add `waitForTimeout` to paper over it
- Replace with an API-driven approach that asserts the same outcome
- The test should verify behavior, not a specific UI interaction pattern
