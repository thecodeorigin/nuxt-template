<template>
  <div :class="$style.abc">
    <transition name="slide-fade" mode="out-in">
      <el-button
        v-if="$store.getters.locale === 'en'"
        key="en-button"
        size="mini"
        type="primary"
        @click="$i18n.setLocale('vi')"
      >
        {{ $t('Change language') }}
      </el-button>
      <el-button
        v-else
        key="vi-button"
        size="mini"
        type="danger"
        @click="$i18n.setLocale('en')"
      >
        {{ $t('Change language') }}
      </el-button>
    </transition>
    <div>
      <span class="text-primary-300"> {{ $t('Hello world!') }}</span>
      <span class="text-warning-700">{{ $t('Hello world!') }}</span>
    </div>
    <ExampleBase />
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'IndexPage',

  head() {
    return {
      title: this.$t('Home page'),
    };
  },
});
</script>

<style lang="scss" module>
.abc {
  color: $--color-red;
}
</style>

<i18n lang="yaml">
vi:
  Home page: Trang chủ
  Hello world!: Xin chào thế giới!
  Change language: Đổi ngôn ngữ
</i18n>
