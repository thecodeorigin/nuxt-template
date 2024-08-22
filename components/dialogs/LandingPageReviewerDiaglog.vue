<script setup lang="ts">
type DialogType = 'warning' | 'info'

interface Props {
  isDialogVisible: boolean
  label: string
  title: string
  type: DialogType
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
  (e: 'confirm', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  isDialogVisible: false,
  label: 'Dialog label',
  title: 'Dialog title',
})

const emit = defineEmits<Emit>()

function dialogVisibleUpdate(val: boolean) {
  emit('update:isDialogVisible', val)
}

function onConfirmation() {
  emit('confirm', true)
  emit('update:isDialogVisible', false)
}

function oncancel() {
  emit('confirm', false)
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    :persistent="props.type === 'warning'"
    class="v-dialog-sm"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard :title="props.title">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        v-if="props.type !== 'warning'"
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText>
        {{ props.label }}
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-4">
        <VBtn
          color="error"
          @click="oncancel"
        >
          Cancel
        </VBtn>
        <VBtn
          color="success"
          @click="onConfirmation"
        >
          Confirm
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>

</style>
