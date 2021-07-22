import Vue from 'vue';

export default {
  SET_LOCALE(state, locale) {
    Vue.set(state, 'locale', locale);
  },
};
