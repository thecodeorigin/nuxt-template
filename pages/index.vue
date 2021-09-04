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
    <div v-for="project in projects" :key="project.id">
      {{ project.title }}
    </div>
  </div>
</template>

<script lang="ts">
import { useProjectService } from '@/services/project';
import {
  defineComponent,
  onBeforeMount,
  ref,
  useContext,
  useFetch,
} from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const { $axios } = useContext();
    const projects = ref([]);

    const projectService = useProjectService({ $axios });

    const { fetch: fetchProjects } = useFetch(async () => {
      try {
        const res = await projectService.getProjects();
        projects.value = res.data.items;
      } catch (err) {}
    });

    onBeforeMount(() => {
      fetchProjects();
    });

    return {
      projects,
    };
  },

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
