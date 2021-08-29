import Cookies from 'js-cookie';
import dev from '@utils/functions/dev';

const i18nPlugin = async({ store, app }) => {
  // set default locale from store (Cookie)
  if (store.getters.locale) {
    await app.i18n.setLocale(store.getters.locale);
  }
  // beforeLanguageSwitch called right before setting a new locale
  app.i18n.onBeforeLanguageSwitch = (oldLocale, newLocale) => {
    dev.log(oldLocale, newLocale);
  };
  // onLanguageSwitched called right after a new locale has been set
  app.i18n.onLanguageSwitched = (_, newLocale) => {
    store.commit('SET_LOCALE', newLocale);
    Cookies.set('lang', newLocale);
  };
};

export default i18nPlugin;
