<script setup lang="ts">
const props = defineProps<{
  title: string
}>()

defineEmits<{
  (e: 'cancel', el: MouseEvent): void
}>()
</script>

<template>
  <div class="pa-5 d-flex align-center">
    <h5 class="text-h5">
      {{ props.title }}
    </h5>
    <VSpacer />

    <slot name="beforeClose" />

    <IconBtn
      class="text-medium-emphasis ms-1"
      size="x-small"
      @click="$emit('cancel', $event)"
    >
      <VIcon
        size="24"
        icon="ri-close-line"
      />
    </IconBtn>
  </div>
</template>
