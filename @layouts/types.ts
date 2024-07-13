import type { OffsetOptions } from '@floating-ui/dom'
import type { RouteLocationRaw } from 'vue-router'
import type { AppContentLayoutNav, ContentWidth, FooterType, HorizontalNavType, NavbarType } from '@layouts/enums'
import type { Component } from 'vue'
import type { Actions, Subjects } from '@/plugins/casl/ability'

export interface LayoutConfig {
  app: {
    title: Lowercase<string>
    logo: VNode
    contentWidth: typeof ContentWidth[keyof typeof ContentWidth]
    contentLayoutNav: typeof AppContentLayoutNav[keyof typeof AppContentLayoutNav]
    overlayNavFromBreakpoint: number

    // isRTL: boolean
    i18n: {
      enable: boolean
    }
    iconRenderer: Component
  }
  navbar: {
    type: typeof NavbarType[keyof typeof NavbarType]
    navbarBlur: boolean
  }
  footer: {
    type: typeof FooterType[keyof typeof FooterType]
  }
  verticalNav: {
    isVerticalNavCollapsed: boolean
    defaultNavItemIconProps: { icon: string }
  }
  horizontalNav: {
    type: typeof HorizontalNavType[keyof typeof HorizontalNavType]
    transition: string | Component
    popoverOffset?: OffsetOptions
  }
  icons: {
    chevronDown: any
    chevronRight: any
    close: any
    verticalNavPinned: any
    verticalNavUnPinned: any
    sectionTitlePlaceholder: any
  }
}

export interface AclProperties {
  action: Actions
  subject: Subjects
}

// 👉 Vertical nav section title
export interface NavSectionTitle extends Partial<AclProperties> {
  heading: string
}

// 👉 Vertical nav link
declare type ATagTargetAttrValues = '_blank' | '_self' | '_parent' | '_top' | 'framename'
declare type ATagRelAttrValues =
  | 'alternate'
  | 'author'
  | 'bookmark'
  | 'external'
  | 'help'
  | 'license'
  | 'next'
  | 'nofollow'
  | 'noopener'
  | 'noreferrer'
  | 'prev'
  | 'search'
  | 'tag'

export interface NavLinkProps {
  to?: RouteLocationRaw | string | null
  href?: string
  target?: ATagTargetAttrValues
  rel?: ATagRelAttrValues
}

export interface NavLink extends NavLinkProps, Partial<AclProperties> {
  title: string
  icon?: { icon: string }
  badgeContent?: string
  badgeClass?: string
  disable?: boolean
}

// 👉 Vertical nav group
export interface NavGroup extends Partial<AclProperties> {
  title: string
  icon?: { icon: string }
  badgeContent?: string
  badgeClass?: string
  children: HorizontalNavItem[]
  disable?: boolean
}

export declare type HorizontalNavItem = NavLink | NavGroup

export declare type VerticalNavItem = HorizontalNavItem | NavSectionTitle

export enum NavGroupType {
  POPULAR,
  APP,
  SETTINGS,
}

// 👉 Components ========================

export interface I18nLanguage {
  label: string
  i18nLang: string
  isRTL: boolean
}

// avatar | text | icon
// Thanks: https://stackoverflow.com/a/60617060/10796681
export type Notification = {
  id: number
  title: string
  subtitle: string
  time: string
  color?: string
  isSeen: boolean
} & (
  | { img: string, text?: never, icon?: never }
  | { img?: never, text: string, icon?: never }
  | { img?: never, text?: never, icon: string }
)

export interface ThemeSwitcherTheme {
  name: string
  icon: string
}
