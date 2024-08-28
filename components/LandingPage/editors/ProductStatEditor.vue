<script lang="ts" setup>
import { VIcon } from 'vuetify/components'
import type { IconList, ProductStatType } from '@/types/landing-page'

const { productStatsData } = storeToRefs(useLandingPageStore())
const productStatForm = ref<ProductStatType[]>([
  {
    id: '',
    title: '',
    value: 0,
    color: '',
    icon: null,
  },
])
const isLoading = ref(false)

const iconList: IconList[] = ['Time Line', 'Home', 'Settings', 'User', 'Calendar', 'Search', 'Notification', 'Camera', 'Shopping Cart', 'Heart', 'Layout', 'User Smile']

function populateProductStatForm() {
  if (productStatsData.value?.product_stats) {
    productStatForm.value = [...productStatsData.value.product_stats]
  }
}

function handleAddProductStat() {
  productStatForm.value.push({ id: crypto.randomUUID(), title: '', value: 0, color: 'primary', icon: null })
}

const isCurrentStatValid = computed(() => {
  if (productStatForm.value.length === 0) {
    return false
  }

  const currentStat = productStatForm.value[productStatForm.value.length - 1]

  return currentStat && currentStat.title.trim() !== ''
    && currentStat.icon !== null
})

async function onSubmit() {
  try {
    isLoading.value = true
    const res = await $api('/api/pages/landing-page/stat', {
      method: 'PATCH',
      body: productStatForm.value,
    })

    if (res.success) {
      notify('Successfully updated', {
        type: 'success',
        timeout: 3000,
      })
    }
  }
  catch (error) {
    console.log('Unexpected error: ', error)
    notify(error as string, {
      type: 'error',
      timeout: 3000,
    })
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  populateProductStatForm()
})

watch(productStatsData, () => {
  populateProductStatForm()
})
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <div class="d-flex mb-4">
      <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4 d-block label">
        Product Stats Section
      </VLabel>

      <VSpacer />

      <VBtn
        class="text-capitalize"
        type="submit"
        color="primary"
        variant="outlined"
        :disabled="!isCurrentStatValid"
        @click="handleAddProductStat"
      >
        Add +
      </VBtn>
    </div>
    <VCard v-for="(stat, index) in productStatForm" :key="index" cols="12" sm="12" class="pa-4 mb-4">
      <VRow>
        <VCol cols="12" class="d-flex align-center">
          <VLabel
            :text="index <= 9 ? `0${index + 1}` : index + 1"
          />

          <VSpacer />

          <VBtn
            icon
            variant="text"
            color="error"
            @click="productStatForm.splice(index, 1)"
          >
            <VIcon icon="ri-close-circle-line" />
          </VBtn>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VTextField
            v-model="stat.title"
            placeholder="Text here..."
            label=" Product stat title"
          />
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VSelect
            v-model="stat.icon"
            label="Icon"
            :items="iconList"
          />
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VTextField
            v-model="stat.value"
            type="number"
            placeholder="Text here..."
            label="Product stat value"
          />
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VSelect
            v-model="stat.color"
            label="Icon color"
            :items="['primary', 'secondary', 'accent', 'error', 'warning', 'info', 'success']"
          />
        </VCol>
      </VRow>
    </VCard>

    <VBtn
      v-if="isLoading === false"
      class="w-100"
      type="submit"
      color="primary"
      variant="outlined"
      :disabled="!isCurrentStatValid"
      @click="onSubmit"
    >
      Update Product Stats
    </VBtn>

    <VBtn
      v-else
      class="mx-auto w-100"
      type="submit"
      color="primary"
      variant="outlined"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="24"
      />
    </VBtn>
  </VForm>
</template>

<style lang="scss" scoped>
.label {
  line-height: 40px;
}

.remix-icon {
  font-size: 1.5rem;
  margin-right: 8px;
}
</style>
