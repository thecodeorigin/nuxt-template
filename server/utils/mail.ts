export interface MailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Single outbound-email transport seam. Dev: runtimeConfig.mail.smtp resolves to the
 * maildev SMTP (host localhost, port 1025 — run `pnpm mail:dev`, inbox at
 * http://localhost:1080), so this delivers straight to maildev. Prod (Cloudflare
 * Workers) cannot open SMTP sockets — the prod provider (fetch-based) is wired by the
 * mail-setup session here. nodemailer is imported dynamically so it never enters the
 * prod top-level module graph.
 */
export async function sendMail(message: MailMessage) {
  const config = useRuntimeConfig()
  const mail = config.mail as { smtp?: unknown, message?: { from?: string } } | undefined
  if (!mail?.smtp)
    throw createError({ statusCode: 500, statusMessage: 'Mail transport not configured' })

  const { createTransport } = await import('nodemailer')
  const transport = createTransport(mail.smtp as Parameters<typeof createTransport>[0])
  const from = mail.message?.from ?? 'noreply@localhost'
  return transport.sendMail({ from, to: message.to, subject: message.subject, html: message.html, text: message.text })
}
