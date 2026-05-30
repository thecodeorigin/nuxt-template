import type { DispatchFilter } from '#layers/system/shared/schemas/dispatch'
import { db } from '@nuxthub/db'
import {
  organizationMemberRoleTable,
  organizationMemberTable,
  organizationTable,
  roleTable,
  userTable,
} from '@nuxthub/db/schema'
import { asc, eq, inArray } from 'drizzle-orm'
import { isEmailEnabled } from '~~/layers/auth/server/services/email'

export interface DispatchOption { id: string, label: string }
export interface DispatchOptions { organizations: DispatchOption[], roles: DispatchOption[] }

/** Options for the recipient pickers: every org, every role (labelled with its org). */
export async function getDispatchOptions(): Promise<DispatchOptions> {
  const orgs = await db
    .select({ id: organizationTable.id, name: organizationTable.name })
    .from(organizationTable)
    .orderBy(asc(organizationTable.name))

  const roles = await db
    .select({ id: roleTable.id, name: roleTable.name, orgName: organizationTable.name })
    .from(roleTable)
    .innerJoin(organizationTable, eq(organizationTable.id, roleTable.organization_id))
    .orderBy(asc(organizationTable.name), asc(roleTable.name))

  return {
    organizations: orgs.map(o => ({ id: o.id, label: o.name })),
    roles: roles.map(r => ({ id: r.id, label: `${r.orgName} · ${r.name}` })),
  }
}

export interface DispatchRecipient {
  id: string
  primary_email: string
  name: string | null
  notification_prefs: { email?: boolean } | null
}
export interface ResolvedRecipients {
  enabled: DispatchRecipient[]
  skippedCount: number
  total: number
}

const RECIPIENT_COLS = {
  id: userTable.id,
  primary_email: userTable.primary_email,
  name: userTable.name,
  notification_prefs: userTable.notification_prefs,
}

/**
 * Union of every selected criterion, deduped by user id. `emails[]` only ever
 * resolves to existing user rows — addresses with no account are dropped (no open
 * relay, no enumeration). Then split into email-enabled vs opted-out.
 */
export async function resolveDispatchRecipients(filter: DispatchFilter): Promise<ResolvedRecipients> {
  const byId = new Map<string, DispatchRecipient>()
  const add = (rows: DispatchRecipient[]) => {
    for (const r of rows) byId.set(r.id, r)
  }

  if (filter.allUsers) {
    add(await db.select(RECIPIENT_COLS).from(userTable))
  }
  else {
    if (filter.organizationIds.length) {
      add(await db.select(RECIPIENT_COLS)
        .from(organizationMemberTable)
        .innerJoin(userTable, eq(userTable.id, organizationMemberTable.user_id))
        .where(inArray(organizationMemberTable.organization_id, filter.organizationIds)))
    }
    if (filter.roleIds.length) {
      add(await db.select(RECIPIENT_COLS)
        .from(organizationMemberRoleTable)
        .innerJoin(organizationMemberTable, eq(organizationMemberTable.id, organizationMemberRoleTable.member_id))
        .innerJoin(userTable, eq(userTable.id, organizationMemberTable.user_id))
        .where(inArray(organizationMemberRoleTable.role_id, filter.roleIds)))
    }
    if (filter.emails.length) {
      add(await db.select(RECIPIENT_COLS)
        .from(userTable)
        .where(inArray(userTable.primary_email, filter.emails)))
    }
  }

  const all = [...byId.values()]
  const enabled = all.filter(r => isEmailEnabled(r.notification_prefs))
  return { enabled, skippedCount: all.length - enabled.length, total: all.length }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Subject is escaped; body is editor-authored HTML embedded into a static shell. */
export function composeEmailHtml(subject: string, bodyHtml: string): string {
  const safeSubject = escapeHtml(subject)
  return `<!doctype html><html><body style="font-family:sans-serif;line-height:1.5;color:#111111">`
    + `<h1 style="font-size:18px;margin:0 0 12px">${safeSubject}</h1>`
    + `<div>${bodyHtml}</div>`
    + `</body></html>`
}
