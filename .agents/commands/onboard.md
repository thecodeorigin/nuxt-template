---
description: Adapt this generic Nuxt template into the user's actual product — pure business interview (no jargon), then rebrand the codebase end-to-end including .env, branding, and copy. Re-runnable for re-branding.
argument-hint: (no arguments — fully interactive)
---

You are now the **onboarding host**. The user is a **vibe coder**:
treat the codebase as a black box on their behalf. They have no idea
what a Worker, an `.env`, an OAuth client ID, a Cloudflare binding, or
a layer is — and they should never need to. Your job is to ask only
**business / branding / product** questions, then turn the answers into
file changes silently.

> **Tone**: friendly, plain English, zero acronyms unless you immediately
> define them. Never say "OAuth"; say "letting users sign in with their
> Google account." Never say "env var"; say "I'll save this for you."

## Step 0 — Detect mode

Run a Grep for the literal string `Nuxt Template` across the repo (exclude
`node_modules`, `.data`, `.nuxt`, `.output`):

```
Grep pattern="Nuxt Template" glob="!node_modules/**"
```

- **Many matches** → first-run mode. Greet warmly: "Welcome — let's turn
  this template into your product. I'll ask a handful of questions, then
  set everything up for you."
- **Few or zero matches** → rebrand mode. The user has already onboarded
  once. Greet: "Looks like this project has already been branded. Are we
  **updating the brand** (same business, new look/name) or **switching to
  a completely different product**?"
  - **Different product** → show the danger warning verbatim:
    > ⚠️ Heads up: I can change your project's name, colors, labels, and
    > copy. But anything you (or earlier sessions) already built — sample
    > data, custom components, seeded users, anything beyond the template
    > defaults — will still reflect the old idea. If this is a totally
    > different product, the cleanest path is to start over from a fresh
    > copy of the template. Want me to continue anyway? (yes / no)

    Wait for explicit `yes` before proceeding.

## Step 1 — Phase 1: Brand interview (4 questions)

Ask via `AskUserQuestion`, batched in one call:

1. **What's the name of your product?** (the display name — e.g.
   "Acme", "PetPal", "Lumen") — free text via "Other"
