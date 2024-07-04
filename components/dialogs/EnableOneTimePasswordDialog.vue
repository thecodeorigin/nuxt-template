<script setup lang="ts">
interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'submit', value: string): void
}
interface Props {
  mobileNumber?: string
  isDialogVisible: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const phoneNumber = ref(structuredClone(toRaw(props.mobileNumber)))

const formSubmit = () => {
  if (phoneNumber.value) {
    emit('submit', phoneNumber.value)
    emit('update:isDialogVisible', false)
  }
}

const resetPhoneNumber = () => {
  phoneNumber.value = structuredClone(toRaw(props.mobileNumber))
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <VDialog
    max-width="900"
    :model-value="props.isDialogVisible"
    @update:model-value="(val) => $emit('update:isDialogVisible', val)"
  >
    <VCard class="pa-5 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="resetPhoneNumber"
      />

      <VCardText class="pt-5">
        <div class="mb-6">
          <h5 class="text-h5 mb-2">
            Verify Your Mobile Number for SMS
          </h5>

          <div>
            Enter your mobile phone number with country code and  we will send you a verification code.
          </div>
        </div>
        <VForm @submit.prevent="() => {}">
          <VTextField
            v-model="phoneNumber"
            name="mobile"
            label="Mobile Number"
            placeholder="+1 123 456 7890"
            class="mb-6"
          />

          <div class="d-flex flex-wrap justify-end gap-3">
            <VBtn
              color="secondary"
              variant="outlined"
              @click="resetPhoneNumber"
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
