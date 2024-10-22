import type { AppContext } from 'vue'

type DoneFn = (cancel?: boolean) => void
export type ConfirmationBeforeCloseFn = (done: DoneFn) => void

export interface ConfirmationProps {
  title?: string
  type?: 'primary' | 'danger'
  fullscreen?: boolean
  beforeClose?: ConfirmationBeforeCloseFn
}

export const confirmationProps = {
  type: 'primary' as const,
  fullscreen: false,
}

export type Action = 'confirm' | 'cancel'
export type ConfirmationServiceType = '' | 'prompt' | 'alert' | 'confirm'
export type ConfirmationServiceData = Action

export type ConfirmationServiceProps = ConfirmationProps & {
  closeOnHashChange?: boolean
  container?: string
  body?: string
  dangerouslyUseHTMLString?: boolean
  callback?: null | Callback
}

export type Callback =
  | ((value: string, action: Action) => any)
  | ((action: Action) => any)

/** Options used in ConfirmationService */
export type ConfirmationServiceOptions = ConfirmationProps & {
  closeOnHashChange?: boolean
  dangerouslyUseHTMLString?: boolean
  title?: string | ConfirmationServiceOptions
  body?: string | VNode | (() => VNode)
  callback?: Callback
}

export type ConfirmationServiceShortcutMethod = ((
  body: ConfirmationServiceOptions['body'],
  options?: ConfirmationServiceOptions,
  appContext?: AppContext | null
) => Promise<ConfirmationServiceData>) &
((
  body: ConfirmationServiceOptions['body'],
  title: ConfirmationServiceOptions['title'],
  options?: ConfirmationServiceOptions,
  appContext?: AppContext | null
) => Promise<ConfirmationServiceData>)

export interface IConfirmationService {
  _context: AppContext | null

  /** Show a confirmation */
  // (confirmation: string, title?: string, type?: string): Promise<ConfirmationServiceData>

  /** Show a confirmation */
  (
    options: ConfirmationServiceOptions,
    appContext?: AppContext | null
  ): Promise<ConfirmationServiceData>

  /** Show a alert confirmation */
  alert: ConfirmationServiceShortcutMethod

  /** Show a confirm confirmation */
  confirm: ConfirmationServiceShortcutMethod

  /** Close current confirmation */
  close: () => void
}
