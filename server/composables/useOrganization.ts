import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysOrganizationTable } from '@base/server/db/schemas'
import { count, eq, ilike, or } from 'drizzle-orm'

export function useOrganization() {
  async function getOrganizationCount(options?: ParsedFilterQuery) {
    const data = await db.select({ total: count() }).from(sysOrganizationTable).where(
      or(
        ilike(sysOrganizationTable.name, `%${options?.keyword || ''}%`),
        ilike(sysOrganizationTable.name, `%${options?.keywordLower || ''}%`),
      ),
    )

    return data[0]
  }

  async function getOrganizations(options: ParsedFilterQuery) {
    const sysOrganizations = await db.query.sysOrganizationTable.findMany({
      limit: options.limit,
      offset: options.limit * (options.page - 1),
      orderBy(schema, { asc, desc }) {
        return options.sortAsc
          ? asc((schema as any)[options.sortBy])
          : desc((schema as any)[options.sortBy])
      },
      where(schema, { or, ilike }) {
        if (options.keyword && options.keywordLower) {
          return or(
            ilike(schema.name, `%${options.keyword}%`),
            ilike(schema.name, `%${options.keywordLower}%`),
          )
        }
      },
    })

    const { total } = options.withCount
      ? await getOrganizationCount(options)
      : { total: sysOrganizations.length }

    return {
      data: sysOrganizations,
      total,
    }
  }

  async function getOrganization(type: 'id' = 'id', value: string) {
    const sysOrganization = await db.query.sysOrganizationTable.findFirst({
      where(schema, { eq }) {
        switch (type) {
          case 'id':
            return eq(schema.id, value)
        }
      },
    })

    return { data: sysOrganization }
  }

  async function getOrganizationById(id: string) {
    const { data } = await getOrganization('id', id)

    return { data }
  }

  async function updateOrganization(type: 'id', value: string, body: any) {
    await db.update(sysOrganizationTable).set(body).where(
      eq(sysOrganizationTable[type], value),
    )
  }

  async function updateOrganizationById(id: string, body: any) {
    await updateOrganization('id', id, body)
  }

  async function createOrganization(body: any) {
    const _data = await db.insert(sysOrganizationTable).values(body).returning()

    return { data: _data[0] }
  }

  async function deleteOrganizationById(id: string) {
    await db.delete(sysOrganizationTable).where(eq(sysOrganizationTable.id, id))
  }

  return {
    getOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganizationById,
    deleteOrganizationById,
    getOrganizationCount,
  }
}
