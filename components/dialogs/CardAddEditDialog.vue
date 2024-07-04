<script setup lang="ts">
interface Details {
  number: string
  name: string
  expiry: string
  cvv: string
  isPrimary: boolean
  type: string
}
interface Emit {
  (e: 'submit', value: Details): void
  (e: 'update:isDialogVisible', value: boolean): void
}

interface Props {
  cardDetails?: Details
  isDialogVisible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cardDetails: () => ({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    isPrimary: false,
    type: '',
  }),
})

const emit = defineEmits<Emit>()

const cardDetails = ref<Details>(structuredClone(toRaw(props.cardDetails)))

watch(() => props, () => {
  cardDetails.value = structuredClone(toRaw(props.cardDetails))
})

const formSubmit = () => {
  emit('submit', cardDetails.value)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="props.isDialogVisible"
    @update:model-value="val => $emit('update:isDialogVisible', val)"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="$emit('update:isDialogVisible', false)"
      />

      <VCardText class="pt-5">
        <!-- 👉 Title -->
        <div class="text-center mb-6">
          <h4 class="text-h4 mb-2">
            {{ props.cardDetails.name ? 'Edit Card' : 'Add New Card' }}
          </h4>
          <div class="text-body-1">
            {{ props.cardDetails.name ? 'Edit your saved card details' : 'Add your saved card details' }}
          </div>
        </div>

        <VForm @submit.prevent="() => {}">
          <VRow>
            <!-- 👉 Card Number -->
            <VCol cols="12">
              <VTextField
                v-model="cardDetails.number"
                label="Card Number"
                placeholder="1234 1234 1234 1234"
              />
            </VCol>

            <!-- 👉 Card Name -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="cardDetails.name"
                label="Name"
                placeholder="John Doe"
              />
            </VCol>

            <!-- 👉 Card Expiry -->
            <VCol
              cols="6"
              md="3"
            >
              <VTextField
                v-model="cardDetails.expiry"
                label="Expiry"
                placeholder="MM/YY"
              />
            </VCol>

            <!-- 👉 Card CVV -->
            <VCol
              cols="6"
              md="3"
            >
              <VTextField
                v-model="cardDetails.cvv"
                type="number"
                label="CVV"
                placeholder="123"
              />
            </VCol>

            <!-- 👉 Card Primary Set -->
            <VCol cols="12">
              <VSwitch
                v-model="cardDetails.isPrimary"
                label="Save Card for future billing?"
              />
            </VCol>

            <!-- 👉 Card actions -->
            <VCol
              cols="12"
              class="text-center"
            >
              <VBtn
                class="me-4"
                type="submit"
                @click="formSubmit"
              >
                Submit
              </VBtn>
              <VBtn
                color="secondary"
                variant="outlined"
                @click="$emit('update:isDialogVisible', false)"
              >
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
