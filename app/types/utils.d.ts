export type ExtractResponse<T extends (...args: any) => any, U extends keyof ReturnType<T>>
  = Exclude<Awaited<ReturnType<ReturnType<T>[U]>>, never | never[]> | null | undefined
