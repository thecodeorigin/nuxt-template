const MAILDEV_URL = process.env.MAILDEV_URL ?? 'http://localhost:1080'

export interface MaildevEmail {
  id: string
  subject: string
  to: { address: string, name?: string }[]
  from: { address: string, name?: string }[]
  html?: string
  text?: string
}

export async function maildevReachable(): Promise<boolean> {
  try {
    return (await fetch(`${MAILDEV_URL}/email`)).ok
  }
  catch {
    return false
  }
}

export async function getMaildevEmails(): Promise<MaildevEmail[]> {
  const res = await fetch(`${MAILDEV_URL}/email`)
  return res.ok ? (await res.json()) as MaildevEmail[] : []
}

export async function clearMaildev(): Promise<void> {
  try {
    await fetch(`${MAILDEV_URL}/email/all`, { method: 'DELETE' })
  }
  catch {}
}
