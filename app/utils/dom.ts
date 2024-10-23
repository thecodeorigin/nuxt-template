import { isElement, isString } from 'lodash-es'

export function getAppendToElement(appendTo?: string | HTMLElement) {
  let _appendTo: HTMLElement | null = document.body

  if (appendTo) {
    if (isString(appendTo))
      _appendTo = document.querySelector<HTMLElement>(appendTo)
    else if (isElement(appendTo))
      _appendTo = appendTo as HTMLElement

    // should fallback to default value with a warning
    if (!isElement(appendTo)) {
      console.warn(
        'ConfirmationService',
        'the appendTo option is not an HTMLElement. Falling back to document.body.',
      )

      _appendTo = document.body
    }
  }

  return _appendTo
}
