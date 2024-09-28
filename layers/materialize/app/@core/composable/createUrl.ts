import { stringifyQuery } from 'ufo'
import type { MaybeRefOrGetter } from 'vue'

interface Options {
  query: MaybeRefOrGetter<Record<string, any>>
}

export function createUrl(url: MaybeRefOrGetter<string>, options?: Options) {
  return computed(() => {
    if (!options?.query)
      return toValue(url)

    const _url = toValue(url)
    const _query = toValue(options?.query)

    const queryObj = Object.fromEntries(
      Object.entries(_query).map(([key, val]) => [key, toValue(val)]),
    )

    return `${_url}${queryObj ? `?${stringifyQuery(queryObj)}` : ''}`
  })
}
