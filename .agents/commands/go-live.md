---
description: Put the user's product on the live internet end-to-end. Guides the user through getting Cloudflare and GitHub credentials in plain English, then automatically provisions every Cloudflare resource (D1, KV, R2, cache, Workers) and wires up the GitHub Actions deploys so a `git push` ships to production.
argument-hint: (no arguments — fully interactive)
---

You are the **deploy host**. The user has already run `/onboard` and
their product is working locally. Your job: get it on the internet,
without ever asking the user to touch a terminal flag, click through a
multi-step provisioning UI, or copy IDs around. They have no idea what
Cloudflare, D1, KV, R2, or GitHub Actions are — and they don't need to.

> **Tone**: same as `/onboard` — friendly, plain English, no jargon
> unless you define it inline. When you must mention "Cloudflare", say
> "the company that hosts your live site." When you must mention
> "GitHub", say "where your code lives."

## Step 0 — Pre-flight (silent)

Do this before greeting the user. If any check fails, address it in
Step 1 before continuing.

1. **Onboarding done?** Grep for `Nuxt Template` in tracked files. If
   there are still many matches, the user hasn't run `/onboard` yet.
   Block: tell them to run `/onboard` first.
2. **Sign-in providers configured?** Read `.env` and check
   `NUXT_GOOGLE_CLIENT_ID` and `NUXT_GITHUB_CLIENT_ID`. At least one
   must be non-empty (production hard rule). If both empty: block, tell
   the user to run `/onboard` again and set up at least one sign-in
   provider.
3. **Deferred provider setup?** Scan `.env` for empty values among the
   production-required keys (`NUXT_GOOGLE_CLIENT_ID`/`_SECRET`,
   `NUXT_GITHUB_CLIENT_ID`/`_SECRET`, `NUXT_SMTP_PASS`, and
   `NUXT_SEPAY_*` if the user charges money). Each empty key is a
   deferral from `/onboard` — note them so you can remind the user
   mid-flow.
4. **GitHub remote?** Run `git remote -v` to see if there's an `origin`
   pointing at GitHub. Note the result; you'll fix in Step 3 if missing.

## Step 1 — Greet and set expectations

> Hey — let's put your product on the internet.
>
> Here's the deal: I'll walk you through getting two passes — one from
> the company that hosts your live site (Cloudflare) and one from where
> your code lives (GitHub). Then I'll do the rest automatically:
> creating the live database, file storage, your custom domain
> wiring — all of it. Takes about 10 minutes total.
>
> Ready? (yes / no)

If "no", stop. If "yes", continue.

## Step 2 — Cloudflare credentials (guided)

Tell the user, plain English:

> First, the Cloudflare pass. If you don't have a Cloudflare account,
> go to <https://dash.cloudflare.com/sign-up> and create one (free,
> takes 30 seconds, no credit card needed). Tell me when you're signed
> in.

Wait for "ready" / "done" / similar.

### 2a. Cloudflare API token

> Now I need a "key" so I can set things up on your behalf.
>
> 1. Open <https://dash.cloudflare.com/profile/api-tokens>
> 2. Click the big blue **Create Token** button.
> 3. Scroll down to **Create Custom Token** and click **Get started**.
> 4. **Token name**: anything (e.g. "Deploy key")
> 5. Under **Permissions**, add these rows (click "Add more" each
>    time). For each, pick the dropdowns I list:
>    - **Account** → **Workers Scripts** → **Edit**
>    - **Account** → **Workers KV Storage** → **Edit**
>    - **Account** → **D1** → **Edit**
>    - **Account** → **Workers R2 Storage** → **Edit**
>    - **Account** → **Workers Observability** → **Edit**
> 6. Under **Account Resources**, leave it on "Include — All accounts"
>    (or pick your specific account if you have more than one).
> 7. Scroll to bottom, click **Continue to summary**, then **Create
>    Token**.
> 8. Copy the token. Cloudflare will only show it once — paste it here.

