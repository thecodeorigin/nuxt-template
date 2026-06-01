# Self-host smoke test runbook

End-to-end manual test against a **real, throwaway Cloudflare account**.
Do this before merging Phase 6 to confirm the full flow works.

> Time budget: ~30 minutes. Most is waiting for releases / DNS propagation.

---

## 0. Prerequisites

- A Cloudflare account you don't mind creating resources in (free plan works).
- A GitHub repo where you can push a tag (this `nuxt-template` clone, or a fork).
- Local dev environment working (`pnpm dev` boots, you can sign in).

---

## 1. Generate a Cloudflare API token

1. Log into Cloudflare → top-right avatar → **My Profile** → **API Tokens** tab.
2. Click **Create Token** → scroll to bottom → **Create Custom Token**.
3. **Token name**: `Nuxt-Template Self-Host (smoke test)`.
4. **Permissions** (add one row at a time, all `Edit` unless noted):

   | Resource | Permission |
   |---|---|
   | Account · Workers Scripts | Edit |
   | Account · Workers KV Storage | Edit |
   | Account · Workers R2 Storage | Edit |
   | Account · D1 | Edit |
   | Account · Account Settings | Read |
   | User · User Details | Read |

5. **Account Resources**: `Include` → `All accounts` (or pick one).
6. **TTL**: leave open-ended for the smoke test (revoke after).
7. **Continue to summary** → **Create Token** → **copy the token NOW** (shown once).

Token format: starts with random characters, ~40 chars. **Don't paste anywhere
public.**

---

## 2. Configure the upstream (SaaS) instance

Set these env vars in `.env` (used by `pnpm dev` of the upstream instance — the
one that will issue the deploy on behalf of users):

```bash
NUXT_GITHUB_RELEASE_REPO=<your-org>/<your-repo>   # e.g. acme/nuxt-template
# Only if your repo is private:
NUXT_GITHUB_TOKEN=ghp_<fine-grained-pat-with-contents-read>
```

Restart `pnpm dev`.

---

## 3. Publish a release

The deploy flow downloads `bundle.json` from your repo's GitHub releases. So
you need at least one release published.

```bash
# Make sure all Phase 1-5 commits are pushed.
git tag v0.0.1-smoke
git push origin v0.0.1-smoke
```

Watch GitHub Actions → **Release** workflow (≈ 3-4 min). When done:
1. Open the Releases page in your repo.
2. Confirm assets attached: `bundle.json` + `nuxt-template-v0.0.1-smoke-cloudflare.tar.gz`.
3. Click into the release notes → confirm there's a `sha256:<hex>` line.
4. Click `bundle.json` → it should download / view as JSON.

---

## 4. Deploy from the UI

1. In the upstream local dev instance, sign in as a user who is the **owner**
   of their personal organization (this is the default for any signup).
2. Navigate to **Settings → Self-hosting** in the sidebar.
3. Page should load with status `idle`, no token stored, "How do I get a
   Cloudflare API token?" disclosure expanded.
4. Paste the token from step 1.
5. Click **Deploy**.
6. Watch the toast — first you should see no toast for ~10-30s while the
   server orchestrates:
   - verify token → 1 CF API call
   - discover account → 1 call
   - **write-probe** D1/KV/R2/Workers Scripts → 8 calls (POST + DELETE for each)
   - provision real D1/KV/R2 → 3 calls
   - fetch bundle from GitHub → 2 calls
   - apply migrations → ~17 SQL queries
   - upload Worker → 1 multipart PUT
   - enable workers.dev subdomain → 1 call

   Then a success toast: `Deployed v0.0.1-smoke` with the URL.

---

## 5. Verify in Cloudflare dashboard

In your Cloudflare account:

1. **Workers & Pages** → confirm a script named `nuxt-template-<8-char-org-id>` exists.
2. **Workers & Pages → D1** → confirm `nuxt-template-db` exists, with all tables (`users`, `organizations`, `selfhost_deployments`, etc.).
3. **R2** → confirm `nuxt-template-blob` bucket exists (empty).
4. **Workers KV** → confirm `nuxt-template-kv` namespace exists.