2. **In one sentence, what does it do?** — free text via "Other" (offer
   a couple of generic examples like "Helps small teams track customer
   feedback" as preview options the user can riff on)
3. **Who is it for and why does it exist?** — one short paragraph; free
   text via "Other"
4. **Website domain** — free text via "Other". Offer two preset options:
   "I'll set this up later" and "I have one already." If "already",
   collect the domain (e.g. `acme.com`).

## Step 2 — Phase 1b: Brand color (visual pick)

Ask via `AskUserQuestion` with `preview` content showing a small swatch
preview for each option. Use Nuxt UI palette names as the underlying
values. Offer the user 4 popular picks first; "Other" reveals the full
palette:

- **Blue** (calm, trustworthy — SaaS default)
- **Emerald** (fresh, growth, money)
- **Violet** (creative, premium)
- **Rose** (warm, consumer, personal)

Each preview should show 3 short bars in that shade (50/500/900) so the
user can eyeball it. If they pick "Other", show the full list:
`slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime,
green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia,
pink, rose`.

Then ask a second question: **Neutral background tone?** (used for
borders / muted text) — pick from: `gray` (default), `slate`, `zinc`,
`stone`, `neutral`.

## Step 3 — Phase 1c: You + support (1 question, 2 fields)

Ask via `AskUserQuestion`:

1. **Who's running this?** Free text via "Other" — accept a person's name
   or a company name. This goes in the footer and copyright.
2. **Support email** — where should customers reach you? Free text via
   "Other". Default option: "Use `support@<domain>`" (auto-derived if a
   domain was given earlier).

## Step 4 — Phase 2: Product interview (3–4 questions)

Ask via `AskUserQuestion`, batched:

1. **What's the main thing someone does with your product?** Free text
   via "Other". Offer a few generic preview options:
   - "Subscribes to access features"
   - "Buys items from a catalog"
   - "Tops up credits and spends them on usage"
   - "Joins a workspace with their team and collaborates"

   This answer determines the **adapted name for "product"** (the layer
   stays named `product`; only labels change):
   - "subscribes" → **Plans**
   - "buys items" → **Items**
   - "tops up credits" → **Credit Packs**
   - "joins a workspace" → **Plans** (workspaces are projects, plans are
     products)
   - anything else → use your judgment, fall back to **Plans**

2. **Do users have personal accounts, or do they create workspaces /
   teams that hold their stuff?**
   - **Personal** — each user manages their own things
   - **Workspaces / teams** — users create a shared container others
     can join

   This answer determines the **adapted name for "project"**:
   - personal → **Account**
   - workspaces → **Workspaces** (or **Teams**, **Organizations** —
     pick whichever fits the language used in question 1)

3. **Do you charge money?**
   - **Not yet — free to use**
   - **Yes**

4. If charging = yes, ask **How do customers pay?** (multiSelect):
   - **Monthly subscription**
   - **Annual subscription**
   - **One-time purchase**
   - **Pay-as-you-go credits**
   - **Add-ons on top of a base plan**

   This drives which `product.type` and `billing_interval` values your
   seed data should use when you adapt the product list.

## Step 5 — Phase 3: Sign-in providers (Google / GitHub)

> **Hard rule**: at least one of Google or GitHub must be configured for
> the production deploy. Both can be configured. Enforce this at the end
> of this step.

For each provider, ask via `AskUserQuestion`:

**Do you want users to be able to sign in with their Google account?**
- **Yes, set it up now** — guide them through it
- **Yes but set it up later** — leave placeholders; you'll come back
- **No, skip Google sign-in entirely**

Same question for GitHub.

If the user picks "set up now" for **Google**, walk them through this in
two clearly-separated rounds — DEV first, then PROD — using plain
English:

> **For local development (so it works when you click `pnpm dev`):**
> 1. Open <https://console.cloud.google.com/apis/credentials>
> 2. Click **+ Create credentials → OAuth client ID**. If it asks you to
>    "configure consent screen" first, click that link, pick **External**,
>    fill in your product name and your email, save, then come back.
> 3. Pick **Web application**.
> 4. Under **Authorized redirect URIs** add exactly:
>    `http://localhost:3002/api/auth/google/callback`
> 5. Click **Create**. Copy the **Client ID** and **Client secret** and
>    paste them here when ready.

Wait for them to paste the two values. Save them as
`NUXT_GOOGLE_CLIENT_ID` and `NUXT_GOOGLE_CLIENT_SECRET` (you'll write
these to `.env` in Step 8).

> **For your live site (do this once you have a domain — skip if not
> ready):**
> 1. Same page in Google Cloud, edit the OAuth client.
> 2. Add another redirect URI: `https://<your-domain>/api/auth/google/callback`
> 3. Click save. No new keys needed — the same Client ID / Secret will work.

For **GitHub**, the equivalent dev walkthrough:

> **For local development:**
> 1. Open <https://github.com/settings/applications/new>
> 2. **Application name**: anything (e.g. your product name)
> 3. **Homepage URL**: `http://localhost:3002`
> 4. **Authorization callback URL**: `http://localhost:3002/api/auth/github/callback`
> 5. Click **Register application**, then click **Generate a new client
>    secret**. Copy the **Client ID** and the **Client secret** and paste
>    them here.

> **For your live site (do this once you have a domain — skip if not
> ready):**
> 1. Go to <https://github.com/settings/developers>, open the same app.
> 2. Add a second OAuth app (GitHub doesn't support multiple callbacks on
>    one app) with the prod URLs, OR change the callback to your prod
>    domain when you're ready to launch.

Save as `NUXT_GITHUB_CLIENT_ID` and `NUXT_GITHUB_CLIENT_SECRET`.

**After both questions**: if the user picked "No" for both Google and
GitHub, gently push back:

> Heads up — when you publish your site, you'll need at least one way for
> people to sign in. You can keep both off for now, but I'll mark this as
> something you have to come back to before going live.

Set an internal `pendingSigninProvider = true` flag so `/go-live` can
remind them.

## Step 6 — Phase 4: Email provider (Resend)

Ask via `AskUserQuestion`:

**Should your product send emails to users? (welcome, password reset,
notifications, etc.)**
- **Yes, set it up now**
- **Yes but set it up later**
- **No** — they're shown locally during dev, but won't go anywhere in
  production

If "set it up now":

> Resend handles your product's outgoing email.
> 1. Open <https://resend.com/signup> and create an account (free tier
>    is fine to start).
> 2. Once signed in, go to <https://resend.com/api-keys> → **Create API
>    Key** → name it "Production" → copy it and paste it here.
> 3. **(Important for live email)**: Go to **Domains** in Resend, add
>    your domain, and follow their DNS instructions. Until you do this,
>    your live emails won't actually send — they only work in dev.

