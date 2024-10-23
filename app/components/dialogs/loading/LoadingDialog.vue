<script setup lang="ts">
import type { ConfirmationServiceProps } from './loading-dialog'

const props = withDefaults(
  defineProps<ConfirmationServiceProps>(),
  {
    closeOnHashChange: true,
  },
)

defineEmits(['vanish'])

const visible = ref(false)

onMounted(async () => {
  await nextTick()
  if (props.closeOnHashChange) {
    window.addEventListener('hashchange', doClose)
  }
})

onBeforeUnmount(() => {
  if (props.closeOnHashChange) {
    window.removeEventListener('hashchange', doClose)
  }
})

function doClose() {
  if (!visible.value)
    return

  visible.value = false
}

function setVisible(value: boolean) {
  visible.value = value
}

defineExpose({
  setVisible,
  doClose,
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
