<script setup>
const { fetchCreditPackages } = useApiProduct()
const { checkout } = useApiPayment()
const { fetchCredit } = useApiCredit()

const { t } = useI18n()
const router = useRouter()

const dialog = ref(false)

const { data } = await useAsyncData('creditPackages', () => fetchCreditPackages())
const { data: userCredit } = await useAsyncData('userCredits', () => fetchCredit())

const creditPackages = computed(() => data?.value?.data?.map(item => ({
  label: `${item.title} - ${item.amount} ${t('credits')} (${item.price} ${t('VND')})`,
  value: item.id,
})))

const selectedPackage = ref(creditPackages.value?.[1]?.value)

async function handleTopup() {
  if (!selectedPackage.value) {
    return
  }

  try {
    const { data } = await checkout('sepay', `credit:${selectedPackage.value}`)
    router.push(`/checkout?qr=${encodeURIComponent(data.paymentUrl)}&${data.paymentUrl.split('img?')[1]}`)
  }
  catch (error) {
    console.error(error)
  }
  dialog.value = false
}
</script>

<template>
  <div class="w-full">
    <VCard>
      <VCardText>
        <div>
          <p class="text-h6">
            {{ $t('Payment Information') }}
          </p>
          <p class="text-body-2">
            {{ $t('Please manage your payment information to ensure your service is not interrupted.') }}
          </p>
        </div>

        <div class="border pa-4 rounded-lg mt-4">
          <div class="d-flex flex-column gap-4">
            <div class="d-flex flex-column gap-2">
              <p class="text-body-3 font-weight-bold text-primary">
                {{ $t('Credits available') }}: {{ userCredit?.data?.credit }}
              </p>
              <p class="text-body-2">
                {{ $t('We will notify you if your credit is running low.') }}
              </p>

              <VCol cols="2" class="pa-0">
                <VBtn @click="dialog = true">
                  {{ $t('Topup Credits') }}
                </VBtn>
              </VCol>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Topup Modal -->
    <VDialog v-model="dialog" max-width="400">
      <VCard>
        <VCardTitle>
          {{ $t('Topup Credits') }}
        </VCardTitle>
        <VCardText>
          <VSelect
            v-model="selectedPackage"
            :items="creditPackages"
            item-title="label"
            item-value="value"
            :label="$t('Select a credit package')"
            variant="outlined"
            density="comfortable"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="primary"
            :disabled="!selectedPackage"
            @click="handleTopup"
          >
            {{ $t('Topup Now') }}
          </VBtn>
          <VBtn
            variant="text"
            color="secondary"
            @click="dialog = false"
          >
            {{ $t('Cancel') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
