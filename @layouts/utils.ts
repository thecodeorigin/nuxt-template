import type { Router } from 'vue-router'
import { layoutConfig } from '@layouts/config'
import { AppContentLayoutNav } from '@layouts/enums'
import { useLayoutConfigStore } from '@layouts/stores/config'
import type { NavGroup, NavLink, NavLinkProps } from '@layouts/types'

export const openGroups = ref<string[]>([])

/**
 * Return nav link props to use
 // @param {Object, String} item navigation routeName or route Object provided in navigation data
 */

export const getComputedNavLinkToProp = computed(() => (link: NavLink) => {
  const props: NavLinkProps = {
    target: link.target,
    rel: link.rel,
  }

  // If route is string => it assumes string is route name => Create route object from route name
  // If route is not string => It assumes it's route object => returns passed route object
  if (link.to)
    props.to = typeof link.to === 'string' ? { name: link.to } : link.to
  else props.href = link.href

  return props
})

/**
 * Return route name for navigation link
 * If link is string then it will assume it is route-name
 * IF link is object it will resolve the object and will return the link
 // @param {Object, String} link navigation link object/string
 */
export const resolveNavLinkRouteName = (link: NavLink, router: Router) => {
  if (!link.to)
    return null

  if (typeof link.to === 'string')
    return link.to

  return router.resolve(link.to).name
}

/**
 * Check if nav-link is active
 * @param {object} link nav-link object
 */
export const isNavLinkActive = (link: NavLink, router: Router) => {
  // Matched routes array of current route
  const matchedRoutes = router.currentRoute.value.matched

  // Check if provided route matches route's matched route
  const resolveRoutedName = resolveNavLinkRouteName(link, router)

  if (!resolveRoutedName)
    return false

  return matchedRoutes.some(route => {
    return route.name === resolveRoutedName || route.meta.navActiveLink === resolveRoutedName
  })
}

/**
 * Check if nav group is active
 * @param {Array} children Group children
 */
export const isNavGroupActive = (children: (NavLink | NavGroup)[], router: Router): boolean =>
  children.some(child => {
    // If child have children => It's group => Go deeper(recursive)
    if ('children' in child)
      return isNavGroupActive(child.children, router)

    // else it's link => Check for matched Route
    return isNavLinkActive(child, router)
  })

/**
 * Change `dir` attribute based on direction
 * @param dir 'ltr' | 'rtl'
 */
export const _setDirAttr = (dir: 'ltr' | 'rtl') => {
  // Check if document exists for SSR
  if (typeof document !== 'undefined')
    document.documentElement.setAttribute('dir', dir)
}

/**
 * Return dynamic i18n props based on i18n plugin is enabled or not
 * @param key i18n translation key
 * @param tag tag to wrap the translation with
 */
export const getDynamicI18nProps = (key: string, tag = 'span') => {
  if (!layoutConfig.app.i18n.enable)
    return {}

  return {
    keypath: key,
    tag,
    scope: 'global',
  }
}

export const switchToVerticalNavOnLtOverlayNavBreakpoint = () => {
  const configStore = useLayoutConfigStore()

  /*
      ℹ️ This is flag will hold nav type need to render when switching between lgAndUp from mdAndDown window width

      Requirement: When we nav is set to `horizontal` and we hit the `mdAndDown` breakpoint nav type shall change to `vertical` nav
      Now if we go back to `lgAndUp` breakpoint from `mdAndDown` how we will know which was previous nav type in large device?

      Let's assign value of `appContentLayoutNav` as default value of lgAndUpNav. Why 🤔?
        If template is viewed in lgAndUp
          We will assign `appContentLayoutNav` value to `lgAndUpNav` because at this point both constant is same
          Hence, for `lgAndUpNav` it will take value from theme config file
        else
          It will always show vertical nav and if user increase the window width it will fallback to `appContentLayoutNav` value
          But `appContentLayoutNav` will be value set in theme config file
    */
  const lgAndUpNav = ref(configStore.appContentLayoutNav)

  /*
      There might be case where we manually switch from vertical to horizontal nav and vice versa in `lgAndUp` screen
      So when user comes back from `mdAndDown` to `lgAndUp` we can set updated nav type
      For this we need to update the `lgAndUpNav` value if screen is `lgAndUp`
    */
  watch(
    () => configStore.appContentLayoutNav,
    value => {
      if (!configStore.isLessThanOverlayNavBreakpoint)
        lgAndUpNav.value = value
    },
  )

  /*
      This is layout switching part
      If it's `mdAndDown` => We will use vertical nav no matter what previous nav type was
      Or if it's `lgAndUp` we need to switch back to `lgAndUp` nav type. For this we will tracker property `lgAndUpNav`
    */
  const shouldChangeContentLayoutNav = refAutoReset(true, 500)

  shouldChangeContentLayoutNav.value = false

  watch(() => configStore.isLessThanOverlayNavBreakpoint, val => {
    if (!val) {
      configStore.appContentLayoutNav = lgAndUpNav.value
    }
    else {
      if (!shouldChangeContentLayoutNav.value) {
        setTimeout(() => {
          configStore.appContentLayoutNav = AppContentLayoutNav.Vertical
        }, 500)
      }
      else {
        configStore.appContentLayoutNav = AppContentLayoutNav.Vertical
      }
    }
  }, { immediate: true })
}

/**
 * Convert Hex color to rgb
 * @param hex
 */

export const hexToRgb = (hex: string) => {
// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i

  hex = hex.replace(shorthandRegex, (m: string, r: string, g: string, b: string) => {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return result ? `${Number.parseInt(result[1], 16)},${Number.parseInt(result[2], 16)},${Number.parseInt(result[3], 16)}` : null
}

/**
 *RGBA color to Hex color with / without opacity
 */
export const rgbaToHex = (rgba: string, forceRemoveAlpha = false) => {
  return (
    `#${
      rgba
        .replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
        .split(',') // splits them at ","
        .filter((string, index) => !forceRemoveAlpha || index !== 3)
        .map(string => Number.parseFloat(string)) // Converts them to numbers
        .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
        .map(number => number.toString(16)) // Converts numbers to hex
        .map(string => (string.length === 1 ? `0${string}` : string)) // Adds 0 when length of one number is 1
        .join('')}`
  )
}
