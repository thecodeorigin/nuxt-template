# Error Recovery

> How to escape fix loops, read errors correctly, and know when to stop and ask.

## The single-bug rule

Fix one thing per cycle. Verify after each fix. Never pile three changes and hope.

If you find yourself writing a comment like "this might also be related to X, let me also fix Y…" — stop. Fix only the thing you're certain about. Verify. Then decide if X and Y are still relevant.

## Read errors literally

The error message describes what the compiler or runtime **actually sees**, not what you intended. The file:line reference is where the problem is, not necessarily where you need to fix it.

```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
  at layers/todo/server/api/todos/[id].patch.ts:15:22
```

Go to that exact line. Read the actual argument. Don't guess what "should" be there.

## The fix-loop trap

You're in a fix-loop if:
- You've made 3+ patches addressing the same symptom
- The same error keeps reappearing in a different form
- You keep trying "variations" without verifying a checkpoint

**Escape sequence:**
1. Stop patching
2. Re-read the original error message from scratch
3. Print actual runtime values (`console.log`, `evaluate_script`, `nuxt db sql`)
4. Walk back to the last known-green state
5. Ask: is the root assumption wrong?

## Common loop shapes in this project

### "Page renders with no data"
- Check for two dev servers: `netstat -ano | findstr :3000`
- Is the browser hitting the old server (stale port)?
- Kill old PID, restart, verify port: `netstat -ano | findstr :3000`

### "Form submit doesn't fire the API call"
- Check `list_network_requests` — is any request being made?
- Nuxt form handling vs raw submit: is `<UForm @submit>` or `@submit.prevent` wired correctly?
- Optimistic UI: check if the state update happens before or after the API call

### "Permission-gated navigation stays empty after login"
- CASL abilities: are they loaded before the navigation guard runs?
- Check `layers/auth/app/plugins/casl.ts` — abilities synced from auth store
- Auth store update order: is `currentUser.abilities` set before the page tries to read it?

### "Route returns 403 for a user who should have access"
- Check `defineAuthorizedHandler` checks — which ability string is required?
- Check the user's seed abilities: what does `alice@seed.local` have?
- Check CASL rule definitions: is the ability string registered?

### "DB change not reflected after pnpm db:migrate"
- Was `pnpm db:generate` run first? (generate creates the migration file; migrate applies it)
- Is the dev server using the updated schema? (Nuxt may need a restart after schema changes)
- Verify with `nuxt db sql "PRAGMA table_info(<table>)"`

## Heuristics for "is the fix actually right?"

- Did the test pass for the right reason? (Check the assertion, not just the exit code)
- Does the fix touch only the bug's layer, or does it paper over a deeper issue?
- Could a teammate predict the bug from reading the fix?
- Were there warnings I ignored that turned out to be relevant?

## Recover from "it was working a minute ago"

1. `git diff` — what exactly changed since it worked?
2. If you can't identify the change: `git stash` and verify it works on the stash, then pop and re-introduce changes one at a time
3. For subtle regressions: `git bisect` to find the commit that introduced it

## When to ask the user vs continue

Stop and ask when:
- The fix requires a product/architecture choice (e.g., soft-delete vs hard-delete)
- The fix needs a credential, secret, or environment variable you don't have
- The operation is destructive and potentially irreversible (e.g., dropping a column in production)
- You've been in a fix loop for 4+ cycles on the same symptom

Don't ask for:
- Tactical decisions (which Drizzle API to use, how to structure a query)
- Verification (run the test yourself to see if it passes)
- Known safe operations (adding a column, creating a new file)

## Reset checklist

When everything is broken and you need to orient:

```bash
git status                          # what's changed?
pnpm typecheck                      # any type errors?
netstat -ano | findstr :3000        # how many dev servers?
nuxt db sql "SELECT COUNT(*) FROM users"  # is the DB alive?
curl -sf http://localhost:3000/api/health  # is the server alive?
```

Then: take a screenshot of the current browser state. Pick the smallest next step.
