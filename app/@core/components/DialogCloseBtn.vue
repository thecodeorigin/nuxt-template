<script setup lang="ts">
interface Props {
  icon?: string
  iconSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'ri-close-line',
  iconSize: '22',
})
</script>

<template>
  <IconBtn class="v-dialog-close-btn">
    <VIcon
      :icon="props.icon"
      :size="props.iconSize"
    />
  </IconBtn>
</template>
