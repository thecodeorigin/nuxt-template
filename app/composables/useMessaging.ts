import { getMessaging } from 'firebase/messaging'
import { useFirebaseApp } from 'vuefire'

export function useMessaging() {
  return getMessaging(useFirebaseApp())
}
