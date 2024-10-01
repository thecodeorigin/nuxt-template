import type { NavGroupType, NavItem } from '@base/@layouts/types'
import type { Actions, Subjects } from '#imports'
import { useHead } from '#imports'

type UseMetaInput = Parameters<typeof useHead>[0] & {
  action?: Actions
  subject?: Subjects
  sidebar?: (NavItem & {
    group?: NavGroupType
  })
}
type UseMetaOptions = Parameters<typeof useHead>[1]

function getMatchedRoute(routeName?: string) {
  const route = useRoute()

  if (routeName)
    return route.matched.find(r => r.name === routeName) || route

  return route
}

function patchPageMeta(key: string, value: any, routeName?: string) {
  const matchedRoute = getMatchedRoute(routeName)

  if (matchedRoute) {
    matchedRoute.meta[key] = value
  }
}

/**
 * overridden `useHead` with Paradox custom inputs
 *
 * @param input `useHead` overriden input
 * @param routeName is required if want to display sidebar for parent route in nested pages
 * @param options `useHead` options
 */
export function useMeta(input: UseMetaInput, routeName?: string, options?: UseMetaOptions) {
  useHead(omit(input, ['sidebar', 'action', 'subject']), options)

  // patch each custom input explicitly
  patchPageMeta('sidebar', input.sidebar, routeName)
}
