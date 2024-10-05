import type { OffsetOptions } from '@floating-ui/dom'
import type { RouteLocationRaw, RouteRecordNormalized } from 'vue-router'
import type { AppContentLayoutNav, ContentWidth, FooterType, HorizontalNavType, NavbarType } from '@base/@layouts/enums'
import type { Component } from 'vue'
import type { Actions, Subjects } from '@base/utils/casl'

export interface LayoutConfig {
  app: {
    title: Lowercase<string>
    logo: VNode
    contentWidth: typeof ContentWidth[keyof typeof ContentWidth]
    contentLayoutNav: typeof AppContentLayoutNav[keyof typeof AppContentLayoutNav]
    overlayNavFromBreakpoint: number

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

// 👉 Vertical nav group
export interface NavItem extends Partial<AclProperties> {
  order?: number
  title: string
  heading?: string
  icon?: { icon: string }
  badgeContent?: string
  badgeClass?: string
  children?: NavItem[]
  disable?: boolean
  to?: RouteLocationRaw
  href?: string
  target?: ATagTargetAttrValues
  rel?: ATagRelAttrValues
  group?: NavGroupType
}

export enum NavGroupType {
  POPULAR,
  APP,
  SETTINGS,
}

// 👉 Components ========================

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
  data?: string
}
