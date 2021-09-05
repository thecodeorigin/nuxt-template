<template>
  <div>
    {{ $t('This is the projects page!') }}
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'ProjectPage',

  head() {
    return {
      title: this.$t('Project page'),
    };
  },
});
</script>

<i18n lang="yaml">
vi:
  Project page: Trang sản phẩm
  This is the projects page!: Đây là trang dự án!
</i18n>
