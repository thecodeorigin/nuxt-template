import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { ParsedFilterQuery } from '../utils/filter'

interface CrudOptions<T> {
  searchBy?: Array<keyof T>
  queryRestrict?: () => any
}

export function useCrud<T extends PgTable>(sourceTable: T, options?: CrudOptions<T>) {
  async function getRecordsPaginated(opts: ParsedFilterQuery) {
    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1 } = opts

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

    console.log('sysRecordSubquery', sysRecordSubquery.toSQL())

    const sysRecordCount = (
      await db.select({ count: count() }).from(sysRecordSubquery.as('count'))
    )[0]

    const sysRecords = await sysRecordSubquery
      .orderBy(
        sortAsc ? asc((sourceTable as any)[sortBy]) : desc((sourceTable as any)[sortBy]),
      )
      .offset((page - 1) * limit)
      .limit(limit)

    return {
      data: sysRecords as InferSelectModel<T>[],
      total: sysRecordCount.count,
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
      total: response.count,
    }
  }

  return {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  }
}
