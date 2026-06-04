import type { Check } from '#layers/auth/server/services/casl'

// Authorization gates for the project routes. OR semantics: the first passing
// check wins (see layers/auth/server/services/casl.ts → evaluateChecks).
//
// Vocabulary:
//   - `project:manage`      → unscoped admin power (the manage bypass also
//                             satisfies any `project:*:self` without ownership).
//   - `project:*:self`      → the acting user owns the project (role:'owner'
//                             member row, resolved by server/plugins/self.ability.ts).
//   - `project:write` (unscoped) → CREATE capability ONLY. MEMBER holds it to
//     create projects. NEVER list it on a route that targets an existing :id,
//     or every member regains write/delete over projects they do not own.

export const PROJECT_READ_LIST_GATE: Check[] = ['project:read', 'project:manage']
export const PROJECT_READ_DETAIL_GATE: Check[] = ['project:read', 'project:read:self', 'project:manage']
export const PROJECT_CREATE_GATE: Check[] = ['project:write', 'project:manage']
export const PROJECT_WRITE_SELF_GATE: Check[] = ['project:write:self', 'project:manage']
export const PROJECT_DELETE_GATE: Check[] = ['project:delete', 'project:delete:self', 'project:manage']
