/**
 * Dev-only diagnostic that confirms migrations are bundled and visible
 * to the runtime. Safe to delete once verified.
 */
// @ts-expect-error virtual module
import migrations from '#migrations/sql'

interface MigrationFile { name: string, content: string }

export default defineEventHandler(() => {
  if (!import.meta.dev && process.env.NUXT_DEMO_MODE !== 'true')
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const list = (migrations as MigrationFile[]) ?? []

  return {
    count: list.length,
    files: list.map(m => ({ name: m.name, bytes: m.content.length })),
  }
})
