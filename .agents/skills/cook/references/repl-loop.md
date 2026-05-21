# REPL Loop

> Browser automation patterns using Chrome DevTools MCP. Fast, structured, and repeatable.

## Tool selection (pick the cheapest signal)

| Goal | Tool | Speed | When |
|---|---|---|---|
| Check DOM structure / ARIA | `take_snapshot` | Fast | 90% of cases |
| Check visual layout | `take_screenshot` | Slow | Only when layout/styling matters |
| Check runtime state | `evaluate_script` | Medium | Cookies, fetch, Vue/Nuxt state |
| Wait for state change | `wait_for({ text: [...] })` | — | After every user action |
| Check console errors | `list_console_messages({ types: ['error', 'warn'] })` | Fast | After any navigation or mutation |
| Click / type | `click({ uid })`, `fill({ uid, value })` | — | After taking a fresh snapshot |
| Check network | `list_network_requests` | Fast | When request failing silently |

**`take_snapshot` first, 90% of the time.** It returns the a11y tree — structured, fast, and shows roles/labels/values. Use `take_screenshot` only when you need to verify visual rendering (layout overlap, spacing, color).

## Standard flow

```
take_snapshot
  → find uid for target element
  → click or fill
  → wait_for expected text/state
  → take_snapshot (or take_screenshot for layout)
```

UIDs go stale across navigation. Always `take_snapshot` again after a page navigation.

## Authentication

### Browser flow (preferred for most tests)

Navigate to the auth agent endpoint — it sets an HttpOnly session cookie:

```
navigate_page("http://localhost:3000/api/auth/agent?redirect=/dashboard")
```

After this, all subsequent requests from the browser have a valid session as `alice@seed.local`.

### API-driven (for repeated auth in headless tests)

```
evaluate_script(`
  const resp = await fetch('/api/auth/agent', { method: 'POST' })
  const data = await resp.json()
  // session cookie set automatically by the browser
  return { status: resp.status, ok: resp.ok }
`)
```

Check `layers/auth/server/api/auth/agent.post.ts` for the exact endpoint contract.

## Snapshot vs screenshot

| Snapshot (`take_snapshot`) | Screenshot (`take_screenshot`) |
|---|---|
| Returns a11y tree as text | Returns a pixel image |
| Fast; no visual output | Slow; visual output |
| Shows roles, labels, values, focus state | Shows layout, colors, overflow |
| Use for: click targets, form state, visible text, aria attributes | Use for: layout verification, overlap detection, visual regression |

Don't spam screenshots — each one is slow and bloats context. One screenshot to confirm layout, then continue with snapshots.

## When click doesn't work in headless (Reka-UI / Nuxt UI)

Reka-UI-based dropdowns and menus often don't respond to click in headless Chromium.

**Try in order**:
1. `press_key("Enter")` after focusing the element
2. `evaluate_script` to trigger the action programmatically
3. Add `data-testid` to the wrapper, try `click` again
4. Bypass the UI entirely — call the API directly and verify the result on the next page load

If none work: mark it as a known headless limitation in your report and use the API-driven approach.

## When the page is blank

Possible causes (check in order):

1. `wait_for` returned early — page was mid-render. Re-`take_snapshot` after a pause.
2. Page is mid-navigation — `wait_for({ text: ['something on the destination page'] })` then snapshot again.
3. JS error broke hydration — `list_console_messages({ types: ['error'] })`
4. Server error — check the Nuxt dev server output (tail the background proc log)

## Inspecting runtime state

HttpOnly cookies are hidden from `document.cookie`. To verify auth state:

```
evaluate_script(`
  const resp = await fetch('/api/auth/me', { credentials: 'include' })
  return { status: resp.status, body: await resp.json() }
`)
```

Check if a specific element is in the Vue component tree:

```
evaluate_script(`
  return document.querySelector('[data-testid="todo-list"]')?.children.length
`)
```

## Two browser instances trap

If changes don't appear in the browser even after a file save:

1. Check if there are two dev servers: `netstat -ano | findstr :3000`
2. Two servers = two ports. Your browser might be on the old port.
3. Kill the old PID, restart the dev server, navigate again.

## 60-second loop template

For interactive flows, follow this pattern:

```
1. navigate_page(url)
2. wait_for({ text: ['expected page content'] })
3. take_snapshot → find uid
4. fill({ uid, value }) or click({ uid })
5. wait_for({ text: ['success/error message'] })
6. take_screenshot (if layout matters)
7. If broken: list_console_messages({ types: ['error'] })
8. If state unclear: evaluate_script to inspect runtime
```

## Performance

When LCP or performance matters:

```
performance_start_trace
navigate_page(url)
wait_for({ text: ['page loaded indicator'] })
performance_stop_trace
performance_analyze_insight
```

Load the `chrome-devtools-mcp:debug-optimize-lcp` skill for a full performance debugging workflow.
