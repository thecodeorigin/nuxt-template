import type { MongoAbility } from '@casl/ability'
import type { H3Event } from 'h3'
import type { AuthUser } from '#layers/auth/server/services/auth'
import { subject } from '@casl/ability'
import { createError, getRouterParam } from 'h3'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { buildAbility, WILDCARDABLE_ACTIONS } from '#layers/auth/shared/casl'

export interface SubjectRegistration<T extends { user_id: string } = { user_id: string }> {
  paramName?: string
  fetch: (id: string, event: H3Event) => Promise<T | null> | T | null
}

const subjectRegistry = new Map<string, SubjectRegistration>()

export function defineSubject<T extends { user_id: string }>(
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

async function evaluateAbilityString(
  abilityStr: string,
  caslAbility: MongoAbility,
  session: AuthUser,
  getParam: (name: string) => string | undefined,
  event: H3Event,
): Promise<EvaluationResult> {
  const [subjectName = '', action = '', scope] = abilityStr.split(':')

  // Guard: system-specific actions (e.g. 'impersonate') must not be implied
  // by the 'manage' wildcard — require an exact ability string match instead.
  if (!WILDCARDABLE_ACTIONS.has(action) && action !== 'manage') {
    return { allowed: session.abilities.includes(abilityStr) }
  }

  if (scope !== 'self') {
    // Check with an empty instance so conditional (`:self`) rules don't accidentally
    // satisfy an unscoped gate — conditions like { user_id } won't match {}.
    return { allowed: caslAbility.can(action, subject(subjectName, {})) }
  }

  // :self — quick type-level bail before the DB fetch
  if (!caslAbility.can(action, subjectName)) {
    return { allowed: false }
  }

  // :self — fetch the resource and let CASL verify the user_id condition
  const reg = subjectRegistry.get(subjectName)
  if (!reg) {
    throw createError({
      statusCode: 500,
      statusMessage: `Subject "${subjectName}" not registered. Call defineSubject('${subjectName}', { fetch }) before using a ":self" ability.`,
    })
  }

  const paramName = reg.paramName ?? 'id'
  const id = getParam(paramName)
  if (!id) {
    return { allowed: false }
  }

  const resource = await reg.fetch(id, event)
  if (!resource) {
    return { allowed: false }
  }

  // Ownership check: user owns the resource OR has unconditional manage.
  // We cannot rely on caslAbility.can(action, instance) here because an unscoped
  // ability (e.g. `project:write` for CREATE) would satisfy the conditional check,
  // letting any member bypass the ownership gate.
  const owns = resource.user_id === session.id
  const hasManage = caslAbility.can('manage', subject(subjectName, {}))
  if (!owns && !hasManage) {
    return { allowed: false }
  }

  return { allowed: true, extras: { [subjectName]: resource } }
}

export async function evaluateChecks(
  checks: Check[],
  session: AuthUser,
  event: H3Event,
): Promise<EvaluationResult> {
  const caslAbility = buildAbility(session.abilities, session.id)
  const getParam = (name: string) => getRouterParam(event, name)

  for (const check of checks) {
    if (typeof check === 'string') {
      const r = await evaluateAbilityString(check, caslAbility, session, getParam, event)
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

export function defineAuthorizedHandler<T>(
  checks: Check[],
  handler: (event: H3Event, ctx: { session: AuthUser } & Record<string, unknown>) => Promise<T> | T,
) {
  return defineAuthenticatedHandler((event, session) =>
    runAuthorizedHandler(checks, session, event, handler),
  )
}
