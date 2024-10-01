import { en, vi } from 'vuetify/locale'

export default defineI18nConfig(() => ({
  legacy: false,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  messages: {
    en: { $vuetify: en },
    vi: { $vuetify: vi },
  },
}))
