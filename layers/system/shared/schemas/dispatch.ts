import { z } from 'zod'

export const DispatchFilterSchema = z.object({
  allUsers: z.boolean().default(false),
  organizationIds: z.array(z.string().min(1)).max(100).default([]),
  roleIds: z.array(z.string().min(1)).max(100).default([]),
  emails: z.array(z.string().trim().toLowerCase().email()).max(200).default([]),
}).refine(
  f => f.allUsers || f.organizationIds.length > 0 || f.roleIds.length > 0 || f.emails.length > 0,
  { message: 'Select at least one recipient criterion' },
)

// SMTP headers are newline-delimited — reject CR/LF to block header injection.
const NO_CONTROL = /^[^\r\n]*$/

const HTML_TAG_RE = /<[^>]*>/g
const NBSP_RE = /&nbsp;/gi
const IMG_RE = /<img\b/i
/** Guards against the editor's empty `<p></p>` output. */
export function htmlHasText(html: string): boolean {
  const text = html.replace(HTML_TAG_RE, '').replace(NBSP_RE, ' ').trim()
  return text.length > 0 || IMG_RE.test(html)
}

export const DispatchSendSchema = z.object({
  filter: DispatchFilterSchema,
  subject: z.string().trim().min(1).max(200).regex(NO_CONTROL, 'Subject cannot contain line breaks'),
  body: z.string().trim().min(1).max(50000).refine(htmlHasText, 'Body cannot be empty'),
})

export type DispatchFilter = z.infer<typeof DispatchFilterSchema>
export type DispatchSend = z.infer<typeof DispatchSendSchema>
