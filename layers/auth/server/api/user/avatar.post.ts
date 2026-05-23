import { blob } from '@nuxthub/blob'
import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError, getCookie, getHeader, readMultipartFormData } from 'h3'
import { sniffImage } from '~~/server/utils/image'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { persistSession } from '#layers/auth/server/services/session'

const MAX = 2 * 1024 * 1024

export default defineAuthenticatedHandler(async (event, session) => {
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename)
  if (!file?.data?.length)
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  if (file.data.length > MAX)
    throw createError({ statusCode: 413, statusMessage: 'Avatar must be ≤ 2MB' })

  const sniff = sniffImage(file.data)
  if (!sniff)
    throw createError({ statusCode: 415, statusMessage: 'Unsupported image type (PNG/JPEG/GIF/WEBP only)' })

  const pathname = `avatars/${session.id}/${crypto.randomUUID()}.${sniff.ext}`
  await blob.put(pathname, file.data, { contentType: sniff.type })

  const [current] = await db.select({ avatar: userTable.avatar }).from(userTable).where(eq(userTable.id, session.id)).limit(1)
  const [updated] = await db.update(userTable).set({ avatar: `/images/${pathname}` }).where(eq(userTable.id, session.id)).returning()

  const prev = current?.avatar
  if (prev?.startsWith('/images/avatars/'))
    await blob.del(prev.replace('/images/', '')).catch(() => {})

  const sid = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
  if (sid && updated) {
    await persistSession(event, updated, {
      provider: session.provider,
      activeOrganizationId: session.activeOrganizationId,
      impersonator: session.impersonator,
      sessionId: sid,
    })
  }

  return { avatar: updated!.avatar }
})
