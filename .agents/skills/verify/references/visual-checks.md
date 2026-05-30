# Visual Checks

> Chrome DevTools MCP patterns for the live walkthrough. Snapshot-first,
> screenshot only when layout is the thing being verified.

## Dev server lifecycle

Verify runs against a live `pnpm dev`. Start it in the background if not
already up:

```bash
# Check first
curl -sf http://localhost:3002 > /dev/null && echo up || echo down

# Start in background if down
pnpm dev    # run_in_background: true
```

`pnpm dev` (= `pnpm cli dev up`) streams Nuxt + maildev together.
Default ports:

- Nuxt — 3002
- MailDev SMTP — 1025
- MailDev web UI — 1080 (for verifying transactional emails)

If the port is occupied:

```bash
netstat -ano | findstr :3002              # find PID
taskkill /F /PID <pid>                    # Windows
```

## Snapshot vs screenshot (pick the cheaper signal)

| Use `take_snapshot` for | Use `take_screenshot` for |
|---|---|
| Click targets, focus state | Layout overlap / spacing |
| Visible text / labels | Color / theme verification |
| ARIA roles + values | Hero / banner visual correctness |
| Form field state (filled, disabled) | Responsive breakpoints |
| Verifying an element exists | Visual regression |

Default: snapshot. Screenshot when (and only when) the criterion
explicitly involves visual rendering. A typical verify run produces
many snapshots and a handful of screenshots.

## Standard interaction loop

```
take_snapshot                                        ← find uid
  → fill({ uid, value }) or click({ uid })
  → wait_for({ text: ['expected outcome'] })
  → take_snapshot                                    ← confirm new state
  → list_console_messages({ types: ['error'] })      ← regression check
```

UIDs from `take_snapshot` go stale after navigation. Always re-snapshot
after `navigate_page`.

## Authentication shortcuts

Use the dev backdoors — they're the fastest way to put the browser in
the right session.

```js
// Default agent user (personal-org admin) — one navigation, no body
navigate_page("http://localhost:3002/api/auth/agent?redirect=/dashboard")

// Specific seed user
evaluate_script(`
  const resp = await fetch('/api/auth/dev-login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'alice@seed.local' }),
    credentials: 'include',
  })
  return { status: resp.status, body: await resp.json() }
`)
```

If `dev-login` returns 404, the seed users haven't been created yet:

```js
// Seed first
evaluate_script(`
  const resp = await fetch('/api/auth/dev-seed', { method: 'POST', credentials: 'include' })
  return await resp.json()
`)
```

To verify the current session (HttpOnly cookies are invisible to
`document.cookie`):

```js
evaluate_script(`
  const resp = await fetch('/api/auth/me', { credentials: 'include' })
  return { status: resp.status, body: await resp.json() }
`)
```

## After every action: console + network

A page can render visually correct and still be silently broken.

```
list_console_messages({ types: ['error', 'warn'] })
```

- `error` → failure; must be triaged
- `warn` → usually noise, but flag any warning that names a file in
  the diff

```
list_network_requests
```

Filter to the routes the change touched. Look for:

- 4xx / 5xx responses
- Requests that never resolve (still pending after the wait)
- Duplicate requests (a missing cache or a re-render bug)

## When click doesn't work (Reka-UI / Nuxt UI menus)

Reka-UI dropdowns and menus sometimes ignore `click` in headless
Chromium. Try in order:

1. Focus the trigger element, then `press_key("Enter")`
2. `evaluate_script` to trigger the action programmatically
3. Add `data-testid` to the wrapper, retry `click`
4. Bypass the UI: hit the API directly and verify the post-state on
   the next page load

Mark anything that needs the bypass as a **headless limitation** in
the report, not a feature failure.

## When the page is blank

Diagnose in order:

1. Mid-render — re-snapshot after a `wait_for` on known text
2. Mid-navigation — `wait_for` text from the destination page first
3. Hydration error — `list_console_messages({ types: ['error'] })`
4. Server 500 — check the `pnpm dev` background log

## Multi-viewport (only if layout matters)

For responsive criteria:

```
resize_page({ width: 1440, height: 900 })  // desktop
take_screenshot
resize_page({ width: 375, height: 812 })   // mobile
take_screenshot
```

Most criteria are layout-agnostic; skip multi-viewport unless the
plan explicitly asked for responsive support.

## Mail verification

For features that send email (signup, password reset, invitations):

1. Trigger the action via the UI
2. Open <http://localhost:1080> (MailDev web UI) — `navigate_page`
3. `take_snapshot` of the inbox — confirm the email arrived
4. Click the message — verify subject, from-address, body content

If MailDev isn't running, `pnpm dev` didn't start it; restart with
`pnpm dev` (the bundled `up` command runs both processes).

## Performance (only when asked)

If the plan included a performance criterion (LCP, INP, CLS):

```
performance_start_trace
navigate_page(url)
wait_for({ text: ['<page settled signal>'] })
performance_stop_trace
performance_analyze_insight
```

Load the `chrome-devtools-mcp:debug-optimize-lcp` skill for full
performance debugging. Don't measure performance on every verification
run — it's slow and noisy unless the change targets it.

## Don't spam screenshots

Each screenshot is slow and bloats the report. Rules:

- One snapshot per criterion is mandatory
- One screenshot per criterion **only if** layout / visual rendering
  is part of the criterion
- Re-screenshot after a fix, not after every snapshot

If the report has more screenshots than acceptance criteria, you're
over-capturing.
