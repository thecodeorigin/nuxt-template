<template>
  <div>
    <div>{{ $t('This is the project page wrapper') }}</div>
    {{ $store.state.project.count }}
    <nuxt-child />
  </div>
</template>

<script>
import { projectStore } from '@/store-lazy/project';
import {
  defineComponent,
  onMounted,
  onUnmounted,
  useStore,
} from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const store = useStore();

    store.registerModule('project', projectStore);

    onMounted(() => {
      try {
        store.dispatch('project/getMany');
      } catch (e) {
        console.error(e);
      }
    });

    onUnmounted(() => store.unregisterModule('project'));

    return {};
  },
});
</script>

<i18n lang="yaml">
vi:
  This is the project page wrapper: Đây là layout bọc ngoài trang dự án
</i18n>
