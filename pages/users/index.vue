<template>
  <div>
    {{ $t('This is the users page!') }}
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'UserPage',

  head() {
    return {
      title: this.$t('User page'),
    };
  },
});
</script>

<i18n lang="yaml">
vi:
  User page: Trang người dùng
  This is the users page!: Đây là trang người dùng!
</i18n>
