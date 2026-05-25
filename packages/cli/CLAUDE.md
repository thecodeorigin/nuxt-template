# `packages/cli` — harness CLI

Internal, non-interactive CLI for the `nuxt-template` project.
Invoked as `pnpm cli <cmd>` (or `pnpm harness <cmd>`).

## Structure

```
src/
  index.ts          Root command (citty) — wires all subcommands
  commands/
    doctor.ts       Read-only env diagnostics (tools / CF / GH / OAuth)
    dev.ts          Local bootstrap: up | setup | seed | provision | login | cleanup
                    (up = run nuxt dev + maildev together, stream + tree-kill)
    deploy.ts       CF resource provisioning + GitHub config + Worker secrets
    db.ts           DB ops: generate | migrate | sql | reset (wraps nuxt db)
    verify.ts       Local CI gate: lint → typecheck → test
  lib/
    run.ts          Cross-platform spawn (no shell; .cmd resolution on Windows)
    output.ts       Check type, printChecks, printJson, exitFromChecks
    tools.ts        External tool presence detection (node/pnpm/gh/gcloud/wrangler)
    env.ts          .env parsing, key-group constants, CF-token precedence
    keys.ts         Auth-secret generation + idempotent .env write
    api.ts          callDevRoute — thin fetch wrapper for dev-server backdoors
    cloudflare.ts   resolveOrCreate{D1,KV,R2} + token verify (wrangler shell-outs)
    github.ts       gh auth/repo/variable/secret helpers
test/unit/
  env.test.ts       resolveCfToken, workerRuntimeSecrets
  keys.test.ts      writeEnvKeys idempotency
  cloudflare.test.ts resolveOrCreate* with stubbed runner
  github.test.ts    missingConfig
```

## Hard rules for this package

1. **No prompts, ever.** Every command is non-interactive. Agents rely on this.
2. **All shell-outs through `run()`** in `lib/run.ts` — `spawn` with `shell: false`,
   args as arrays. Never string-interpolate into a shell command.
3. **Injectable `runner`** on every Cloudflare and GitHub helper so unit tests
   can stub without spawning a real process.
4. **No build step.** Everything runs via `tsx` at invocation time.
5. **Catalog deps only.** `pnpm/json-enforce-catalog` is `error`; use `catalog:`.

## How to add a new command

1. Create `src/commands/<name>.ts` exporting `export const <name> = defineCommand(...)`.
2. Register it in `src/index.ts` `subCommands`.
3. Add a unit test for any pure logic in `test/unit/<name>.test.ts`.
4. Document it in `README.md` under the command reference table.

## Running / testing

```bash
pnpm cli --help           # top-level help
pnpm cli doctor --json    # structured diagnostics
pnpm typecheck:cli        # tsc over this package only
pnpm test:unit            # runs packages/cli/test/unit/ inside the root unit project
```
