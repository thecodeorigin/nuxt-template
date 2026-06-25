export type CfSecretType = 'secret_text' | 'plain_text'

export type AutoGenStrategy = 'random-hex-32' | 'derive-base-domain' | 'derive-ssl-enabled' | 'derive-release-repo' | null

export interface SecretDef {
  key: string
  label: string
  description: string
  category: 'auth' | 'oauth' | 'smtp' | 'payments' | 'system' | 'support'
  type: CfSecretType
  auto: AutoGenStrategy
}

// Catalog of every env var the deployed worker understands. Editing this list is the way to add support
// for new self-host config. `auto` entries are derived/generated at deploy time without user input.
export const SELFHOST_SECRET_CATALOG: SecretDef[] = [
  // THECODEORIGIN OIDC (user-provided)
  { key: 'NUXT_THECODEORIGIN_ISSUER', label: 'THECODEORIGIN issuer URL', description: 'Base URL of the self-hosted better-auth IdP, e.g. https://auth.yourdomain.com/api/auth. Whitelist your worker URL + /api/auth/oidc/callback on the IdP.', category: 'oauth', type: 'secret_text', auto: null },
  { key: 'NUXT_THECODEORIGIN_CLIENT_ID', label: 'THECODEORIGIN client ID', description: 'Issued when registering a confidential client on the IdP admin console.', category: 'oauth', type: 'secret_text', auto: null },
  { key: 'NUXT_THECODEORIGIN_CLIENT_SECRET', label: 'THECODEORIGIN client secret', description: 'Shown once on IdP registration. Rotate via the IdP admin console if lost.', category: 'oauth', type: 'secret_text', auto: null },
  { key: 'NUXT_GITHUB_TOKEN', label: 'GitHub token (private repo updates)', description: 'PAT with contents:read. Only needed if your release repo is private.', category: 'oauth', type: 'secret_text', auto: null },

  // SMTP (user-provided)
  { key: 'NUXT_SMTP_HOST', label: 'SMTP host', description: 'e.g. smtp.resend.com, smtp.sendgrid.net.', category: 'smtp', type: 'secret_text', auto: null },
  { key: 'NUXT_SMTP_PORT', label: 'SMTP port', description: 'Typically 587 (STARTTLS) or 465 (SSL).', category: 'smtp', type: 'secret_text', auto: null },
  { key: 'NUXT_SMTP_USER', label: 'SMTP username', description: 'Often "apikey" for services like SendGrid/Resend.', category: 'smtp', type: 'secret_text', auto: null },
  { key: 'NUXT_SMTP_PASS', label: 'SMTP password / API key', description: 'The actual provider API key.', category: 'smtp', type: 'secret_text', auto: null },
  { key: 'NUXT_SMTP_FROM', label: 'From address', description: 'e.g. "MyApp <no-reply@mybrand.com>". Must be a verified sender.', category: 'smtp', type: 'secret_text', auto: null },

  // Payments (user-provided)
  { key: 'NUXT_SEPAY_TRANSACTION_PREFIX', label: 'Sepay transaction prefix', description: 'Used to identify your transactions in bank transfer descriptions.', category: 'payments', type: 'secret_text', auto: null },
  { key: 'NUXT_SEPAY_BANK_NUMBER', label: 'Sepay bank account number', description: 'Your bank account to receive payments.', category: 'payments', type: 'secret_text', auto: null },
  { key: 'NUXT_SEPAY_BANK_NAME', label: 'Sepay bank name', description: 'Bank short code, e.g. "VCB" for Vietcombank.', category: 'payments', type: 'secret_text', auto: null },

  // Support
  { key: 'NUXT_CUSTOMER_SUPPORT_EMAIL', label: 'Customer support email', description: 'Surfaces in support emails and the contact form.', category: 'support', type: 'secret_text', auto: null },

  // Admin credential (generated once on first deploy; see bootstrapAdminCredential)
  { key: 'NUXT_ADMIN_EMAIL', label: 'Admin email', description: 'Email for the built-in system-admin login. Generated on first deploy. Clear the password below to disable credential login once OAuth is set up.', category: 'auth', type: 'secret_text', auto: null },
  { key: 'NUXT_ADMIN_PASSWORD', label: 'Admin password', description: 'Password for the built-in system-admin login. Generated on first deploy — reveal it to sign in. Editable; clear to disable credential login.', category: 'auth', type: 'secret_text', auto: null },
]

const SECRET_KEYS = new Set(SELFHOST_SECRET_CATALOG.map(d => d.key))

export function isKnownSecretKey(key: string): boolean {
  return SECRET_KEYS.has(key)
}

export function findSecretDef(key: string): SecretDef | undefined {
  return SELFHOST_SECRET_CATALOG.find(d => d.key === key)
}

export interface AutoGenContext {
  workersDevUrl: string
  releaseRepo: string
}

export function generateAutoSecret(def: SecretDef, ctx: AutoGenContext): string | null {
  switch (def.auto) {
    case 'random-hex-32': {
      const bytes = new Uint8Array(32)
      crypto.getRandomValues(bytes)
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    }
    case 'derive-base-domain':
      return new URL(ctx.workersDevUrl).host
    case 'derive-ssl-enabled':
      return 'true'
    case 'derive-release-repo':
      return ctx.releaseRepo
    default:
      return null
  }
}

export interface AdminCredentialSeed {
  key: 'NUXT_ADMIN_EMAIL' | 'NUXT_ADMIN_PASSWORD'
  value: string
}

/**
 * Initial values for the built-in admin login, generated at first deploy.
 * Email derives from the worker host; password is 24 random bytes (hex).
 * Caller inserts with onConflictDoNothing so an existing value is preserved
 * (operator edits + redeploys must not regenerate).
 */
export function bootstrapAdminCredential(workersDevUrl: string): AdminCredentialSeed[] {
  const host = new URL(workersDevUrl).host
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const password = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  return [
    { key: 'NUXT_ADMIN_EMAIL', value: `admin@${host}` },
    { key: 'NUXT_ADMIN_PASSWORD', value: password },
  ]
}
