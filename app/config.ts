import VerticalNavHeaderArrow from '@base/images/svg/vertical-nav-header-arrow.svg'
import { breakpointsVuetifyV3 } from '@vueuse/core'
import { VIcon } from 'vuetify/components/VIcon'

// ❗ Logo SVG must be imported with ?raw suffix
import logo from '@base/images/logo.svg?raw'
import { Skins } from '@base/@core/enums'
import { AppContentLayoutNav, ContentWidth, FooterType, NavbarType } from '@base/@layouts/enums'
import { defineThemeConfig } from '@base/@core'
import { h } from 'vue'

export const { themeConfig, layoutConfig } = defineThemeConfig({
  app: {
    title: 'nuxt-template',

    // ❗ if you have SVG logo and want it to adapt according to theme color, you have to apply color as `color: rgb(var(--v-global-theme-primary))`
    logo: h('div', { innerHTML: logo, style: 'line-height:0; color: rgb(var(--v-global-theme-primary))' }),
    contentWidth: ContentWidth.Boxed,
    contentLayoutNav: AppContentLayoutNav.Vertical,
    overlayNavFromBreakpoint: breakpointsVuetifyV3.lg - 1, // 1 for matching with vuetify breakpoint. Docs: https://next.vuetifyjs.com/en/features/display-and-platform/
    theme: 'light',
    skin: Skins.Default,
    iconRenderer: VIcon,
  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
  },
  footer: { type: FooterType.Static },
  verticalNav: {
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'ri-circle-fill' },
    isVerticalNavSemiDark: false,
  },
  horizontalNav: {
    type: 'sticky',
    transition: 'slide-y-reverse-transition',
    popoverOffset: 4,
  },

  /*
  // ℹ️  In below Icons section, you can specify icon for each component. Also you can use other props of v-icon component like `color` and `size` for each icon.
  // Such as: chevronDown: { icon: 'ri-arrow-down-s-line', color:'primary', size: '24' },
  */
  icons: {
    chevronDown: { icon: 'ri-arrow-down-s-line' },
    chevronRight: { icon: 'ri-arrow-right-s-line' },
    close: { icon: 'ri-close-line' },
    verticalNavPinned: { icon: h(VerticalNavHeaderArrow) },
    verticalNavUnPinned: { icon: h(VerticalNavHeaderArrow) },
    sectionTitlePlaceholder: { icon: 'ri-subtract-line' },
  },
})