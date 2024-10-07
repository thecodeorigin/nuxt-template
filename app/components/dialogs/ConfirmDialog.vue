<script setup lang="ts">
defineProps<{
  message: string
}>()

const emit = defineEmits<{
  (e: 'confirm', value: boolean): void
}>()

const modelValue = defineModel('modelValue', {
  type: Boolean,
  default: false,
})

function handleConfirm() {
  emit('confirm', true)

  modelValue.value = false
}

function handleCancel() {
  emit('confirm', false)

  modelValue.value = false
}
</script>

<template>
  <!-- 👉 Confirm Dialog -->
  <VDialog
    v-model="modelValue"
    max-width="500"
  >
    <VCard class="text-center px-10 py-6">
      <VCardText>
        <VBtn
          icon
          variant="outlined"
          color="warning"
          class="my-4"
          size="x-large"
        >
          <span class="text-4xl">!</span>
        </VBtn>

        <h6 class="text-lg font-weight-medium">
          {{ message }}
        </h6>
      </VCardText>

      <VCardText class="d-flex align-center justify-center gap-4">
        <VBtn
          variant="elevated"
          @click="handleConfirm"
        >
          {{ $t('Confirm') }}
        </VBtn>

        <VBtn
          color="secondary"
          variant="outlined"
          @click="handleCancel"
        >
          {{ $t('Cancel') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
