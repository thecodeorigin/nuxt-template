import dev from '@utils/functions/dev';

const i18nPlugin = async({ store, app }) => {
  // beforeLanguageSwitch called right before setting a new locale
  app.i18n.onBeforeLanguageSwitch = (_, newLocale) => {
    store.commit('SET_LOCALE', newLocale);
  };
  // set default locale from store (Cookie)
  if (store.getters.locale) {
    await app.i18n.setLocale(store.getters.locale);
  }
  // onLanguageSwitched called right after a new locale has been set
  app.i18n.onLanguageSwitched = (oldLocale, newLocale) => {
    dev.log(oldLocale, newLocale);
  };
};

export default i18nPlugin;
