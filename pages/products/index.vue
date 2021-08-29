<template>
  <div>
    {{ $t('This is the product page!') }}
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'ProductPage',

  head() {
    return {
      title: this.$t('Product page'),
    };
  },
});
</script>

<i18n lang="yaml">
vi:
  Product page: Trang sản phẩm
  This is the product page!: Đây là trang product!
</i18n>