Save as `NUXT_SMTP_PASS` (Resend uses the SMTP password slot for the API
key — it's a quirk of the nuxt-resend integration).

If the user has no domain yet, tell them: "I'll save your key. Add a
domain in Resend before you go live or your emails won't send."

## Step 7 — Phase 5: Bank transfer payments (SePay)

Only ask this if Step 4 question 3 (charge money?) was "Yes".

> SePay lets Vietnamese customers pay you by bank transfer. If your
> customers are outside Vietnam, you can skip this — we'll wire up a
> different payment method later.

Ask via `AskUserQuestion`:

**Do you want to accept Vietnamese bank transfers?**
- **Yes, set it up now**
- **Yes but set it up later**
- **No — my customers don't use Vietnamese banks**

If "set it up now":

> 1. Open <https://my.sepay.vn/> and sign up for a SePay account.
> 2. Link your bank account (they'll guide you).
> 3. In the SePay dashboard, find your **bank account number**, **bank
>    short code** (e.g. `VCB`, `TCB`, `MB`), and pick a short prefix to
>    identify payments to your product (3-6 letters, e.g. `ACME`).
> 4. Paste those three values here.

Save as `NUXT_SEPAY_BANK_NUMBER`, `NUXT_SEPAY_BANK_NAME`,
`NUXT_SEPAY_TRANSACTION_PREFIX`.

## Step 8 — Confirmation gate

Show the user a clean recap **with no technical jargon** — just what
they answered, formatted as a table. Then ask one yes/no question:

**Ready for me to apply these changes? I'll update your project's name,
colors, labels, and save your credentials. Takes about 10 seconds.**

If "no", let them tell you what to change, loop back to the relevant
question, then re-show the recap.

## Step 9 — Apply changes

Do all file changes silently, in this order, using `Edit` (preferred) or
`Write` only when creating new files. Update an internal `applied[]`
list as you go.

### 9a. Identity rewrites

Compute these derived values once:

- `productName` — Phase 1 Q1
- `packageSlug` — `productName` lowercased, spaces→`-`, strip non-alnum
- `domain` — Phase 1 Q4 (or `<packageSlug>.com` placeholder if "later")
- `sslEnabled` — `"true"` if domain provided, `"false"` if placeholder
- `supportEmail` — Phase 1c Q2 (or `support@<domain>` derived)
- `companyName` — Phase 1c Q1
- `productLabel` — adapted name for "product" (Step 4 mapping)
- `projectLabel` — adapted name for "project" (Step 4 mapping)
- `smtpFromDisplay` — `"<productName> <noreply@<domain>>"`

Apply:

1. **`package.json`**: set `"name"` to `packageSlug`.
2. **`wrangler.jsonc`**:
   - `"name"` → `packageSlug`
   - `vars.NUXT_PUBLIC_BASE_DOMAIN` → `domain`
   - `vars.NUXT_PUBLIC_SSL_ENABLED` → `sslEnabled`
3. **`packages/cli/src/commands/deploy.ts`**:
   - `const WORKER_NAME = '...'` → `packageSlug`
4. **`nuxt.config.ts`**:
   - `nitro.openAPI.meta.title` (`Nuxt Template API`) → `'<productName> API'`
   - `runtimeConfig.smtpFrom` default → `smtpFromDisplay`
   - `runtimeConfig.public.baseDomain` default (`localhost:3000`) → leave
     for local dev; do not touch
   - `hub.blob.bucketName` default (`nuxt-template-prod`) →
     `'<packageSlug>-prod'`
5. **`.env.example`**:
   - `NUXT_SMTP_FROM="..."` → `smtpFromDisplay`
   - `NUXT_PUBLIC_BASE_DOMAIN=localhost:3002` → leave as-is (local default)
6. **`README.md`**:
   - First H1 line → `# <productName> — <one-line tagline>`
   - First paragraph → user's long description; preserve the rest of the
     README structure (it documents the harness, which doesn't change)
7. **Component labels** — grep for literal "Nuxt Template" across `app/`,
   `layers/`, and apply targeted edits. Common files:
   - `layers/auth/app/components/User/UserMenu.vue`
   - `layers/auth/app/components/Impersonate/ImpersonateMenu.vue`
   - any layout file under `app/layouts/`
8. **`packages/cli/README.md`** and **`packages/cli/CLAUDE.md`**: leave
   as-is — they document the harness, not the product.
9. **`.all-contributorsrc`**: leave as-is (project metadata) unless the
   user specifically asked to update it.

### 9b. Branding

10. **`app/app.config.ts`**: set `colors.primary` and `colors.neutral`
    to the picks from Phase 1b. Example:

    ```ts
    export default defineAppConfig({
      ui: {
        colors: {
          primary: '<pick>',
          neutral: '<pick>',
        },
      },
    })
    ```

### 9c. `.env` for local dev

Create or update `.env` (NOT `.env.example`). If `.env` exists, merge —
don't overwrite values you weren't asked about (auth secrets generated
by `pnpm cli dev setup` must survive). Set:

- `NUXT_PUBLIC_BASE_DOMAIN=localhost:3002`
- `NUXT_PUBLIC_SSL_ENABLED=false`
- `NUXT_PUBLIC_DEMO_MODE=false`
- `NUXT_DEMO_MODE=false`
- `NUXT_SMTP_FROM=<smtpFromDisplay>`
- `NUXT_GOOGLE_CLIENT_ID=<…or empty>`
- `NUXT_GOOGLE_CLIENT_SECRET=<…or empty>`
- `NUXT_GITHUB_CLIENT_ID=<…or empty>`
- `NUXT_GITHUB_CLIENT_SECRET=<…or empty>`
- `NUXT_SMTP_PASS=<resend api key or empty>`
- `NUXT_SEPAY_BANK_NUMBER=<…or empty>`
- `NUXT_SEPAY_BANK_NAME=<…or empty>`
- `NUXT_SEPAY_TRANSACTION_PREFIX=<…or empty>`

If a value is empty (user skipped), still write the empty line so they
can see what's pending.

### 9d. Product / Project user-facing labels

The layer file paths, function names, and DB tables stay as
`product` / `project` (per the layer ownership invariant — see
`layers/product/CLAUDE.md` and `layers/project/CLAUDE.md`).

Only **user-facing labels** change. Grep each layer's components and
schemas for the words `Product`, `Products`, `product`, `products`,
`Project`, `Projects`, `project`, `projects` *in display strings only*
(template `{{ }}` interpolations, `label:` schema fields, page titles,
sidebar nav text). Replace with `productLabel` / `projectLabel`.

Be precise: do NOT rewrite imports, type names, function names, file
paths, or DB column names. Read each match before editing.

If `productLabel === 'Plans'` and `projectLabel === 'Workspaces'`, you
should see edits like:
- Sidebar item label `'Products'` → `'Plans'`
- Page title `'Projects'` → `'Workspaces'`
- Form label `'Project name'` → `'Workspace name'`

### 9e. Stash future provider state

If the user picked "set up later" for any provider, append a tiny
todo file at `.claude/onboarding-pending.md`:

```markdown
# Onboarding — pending follow-ups

- [ ] Google OAuth — set up later (see /onboard step 5)
- [ ] GitHub OAuth — set up later
- [ ] Resend domain — add at https://resend.com/domains
- [ ] SePay credentials — set up later
```

Only include lines for items they actually deferred. If nothing was
deferred, don't create the file.

## Step 10 — Wrap-up

Print a short, friendly summary:

> ✅ Done. Your project is now **<productName>**.
>
> What changed:
> - Renamed everywhere (was "Nuxt Template")
> - Brand color: **<primary>**, background tone: **<neutral>**
> - **<productLabel>** (was "Products"), **<projectLabel>** (was "Projects")
> - Saved <N> credentials to your local config
>
> Pending: <list, if any>
>
> **Next**: run `pnpm dev` and open http://localhost:3002 to see your
> product. When you're ready to put it on the internet, type `/go-live`
> and I'll walk you through it.

Mark your task complete. Do not commit on the user's behalf.

## Anti-patterns to avoid

- **Don't ask "what should we call your products folder?"** — file
  names stay; only labels change.
- **Don't say "OAuth", "env var", "Cloudflare binding", "Worker",
  "schema migration"** unless the user uses the word first.
- **Don't run `pnpm db:migrate` or `pnpm cli deploy …`** — schema is
  untouched in onboarding, and deployment belongs to `/go-live`.
- **Don't skip the confirmation gate (Step 8)** — vibe coders need to
  see what's about to happen before it happens.
- **Don't write provider credentials to `.env.example`** — that file is
  committed; secrets go to `.env` only.
- **Don't proceed if the user said "different product" in rebrand mode
  without explicit `yes`** to the danger warning.
