<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value: string) => {
      return value.startsWith('Icon')
    },
  },
})

const icon = defineAsyncComponent(() => import(`@base/assets/svg/${props.name}.svg`))
</script>

<template>
  <component :is="icon" />
</template>
