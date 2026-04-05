import type { NuxtError } from '#app'
import { match, P } from 'ts-pattern'

export function whenError(error: Ref<NuxtError<any> | undefined>, callback?: (error: NuxtError) => void) {
  whenever(error, (err) => {
    console.error(err)

    callback?.(err)
  })
}

export function getErrorMessage(error: any) {
  return match(error)
    .with({ code: P.string }, err => `firebase.errors['${err.code}']`)
    .with({ response: { data: { message: P.string } } }, err => err.response.data.message)
    .with({ data: { message: P.string } }, err => err.data.message)
    .with({ message: P.string }, err => err.message)
    .otherwise(() => 'An unknown error occurred')
}
