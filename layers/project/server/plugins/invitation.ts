import { db } from '@nuxthub/db'
import { projectMemberTable } from '@nuxthub/db/schema'

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('invitation:accepted', async ({ userId, invitation }) => {
    const meta = invitation.metadata as { project_ids?: unknown } | null
    const fromMeta = Array.isArray(meta?.project_ids) ? meta.project_ids as string[] : []
    const legacy = Array.isArray(invitation.project_ids) ? invitation.project_ids : []
    const projectIds = fromMeta.length ? fromMeta : legacy
    if (!projectIds.length)
      return
    await Promise.all(projectIds.map(projectId =>
      db.insert(projectMemberTable)
        .values({ project_id: projectId, user_id: userId, role: 'member' })
        .onConflictDoNothing(),
    ))
  })
})