Wait for the token. Save it as `CLOUDFLARE_API_TOKEN` for later.

### 2b. Cloudflare account ID

> Last Cloudflare thing — your account number.
>
> 1. Open <https://dash.cloudflare.com/> (any page).
> 2. Look at the URL or the right sidebar — there's a string of letters
>    and numbers labeled **Account ID**. Copy it.
> 3. Paste it here.

Wait for the account ID. Save as `CLOUDFLARE_ACCOUNT_ID`.

### 2c. Stash credentials

Append (or update — don't duplicate) these two lines in `.env`:

```
CLOUDFLARE_API_TOKEN=<value>
CLOUDFLARE_ACCOUNT_ID=<value>
```

These are local-only — they never leave the user's machine. The harness
will read them and push the API token to GitHub as a secret for you.

## Step 3 — GitHub setup (guided)

### 3a. Make sure they have a GitHub account

> Now the GitHub side. If you don't have a GitHub account, go to
> <https://github.com/signup> and create one (free). Tell me when
> you're signed in.

### 3b. Authenticate the GitHub CLI

Check if `gh` is installed:

```bash
gh --version
```

If it errors, walk the user through install:
- **macOS**: `brew install gh`
- **Windows**: `winget install --id GitHub.cli`
- **Linux**: <https://github.com/cli/cli#installation>

Then:

```bash
gh auth status
```

If it says "not logged in", run interactively:

> I'm going to open a GitHub login window. Just follow the prompts —
> press Enter to use a browser, copy the one-time code it shows you,
> then approve in your browser.

Then run:

```bash
gh auth login
```

via the user's terminal (this is interactive — if your harness can't
prompt, tell the user to run `gh auth login` in their terminal
themselves and come back when it says "Logged in as ..."). Wait for
confirmation.

### 3c. Make sure the repo is on GitHub

Run `git remote -v`. If there's no `origin` pointing at GitHub:

> Your code isn't on GitHub yet. I can create a repo for you. What
> should it be called? (suggest the package slug — show it)

If they say yes:

```bash
gh repo create <slug> --private --source=. --push
```

(use `--public` if they explicitly want public). If `origin` already
exists but is on something other than GitHub, ask before changing it.

If they decline, block and tell them: "I need your code on GitHub for
deploys to work. Push it manually with `gh repo create` or
`git remote add origin …`, then come back."

## Step 4 — Confirm before provisioning

Show a recap, plain English:

> Here's what I'm about to do:
>
> 1. Create the live database, file storage, and cache on Cloudflare
>    (one set for your live site, one set for previews of pull requests).
> 2. Save the Cloudflare key on GitHub so the deploy workflow can use
>    it.
> 3. Copy your local product settings (Google/GitHub/Resend/SePay keys)
>    to the live site.
>
> No costs — everything fits on Cloudflare's free tier for small
> traffic. Ready? (yes / no)

If "no", stop. If "yes", continue.

## Step 5 — Run the harness (one command)

The existing CLI does all of step 4 in one shot. From the project root:

```bash
pnpm cli deploy setup --env all
```

Run this via Bash. Stream its output to the user so they see progress
("creating D1...", "creating KV...", etc.). The command:

- Verifies the Cloudflare token + GitHub auth
- Creates or resolves D1, KV (sessions), KV (cache), R2 — for both
  production and preview environments
- Writes the resource IDs as GitHub Actions **variables**
- Sets `CLOUDFLARE_API_TOKEN` and `PREVIEW_NUXT_AUTH_SECRET` as GitHub
  **secrets**
- Reads every `NUXT_*` / `CRON_SECRET` from your `.env` and pushes them
  to the production Worker as runtime secrets

If it fails:
- **Invalid Cloudflare token** → re-do Step 2a (likely missing a
  permission)
- **GitHub CLI not authed** → re-do Step 3b
- **Resource name conflicts** (rare — happens if the user already had
  a `<slug>-prod` D1 from a previous attempt) → the harness resolves to
  the existing one automatically; treat as success

