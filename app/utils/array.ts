import { omit as _omit } from 'lodash-es'

export function omit<A extends object, B extends ReadonlyArray<keyof A>>(
  obj: A,
  keys: B,
) {
  return _omit(obj, keys) as Omit<A, B[number]>
}
