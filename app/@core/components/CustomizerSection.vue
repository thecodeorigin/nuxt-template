<script setup lang="ts">
interface Props {
  title: string
  divider?: boolean
}

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<Props>(), {
  divider: true,
})
</script>

<template>
  <VDivider v-if="props.divider" />
  <div
    class="customizer-section"
    v-bind="$attrs"
  >
    <div>
      <VChip
        label
        size="small"
        color="primary"
        rounded="sm"
      >
        {{ props.title }}
      </VChip>
    </div>
    <slot />
  </div>
</template>
