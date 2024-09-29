import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { ParsedFilterQuery } from '@materialize/server/utils/filter'

interface CrudOptions<T> {
  searchBy?: Array<keyof T>
  queryRestrict?: () => any
}

export function useCrud<T extends PgTable>(sourceTable: T, options?: CrudOptions<T>) {
  async function getRecordsPaginated(opts: Partial<ParsedFilterQuery>) {
    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1, withCount = false } = opts

    const searchConditions = []

    if (Array.isArray(options?.searchBy)) {
      for (const field of options.searchBy) {
        if (keyword || keywordLower) {
          searchConditions.push(...[
            sourceTable[field] && ilike(sourceTable[field] as any, `%${keyword || ''}%`),
            sourceTable[field] && ilike(sourceTable[field] as any, `%${keywordLower || ''}%`),
          ])
        }
      }
    }

    const sysRecordSubquery = db.select().from(sourceTable)
      .where(
        and(...[
          options?.queryRestrict?.(),
          searchConditions.length && or(
            ...searchConditions.filter(Boolean),
          ),
        ].filter(Boolean)),
      )

    let total = 0

    if (withCount) {
      total = (
        await db.select({ count: count() }).from(sysRecordSubquery.as('count'))
      )[0]?.count || 0
    }

    const sysRecords = await sysRecordSubquery
      .orderBy(
        sortAsc ? asc((sourceTable as any)[sortBy]) : desc((sourceTable as any)[sortBy]),
      )
      .offset((page - 1) * limit)
      .limit(limit)

    if (!withCount)
      total = sysRecords.length

    return {
      data: sysRecords as InferSelectModel<T>[],
      total,
    }
  }

  async function getRecordByKey(key: keyof T, value: any) {
    const sysRecord = (
      await db.select().from(sourceTable)
        .where(
          and(
            ...[
              options?.queryRestrict?.(),
              eq(sourceTable[key] as any, value),
            ].filter(Boolean),

          ),
        )
        .limit(1)
    )[0]

    return { data: sysRecord as InferSelectModel<T> }
  }

  async function updateRecordByKey(key: keyof T, value: any, body: InferInsertModel<T>) {
    const sysRecord = (
      await db.update(sourceTable)
        .set(body)
        .where(
          and(

            ...[
              options?.queryRestrict?.(),
              eq(sourceTable[key] as any, value),
            ].filter(Boolean),
          ),
        )
        .returning()
    )[0]

    return { data: sysRecord as InferSelectModel<T> }
  }

  async function createRecord(body: InferInsertModel<T>) {
    const sysRecord = (
      await db.insert(sourceTable)
        .values(body)
        .returning()
    )[0]

    return { data: sysRecord as InferSelectModel<T> }
  }

  async function deleteRecordByKey(key: keyof T, value: any) {
    const sysRecord = await db.delete(sourceTable)
      .where(
        and(
          ...[
            options?.queryRestrict?.(),
            eq(sourceTable[key] as any, value),
          ].filter(Boolean),
        ),
      )
      .returning()

    return { data: sysRecord as InferSelectModel<T> }
  }

  async function countRecords() {
    const sysRecordSubquery = db.select().from(sourceTable).where(options?.queryRestrict?.())

    const response = (
      await db.select({ count: count() }).from(sysRecordSubquery.as('count'))
    )[0]

    return {
      total: response?.count || 0,
    }
  }
  async function updateManyRecords(body: InferInsertModel<T>) {
    if (!options?.queryRestrict) {
      throw new Error('Query restrict option is required for updating many records.')
    }

    const sysRecord = (
      await db.update(sourceTable)
        .set(body)
        .where(
          options?.queryRestrict?.(),
        )
        .returning()
    )

    return { data: sysRecord as InferSelectModel<T>[] }
  }

  return {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
    updateManyRecords,
  }
}
