import { getMessaging } from 'firebase/messaging'
import { useFirebaseApp } from 'vuefire'

export function useFirebaseMessaging() {
  return getMessaging(useFirebaseApp())
}
