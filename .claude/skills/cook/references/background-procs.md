# Background Processes

> Managing dev servers, port conflicts, and long-running commands on Windows.

## Starting the dev server

```bash
pnpm dev
```

Run in background if you need to keep working:

```bash
# Bash tool with run_in_background=true
pnpm dev 2>&1
```

Wait for the server to be ready:

```bash
until curl -sf http://localhost:3000 > /dev/null; do sleep 1; done && echo "ready"
```

Don't `sleep 5` and hope — use the `until` loop or `wait_for` in Chrome DevTools MCP.

## Port conflicts (silent killer)

Nuxt dev server silently falls back to the next free port if 3000 is in use. Symptom: you're editing code but changes don't appear — you're hitting the old server on 3000, not your new one on 3001.

**Check what's on port 3000**:

```powershell
netstat -ano | findstr :3000
```

Output example:
```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
```
The last number (12345) is the PID.

## Killing processes on Windows

**PowerShell (most reliable):**
```powershell
Stop-Process -Id 12345 -Force
```

**From a Git Bash / Bash tool:**
```bash
taskkill /PID 12345 /F
```

After killing, confirm the port is free:
```powershell
netstat -ano | findstr :3000
# Should return nothing (no output = port is free)
```

## Restarting cleanly

1. Kill old process: `Stop-Process -Id <PID> -Force`
2. Confirm port free: `netstat -ano | findstr :3000` (expect no output)
3. Start new server: `pnpm dev`
4. Wait for ready: `until curl -sf http://localhost:3000 > /dev/null; do sleep 1; done`

## When hot-reload doesn't pick up a change

1. Is the file saved to the right location? (`layers/<name>/app/...` not root `app/...`)
2. Are there two dev servers? (check with `netstat -ano | findstr :3000`)
3. Server-side changes (routes, server utils) sometimes need a full restart even with HMR
4. Refresh the browser manually after a server restart

## Hard reset

When everything is broken and you need a clean start:

```bash
# Kill dev server (find PID first)
netstat -ano | findstr :3000

# Delete Nuxt build cache
rm -rf .nuxt/

# Restart
pnpm dev
```

Don't delete `node_modules` unless you suspect a dependency issue — it takes much longer to reinstall than clearing `.nuxt/`.

## Long-running commands

Always use `run_in_background: true` for daemonic processes (dev server, watchers). For one-shot commands (install, build, e2e), run in foreground but increase the timeout:

- Default timeout: 2 minutes (120000ms)
- `pnpm install` on a clean repo: 5 minutes (300000ms)
- `pnpm test:e2e` (full suite): 10 minutes (600000ms)

## Reading background output

When a command runs in the background, its output goes to a temp file shown in the response. You can tail it:

```bash
tail -n 50 /path/to/temp-file.log
```

Or use the Monitor tool to stream events from a background process.

## Known harmless warnings

Add to your mental ignore-list once identified:
- `[nuxt] [warn] No match found for location with path "/..."` — expected during SSR for client-only routes
- Vite HMR connection warnings during restart
- `[Vue warn]: Extraneous non-props attributes...` on Nuxt UI wrapper components

If you see a new warning repeatedly, investigate once; if it's benign, add it here.
