/**
 * global type definitions
 * using the typescript interface, you can define the i18n resources that is type-safed!
 */

/**
 * you need to import the some interfaces
 */
import 'vue-i18n'

type LocaleMessage = typeof en

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends LocaleMessage {
  }
}
