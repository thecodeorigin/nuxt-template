import type { H3Event } from 'h3'
import type { AuthUser } from '#layers/auth/server/services/auth'
import { createError, getRouterParam } from 'h3'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { parseAbility, satisfiesAbility } from '#layers/auth/shared/ability'

export interface SubjectRegistration<T extends Record<string, unknown> = Record<string, unknown>> {
  paramName?: string
  ownerKey?: string
  fetch: (id: string, event: H3Event) => Promise<T | null> | T | null
}

const subjectRegistry = new Map<string, SubjectRegistration>()

export function defineSubject<T extends Record<string, unknown>>(
  name: string,
  registration: SubjectRegistration<T>,
) {
  subjectRegistry.set(name, registration as SubjectRegistration)
}

export function getSubjectRegistration(name: string) {
  return subjectRegistry.get(name)
}

export function _resetSubjects() {
  subjectRegistry.clear()
}

export function hasExactAbility(abilities: string[], ability: string): boolean {
  return abilities.includes(ability)
}

export interface EvaluationResult {
  allowed: boolean
  extras?: Record<string, unknown>
}

export type FunctionCheck = (
  event: H3Event,
  session: AuthUser,
) =>
  | Promise<{ allowed: boolean } & Record<string, unknown>>
  | ({ allowed: boolean } & Record<string, unknown>)

export type Check = string | FunctionCheck

export async function evaluateAbilityString(
  ability: string,
  session: AuthUser,
  ctx: { getParam: (name: string) => string | undefined, event: H3Event },
): Promise<EvaluationResult> {
  if (!satisfiesAbility(session.abilities, ability)) {
    return { allowed: false }
  }

  const { subject, scope } = parseAbility(ability)
  if (scope !== 'self') {
    return { allowed: true }
  }

  if (satisfiesAbility(session.abilities, `${subject}:manage`)) {
    return { allowed: true }
  }

  const reg = subjectRegistry.get(subject)
  if (!reg) {
    throw createError({
      statusCode: 500,
      statusMessage: `Subject "${subject}" not registered. Call defineSubject('${subject}', { fetch }) before using a ":self" ability.`,
    })
  }

  const paramName = reg.paramName ?? 'id'
  const ownerKey = reg.ownerKey ?? 'user_id'
  const id = ctx.getParam(paramName)
  if (!id) {
    return { allowed: false }
  }

  const resource = await reg.fetch(id, ctx.event)
  if (!resource) {
    return { allowed: false }
  }

  if (resource[ownerKey] !== session.id) {
    return { allowed: false }
  }

  return { allowed: true, extras: { [subject]: resource } }
}

export async function evaluateChecks(
  checks: Check[],
  session: AuthUser,
  event: H3Event,
): Promise<EvaluationResult> {
  const ctx = {
    event,
    getParam: (name: string) => getRouterParam(event, name),
  }

  for (const check of checks) {
    if (typeof check === 'string') {
      const r = await evaluateAbilityString(check, session, ctx)
      if (r.allowed)
        return r
      continue
    }

    const r = await check(event, session)
    if (r.allowed) {
      const { allowed, ...rest } = r
      return { allowed, extras: rest }
    }
  }

  return { allowed: false }
}

export async function runAuthorizedHandler<T>(
  checks: Check[],
  session: AuthUser,
  event: H3Event,
  handler: (event: H3Event, ctx: { session: AuthUser } & Record<string, unknown>) => Promise<T> | T,
): Promise<T> {
  const result = await evaluateChecks(checks, session, event)
  if (!result.allowed) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return handler(event, { session, ...(result.extras ?? {}) })
}

/**
 * @example
 * ```ts
 * export default defineAuthorizedHandler(
 *   ['blog:read', 'blog:read:self', (event, session) => ({ allowed: true, blog })],
 *   (event, { session, blog }) => ({ ... }),
 * )
 * ```
 */
export function defineAuthorizedHandler<T>(
  checks: Check[],
  handler: (event: H3Event, ctx: { session: AuthUser } & Record<string, unknown>) => Promise<T> | T,
) {
  return defineAuthenticatedHandler((event, session) =>
    runAuthorizedHandler(checks, session, event, handler),
  )
}
