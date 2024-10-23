import type { AppContext } from 'vue'

export interface LoadingServiceProps {
  closeOnHashChange?: boolean
  container?: string
}

/** Options used in LoadingService */
export interface LoadingServiceOptions {
  closeOnHashChange?: boolean
}

export type LoadingServiceShortcutMethod =
((
  options?: LoadingServiceOptions,
  appContext?: AppContext | null
) => Promise<void>)

export interface ILoadingService {
  _context: AppContext | null

  /** Show a loading */
  // (loading: string, title?: string, type?: string): Promise<LoadingServiceData>

  /** Show a loading */
  (
    options?: LoadingServiceOptions,
    appContext?: AppContext | null
  ): Promise<void>

  /** Close current loading */
  close: () => void
}
