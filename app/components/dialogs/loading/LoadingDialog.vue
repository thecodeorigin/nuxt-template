<script setup lang="ts">
import type { LoadingServiceProps } from './loading-dialog'

const props = withDefaults(
  defineProps<LoadingServiceProps>(),
  {
    closeOnHashChange: true,
  },
)

defineEmits(['vanish'])

const visible = ref(false)

onMounted(async () => {
  await nextTick()
  if (props.closeOnHashChange) {
    window.addEventListener('hashchange', hide)
  }
})

onBeforeUnmount(() => {
  if (props.closeOnHashChange) {
    window.removeEventListener('hashchange', hide)
  }
})

function hide() {
  visible.value = false
}

function setVisible(value: boolean) {
  visible.value = value
}

defineExpose({
  setVisible,
  hide,
})
</script>

<template>
  <VDialog
    :model-value="visible"
    persistent
    width="300"
  >
    <VCard
      color="primary"
      width="300"
    >
      <VCardText class="pt-3 text-white">
        {{ $t('Please stand by') }}
        <VProgressLinear
          indeterminate
          class="mt-4"
          color="#fff"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>
