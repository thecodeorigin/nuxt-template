import type { PartialDeep } from 'type-fest'
import type { Plugin } from 'vue'
import { layoutConfig } from '@base/@layouts/config'
import { cookieRef, useLayoutConfigStore } from '@base/@layouts/stores/config'
import type { LayoutConfig } from '@base/@layouts/types'
import { _setDirAttr } from '@base/@layouts/utils'

// 🔌 Plugin
export function createLayouts(userConfig: PartialDeep<LayoutConfig>): Plugin {
  return (): void => {
    const configStore = useLayoutConfigStore()

    // Non reactive Values
    layoutConfig.app.overlayNavFromBreakpoint = userConfig.app?.overlayNavFromBreakpoint ?? layoutConfig.app.overlayNavFromBreakpoint
    layoutConfig.app.iconRenderer = userConfig.app?.iconRenderer as LayoutConfig['app']['iconRenderer'] ?? layoutConfig.app.iconRenderer

    layoutConfig.verticalNav.defaultNavItemIconProps = userConfig.verticalNav?.defaultNavItemIconProps ?? layoutConfig.verticalNav.defaultNavItemIconProps

    layoutConfig.icons.chevronDown = userConfig.icons?.chevronDown ?? layoutConfig.icons.chevronDown
    layoutConfig.icons.chevronRight = userConfig.icons?.chevronRight ?? layoutConfig.icons.chevronRight
    layoutConfig.icons.close = userConfig.icons?.close ?? layoutConfig.icons.close
    layoutConfig.icons.verticalNavPinned = userConfig.icons?.verticalNavPinned ?? layoutConfig.icons.verticalNavPinned
    layoutConfig.icons.verticalNavUnPinned = userConfig.icons?.verticalNavUnPinned ?? layoutConfig.icons.verticalNavUnPinned
    layoutConfig.icons.sectionTitlePlaceholder = userConfig.icons?.sectionTitlePlaceholder ?? layoutConfig.icons.sectionTitlePlaceholder

    // Reactive Values (Store)
    configStore.$patch({
      appContentLayoutNav: cookieRef('appContentLayoutNav', userConfig.app?.contentLayoutNav ?? layoutConfig.app.contentLayoutNav).value,
      appContentWidth: cookieRef('appContentWidth', userConfig.app?.contentWidth ?? layoutConfig.app.contentWidth).value,
      footerType: cookieRef('footerType', userConfig.footer?.type ?? layoutConfig.footer.type).value,
      navbarType: cookieRef('navbarType', userConfig.navbar?.type ?? layoutConfig.navbar.type).value,
      isNavbarBlurEnabled: cookieRef('isNavbarBlurEnabled', userConfig.navbar?.navbarBlur ?? layoutConfig.navbar.navbarBlur).value,
      isVerticalNavCollapsed: cookieRef('isVerticalNavCollapsed', userConfig.verticalNav?.isVerticalNavCollapsed ?? layoutConfig.verticalNav.isVerticalNavCollapsed).value,

      // isAppRTL: userConfig.app?.isRTL ?? config.app.isRTL,
      // isLessThanOverlayNavBreakpoint: false,
      horizontalNavType: cookieRef('horizontalNavType', userConfig.horizontalNav?.type ?? layoutConfig.horizontalNav.type).value,
    })

    // _setDirAttr(config.app.isRTL ? 'rtl' : 'ltr')
    _setDirAttr(configStore.isAppRTL ? 'rtl' : 'ltr')
  }
}

export { layoutConfig }
