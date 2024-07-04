<script setup lang="ts">
interface Props {
  statusCode?: string | number
  title?: string
  description?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="text-center mb-4">
    <!-- 👉 Title and subtitle -->
    <h1
      v-if="props.statusCode"
      class="error-title mb-2"
    >
      {{ props.statusCode }}
    </h1>

    <h4
      v-if="props.title"
      class="text-h4 mb-2"
    >
      {{ props.title }}
    </h4>

    <p
      v-if="props.description"
      class="mb-0 text-body-1"
    >
      {{ props.description }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.error-title {
  font-size: clamp(3rem, 5vw, 6rem);
  font-weight: 500;
  line-height: clamp(3rem, 5vw, 6rem);
}
</style>
