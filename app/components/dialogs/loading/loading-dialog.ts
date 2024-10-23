import type { AppContext } from 'vue'

export interface ConfirmationServiceProps {
  closeOnHashChange?: boolean
  container?: string
}

/** Options used in ConfirmationService */
export interface ConfirmationServiceOptions {
  closeOnHashChange?: boolean
}

export type ConfirmationServiceShortcutMethod =
((
  options?: ConfirmationServiceOptions,
  appContext?: AppContext | null
) => Promise<void>)

export interface IConfirmationService {
  _context: AppContext | null

  /** Show a confirmation */
  // (confirmation: string, title?: string, type?: string): Promise<ConfirmationServiceData>

  /** Show a confirmation */
  (
    options?: ConfirmationServiceOptions,
    appContext?: AppContext | null
  ): Promise<void>

  /** Close current confirmation */
  close: () => void
}
