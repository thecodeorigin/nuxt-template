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
        {{ $t('changeLocale') }}
      </el-button>

      <el-button
        v-else
        key="vi-button"
        size="mini"
        type="danger"
        @click="$i18n.setLocale('en')"
      >
        {{ $t('changeLocale') }}
      </el-button>
    </transition>
    <div>
      <span class="text-primary-300"> {{ $t('hello') }}</span>
      <span class="text-warning-700">{{ $t('hello') }}</span>
    </div>
    <ExampleBase />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'IndexPage',
});
</script>

<style lang="scss" module>
.abc {
  color: $--color-red;
}
</style>

<i18n lang="yaml">
en:
  hello: hello world!
  changeLocale: Change language
vi:
  hello: Xin chào thế giới!
  changeLocale: Đổi ngôn ngữ
</i18n>
