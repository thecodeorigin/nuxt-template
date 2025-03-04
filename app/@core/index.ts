import type { LayoutConfig } from '@base/@layouts/types'
import type { UserThemeConfig } from './types'

export function defineThemeConfig(userConfig: UserThemeConfig): { themeConfig: UserThemeConfig, layoutConfig: LayoutConfig } {
  return {
    themeConfig: userConfig,
    layoutConfig: {
      app: {
        contentWidth: userConfig.app.contentWidth,
        contentLayoutNav: userConfig.app.contentLayoutNav,
        overlayNavFromBreakpoint: userConfig.app.overlayNavFromBreakpoint,
        iconRenderer: userConfig.app.iconRenderer,
      },
      navbar: {
        type: userConfig.navbar.type,
        navbarBlur: userConfig.navbar.navbarBlur,
      },
      footer: { type: userConfig.footer.type },
      verticalNav: {
        isVerticalNavCollapsed: userConfig.verticalNav.isVerticalNavCollapsed,
        defaultNavItemIconProps: userConfig.verticalNav.defaultNavItemIconProps,
      },
      horizontalNav: {
        type: userConfig.horizontalNav.type,
        transition: userConfig.horizontalNav.transition,
        popoverOffset: userConfig.horizontalNav.popoverOffset,
      },
      icons: {
        chevronDown: userConfig.icons.chevronDown,
        chevronRight: userConfig.icons.chevronRight,
        close: userConfig.icons.close,
        verticalNavPinned: userConfig.icons.verticalNavPinned,
        verticalNavUnPinned: userConfig.icons.verticalNavUnPinned,
        sectionTitlePlaceholder: userConfig.icons.sectionTitlePlaceholder,
      },
    },
  }
}