---

## 6. Verify the deployed Worker responds

```bash
curl -i https://nuxt-template-<8-char-org-id>.<your-workers-subdomain>.workers.dev/
```

Should return the app's index HTML (probably redirecting to `/auth/login`).
Note: the deployed Worker has a **fresh database** with no users — sign up
from scratch on that URL if you want to use it.

---

## 7. Verify status page reflects deployment

Refresh **Settings → Self-hosting** in the upstream instance.

| Element | Expected |
|---|---|
| Status badge | `deployed` (green) |
| URL | clickable `workers.dev` link |
| Version | `v0.0.1-smoke` |
| Cloudflare account | the account ID |
| Update available banner | not shown (versions match) |

---

## 8. Test the update flow

Bump a tag:

```bash
git tag v0.0.2-smoke
git push origin v0.0.2-smoke
```

After the Release workflow finishes (≈ 3 min) refresh **Settings → Self-hosting**.

| Element | Expected |
|---|---|
| Yellow "Update available" alert | shown, with v0.0.2-smoke / v0.0.1-smoke |
| Update button | click it |
| Token prompt | NOT shown (stored token reused) |
| Outcome | toast `Deployed v0.0.2-smoke`, status back to deployed |

The Worker script in CF gets updated in place (same name, new code).

---

## 9. Test disconnect

1. Click **Disconnect** on the deployment card.
2. Confirm toast: `Disconnected`.
3. Status badge changes to no card (back to idle copy).
4. Verify in DB that the token ciphertext is null:
   ```bash
   sqlite3 .data/db/sqlite.db "SELECT organization_id, cf_token_ciphertext IS NULL, status FROM selfhost_deployments"
   ```
   Should show `(your-org-id, 1, idle)`.
5. Click **Deploy** WITHOUT pasting a token → expect 400 error:
   `No token provided and no stored token found`.

---

## 10. Negative tests (recommended)

| Test | Steps | Expected |
|---|---|---|
| **Read-only token** | Create a CF token with `Workers Scripts: Read` instead of `Edit`. Paste + Deploy. | 400 `Token missing permissions: Workers Scripts` |
| **Expired token** | Create a CF token with TTL = 1 hour, wait an hour, deploy. | 400 `Token is not active` |
| **Non-owner** | Add a second user as member of your org, sign in as that user, visit the page. | Page should be hidden from sidebar; direct nav → 403 `Only the organization owner can deploy a self-hosted instance` |
| **Rate limit** | Click Deploy twice within 60 seconds. | Second click → 429 `Deploy attempted too recently. Wait 60s.` |
| **Tampered bundle** | Edit `bundle.json` in the release after publishing (re-upload manually with wrong content). | 400 `Bundle SHA-256 mismatch — possible tampering` |

---

## 11. Cleanup after the smoke test

In Cloudflare dashboard:

1. Workers & Pages → delete the `nuxt-template-<id>` script.
2. D1 → delete `nuxt-template-db`.
3. R2 → empty + delete `nuxt-template-blob`.
4. KV → delete `nuxt-template-kv`.
5. My Profile → API Tokens → **roll** the smoke-test token (or delete it).

In your local DB:

```bash
sqlite3 .data/db/sqlite.db "DELETE FROM selfhost_deployments; DELETE FROM selfhost_audit;"
```

---

## Acceptance — smoke test passes when:

- [ ] Deploy from a fresh org succeeds end-to-end in under 90 seconds.
- [ ] All 4 CF resources visible in the dashboard.
- [ ] Worker URL serves the app's index.
- [ ] Update flow works without re-pasting the token.
- [ ] Disconnect nulls the stored token.
- [ ] At least 3 negative tests behave as expected.
- [ ] Audit table has rows for each deploy/redeploy/disconnect attempt.

Tag the smoke-test PR with `verified-against-real-cf` once all checks pass.
