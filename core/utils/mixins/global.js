// Global mixin
export default {
  methods: {
    /**
     * To evaluate a parameter in <template>
     * @param {string} evalString Example: something?.somethingElse
     * @returns {any} Return evaluated param?.something?.somethingElse
     */
    $e(evalString) {
      if (/^([a-zA-Z0-9[\].?])*$/g.test(evalString)) {
        // eslint-disable-next-line no-eval
        return eval('this.' + evalString);
      } else {
        return null;
      }
    },
  },
};
