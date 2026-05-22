import type { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm'

type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T]

export type InferSelect<T extends Table>
  = InferSelectModel<T> extends infer S
    ? Omit<S, NullableKeys<S>> & Partial<Pick<S, NullableKeys<S>>>
    : never

export type InferInsert<T extends Table>
  = InferInsertModel<T> extends infer S
    ? Omit<S, NullableKeys<S>> & Partial<Pick<S, NullableKeys<S>>>
    : never
