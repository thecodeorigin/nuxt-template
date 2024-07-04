import type { LiteralUnion, ValueOf } from 'type-fest'
import type { Skins } from './enums'
import type { I18nLanguage, LayoutConfig } from '@layouts/types'

interface ExplicitThemeConfig {
  app: {
    i18n: {
      defaultLocale: string
      langConfig: I18nLanguage[]
    }
    theme: LiteralUnion<'light' | 'dark' | 'system', string>
    skin: ValueOf<typeof Skins>
  }
  verticalNav: {
    isVerticalNavSemiDark: boolean
  }
}

export type UserThemeConfig = LayoutConfig & ExplicitThemeConfig

// SECTION Custom Input
export interface CustomInputContent {
  title: string
  desc?: string
  value: string
  subtitle?: string
  icon?: string
  images?: string
}

export interface GridColumn {
  cols?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  xxl?: string
}

// Data table
export interface SortItem { key: string; order?: boolean | 'asc' | 'desc' }

export interface Options {
  page: number
  itemsPerPage: number
  sortBy: readonly SortItem[]
  groupBy: readonly SortItem[]
  search: string | undefined
}