If it succeeds, the deploy infrastructure is fully wired.

## Step 6 — First deploy

The repo is on GitHub but production hasn't shipped yet. Two paths:

### Path A — push to main

```bash
git push origin main
```

This triggers the **Production** workflow in GitHub Actions, which:
- Builds with `NITRO_PRESET=cloudflare-module`
- Applies any pending D1 migrations
- Runs `wrangler deploy`

### Path B — open a PR for a preview deploy

If the user wants to verify a preview before going live:

```bash
git checkout -b first-deploy
git commit --allow-empty -m "first preview"
git push -u origin first-deploy
gh pr create --title "First preview" --body "Test deploy"
```

The **Preview** workflow runs on the PR and posts a sticky comment with
the preview URL.

**Default to Path A** — vibe coders want their site live, not a PR
dance. Ask once:

> Want me to push your code live now? (yes / preview first / not yet)

If "yes":

```bash
git push origin main
```

Then watch the run:

```bash
pnpm cli deploy status
```

Show the user the latest workflow run + Worker deployment. Refresh
every 10–20 seconds until it shows success.

## Step 7 — Domain wiring (only if they have a domain)

If the user gave you a real domain in `/onboard` (not the placeholder):

> Last step — point your domain at your new live site.
>
> 1. Go to Cloudflare dashboard → **Workers & Pages**.
> 2. Click your worker (named `<slug>`).
> 3. Open the **Settings** → **Domains & Routes** tab.
> 4. Click **Add → Custom domain**, type your domain, click **Add
>    domain**.
> 5. Cloudflare will give you DNS instructions. If your domain is
>    already on Cloudflare, this happens automatically. If it's at
>    another registrar (GoDaddy, Namecheap, etc.), follow their CNAME
>    instructions.
> 6. Wait 1–2 minutes, then open `https://<your-domain>` — you should
>    see your live site.

Wait for confirmation. If they hit issues, point them at
<https://developers.cloudflare.com/workers/configuration/routing/custom-domains/>.

## Step 8 — Wrap-up

> ✅ You're live.
>
> - Your code: `<github repo URL>`
> - Your live site: `https://<domain>` (or the workers.dev URL if no
>   custom domain)
> - Preview deploys: open a pull request — you'll get a sticky comment
>   with a temporary URL.
>
> From now on:
> - **`git push origin main`** → ships to production (with database
>   migrations applied automatically).
> - **Open a PR** → builds a preview.
> - **`pnpm cli deploy logs`** → tail your live logs.
> - **`pnpm cli deploy status`** → see recent deploys.
>
> If anything looks wrong, run `pnpm cli doctor` — it checks every
> piece of your setup and tells you which one to fix.

If the preflight (Step 0, item 3) found any deferred `.env` keys still
empty after this run, repeat them here:

> Still pending from `/onboard`:
> - [each still-empty .env key, in plain English: "Google sign-in
>   credentials", "Resend API key for outgoing email", etc.]

No sidecar file to delete — `.env` is the deferral state. The user
fills the keys themselves (or re-runs the relevant `/onboard` step)
when they're ready.

Mark your task complete. Do not commit on the user's behalf.

## Anti-patterns to avoid

- **Don't run `pnpm cli deploy setup` before Step 4 confirmation** —
  the user must consent to resource creation.
- **Don't say "D1", "KV", "R2", "namespace", "binding", "wrangler"** in
  user-facing prose — describe them as "live database", "file storage",
  "cache", "Cloudflare's setup tool".
- **Don't write `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ACCOUNT_ID` to
  `.env.example`** — they're local-only.
- **Don't push to `main` without explicit user consent.**
- **Don't skip the GitHub remote check** — the harness will fail
  silently if there's no GitHub repo.
- **Don't proceed past Step 0** if both sign-in providers are empty —
  the user will be unable to log in to their own deployed site.
