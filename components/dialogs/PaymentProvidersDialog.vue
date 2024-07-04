<script setup lang="ts">
import americanExDark from '@images/icons/payments/img/ae-dark.png'
import americanExLight from '@images/icons/payments/img/american-express.png'
import dcDark from '@images/icons/payments/img/dc-dark.png'
import dcLight from '@images/icons/payments/img/dc-light.png'
import jcbDark from '@images/icons/payments/img/jcb-dark.png'
import jcbLight from '@images/icons/payments/img/jcb-light.png'
import masterCardDark from '@images/icons/payments/img/master-dark.png'
import masterCardLight from '@images/icons/payments/img/mastercard.png'
import visaDark from '@images/icons/payments/img/visa-dark.png'
import visaLight from '@images/icons/payments/img/visa-light.png'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const visa = useGenerateImageVariant(visaLight, visaDark)
const masterCard = useGenerateImageVariant(masterCardLight, masterCardDark)
const americanEx = useGenerateImageVariant(americanExLight, americanExDark)
const jcb = useGenerateImageVariant(jcbLight, jcbDark)
const dc = useGenerateImageVariant(dcLight, dcDark)

interface Props {
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
}

const dialogVisibleUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const paymentProvidersData = [
  {
    title: 'Adyen',
    providers: [visa, masterCard, americanEx, jcb, dc],
  },
  {
    title: '2Checkout',
    providers: [visa, americanEx, jcb, dc],
  },
  {
    title: 'Airpay',
    providers: [visa, americanEx, masterCard, jcb],
  },
  {
    title: 'Authorize.net',
    providers: [americanEx, jcb, dc],
  },
  {
    title: 'Bambora',
    providers: [masterCard, americanEx, jcb],
  },
  {
    title: 'Bambora',
    providers: [visa, masterCard, americanEx, jcb, dc],
  },
  {
    title: 'Chase Paymentech (Orbital)',
    providers: [visa, americanEx, jcb, dc],
  },
  {
    title: 'Checkout.com',
    providers: [visa, masterCard],
  },
]
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="900"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pt-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2">
            Select Payment Providers
          </h4>
          <p class="text-sm-body-1 text-center">
            Third-party payment providers
          </p>
        </div>

        <div
          v-for="(item, index) in paymentProvidersData"
          :key="index"
        >
          <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center align-start gap-4 flex-wrap py-4">
            <div class="text-high-emphasis font-weight-medium">
              {{ item.title }}
            </div>
            <div class="d-flex gap-x-4 gap-y-2 flex-wrap">
              <img
                v-for="(img, iterator) in item.providers"
                :key="iterator"
                :src="img.value"
                height="30"
                width="50"
              >
            </div>
          </div>
          <VDivider v-show="index !== paymentProvidersData.length - 1" />
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.refer-link-input {
  .v-field--appended {
    padding-inline-end: 0;
  }

  .v-field__append-inner {
    padding-block-start: 0.125rem;
  }
}
</style>
