import { and, count, eq, ilike, isNotNull, isNull, or } from 'drizzle-orm'
import { sysNotificationTable } from '@base/server/db/schemas'
import type { ParsedFilterQuery } from '@base/server/utils/filter'

export function useNotification() {
  async function getNotificationCount(userId: string, options: Partial<ParsedFilterQuery>, unread?: boolean) {
    const data = await db.select({ total: count() }).from(sysNotificationTable).where(
      and(
        eq(sysNotificationTable.user_id, userId),
        unread ? isNull(sysNotificationTable.read_at) : undefined,
        or(
          ilike(sysNotificationTable.title, `%${options?.keyword || ''}%`),
          ilike(sysNotificationTable.message, `%${options?.keyword || ''}%`),
          ilike(sysNotificationTable.title, `%${options?.keywordLower || ''}%`),
          ilike(sysNotificationTable.message, `%${options?.keywordLower || ''}%`),
        ),
      ),
    )

    return data[0]
  }

  async function getNotificationsPaginated(userId: string, options: Partial<ParsedFilterQuery>, unread?: boolean) {
    const limit = options.limit || 20
    const page = options.page || 1

    const notifications = await db.query.sysNotificationTable.findMany({
      limit,
      offset: limit * (page - 1),
      orderBy(schema, { asc, desc }) {
        return options.sortAsc
          ? asc((schema as any)[options.sortBy || 'created_at'])
          : desc((schema as any)[options.sortBy || 'created_at'])
      },
      where(schema, { and, or, eq, ilike }) {
        if (options.keyword && options.keywordLower) {
          return and(
            eq(schema.user_id, userId),
            unread ? isNull(schema.read_at) : undefined,
            or(
              ilike(schema.title, `%${options.keyword}%`),
              ilike(schema.message, `%${options.keyword}%`),
              ilike(schema.title, `%${options.keywordLower}%`),
              ilike(schema.message, `%${options.keywordLower}%`),
            ),
          )
        }
      },
    })

    const { total } = options.withCount
      ? await getNotificationCount(userId, options, unread)
      : { total: notifications.length }

    return {
      data: notifications,
      total,
    }
  }

  function getNotificationById(notificationId: string, userId: string) {
    return db.query.sysNotificationTable.findFirst({
      where(schema, { and, eq }) {
        return and(
          eq(schema.user_id, userId),
          eq(schema.id, notificationId),
        )
      },
    })
  }

  function createNotification(userId: string, payload: { title: string, message: string, action: any, user_id: string }) {
    return db.insert(sysNotificationTable).values({
      ...payload,
      user_id: userId,
    })
  }

  function readNotificationById(notificationId: string, userId: string) {
    return db.update(sysNotificationTable).set({
      read_at: new Date(),
    }).where(
      and(
        eq(sysNotificationTable.user_id, userId),
        eq(sysNotificationTable.id, notificationId),
      ),
    )
  }

  function unreadNotificationById(notificationId: string, userId: string) {
    return db.update(sysNotificationTable).set({
      read_at: null,
    }).where(
      and(
        eq(sysNotificationTable.user_id, userId),
        eq(sysNotificationTable.id, notificationId),
      ),
    )
  }

  function deleteNotificationById(notificationId: string, userId: string) {
    return db.delete(sysNotificationTable).where(
      and(
        eq(sysNotificationTable.user_id, userId),
        eq(sysNotificationTable.id, notificationId),
      ),
    )
  }

  function markAllRead(userId: string) {
    return db.update(sysNotificationTable).set({
      read_at: new Date(),
    }).where(
      and(
        eq(sysNotificationTable.user_id, userId),
        isNull(sysNotificationTable.read_at),
      ),
    )
  }

  function markAllUnread(userId: string) {
    return db.update(sysNotificationTable).set({
      read_at: null,
    }).where(
      and(
        eq(sysNotificationTable.user_id, userId),
        isNotNull(sysNotificationTable.read_at),
      ),
    )
  }

  return {
    getNotificationsPaginated,
    getNotificationCount,
    getNotificationById,
    createNotification,
    readNotificationById,
    unreadNotificationById,
    deleteNotificationById,
    markAllRead,
    markAllUnread,
  }
}
