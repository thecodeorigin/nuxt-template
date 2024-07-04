<script setup lang="ts">
import themeselectionQr from '@images/pages/themeselection-qr.png'

interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'submit', value: string): void
}
interface Props {
  authCode?: string
  isDialogVisible: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const authCode = ref(structuredClone(toRaw(props.authCode)))

const formSubmit = () => {
  if (authCode.value) {
    emit('submit', authCode.value)
    emit('update:isDialogVisible', false)
  }
}

const resetAuthCode = () => {
  authCode.value = structuredClone(toRaw(props.authCode))
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <VDialog
    max-width="900"
    :model-value="props.isDialogVisible"
    @update:model-value="(val) => $emit('update:isDialogVisible', val)"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="resetAuthCode"
      />

      <VCardText class="pt-5">
        <h4 class="text-h4 text-center mb-6">
          Add Authenticator App
        </h4>
        <h5 class="text-h5 font-weight-medium mb-2">
          Authenticator Apps
        </h5>

        <p class="mb-6">
          Using an authenticator app like Google Authenticator, Microsoft Authenticator, Authy, or 1Password, scan the QR code. It will generate a 6 digit code for you to enter below.
        </p>

        <div class="my-6">
          <VImg
            width="150"
            :src="themeselectionQr"
            class="mx-auto"
          />
        </div>

        <VAlert
          color="warning"
          variant="tonal"
          class="my-4"
        >
          <template #title>
            ASDLKNASDA9AHS678dGhASD78AB
          </template>
          If you're having trouble using the QR code, select manual entry on your app
        </VAlert>

        <VForm @submit.prevent="() => {}">
          <VTextField
            v-model="authCode"
            name="auth-code"
            label="Enter Authentication Code"
            placeholder="123 456"
            class="mb-6"
          />

          <div class="d-flex justify-end flex-wrap gap-4">
            <VBtn
              color="secondary"
              variant="outlined"
              @click="resetAuthCode"
            >
              Cancel
            </VBtn>

            <VBtn
              color="success"
              type="submit"
              @click="formSubmit"
            >
              Submit
              <VIcon
                end
                icon="ri-check-line"
                class="flip-in-rtl"
              />
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
