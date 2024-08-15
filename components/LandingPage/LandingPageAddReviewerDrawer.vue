<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import type { CustomerReview, CustomerReviewSectionType, DrawerConfig } from '@/types/landing-page'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
}

const props = defineProps<{
  drawerConfig: DrawerConfig
}>()

const emit = defineEmits<Emit>()

const formRef = ref<VForm>()
const reviewerData = ref<CustomerReview>({
  id: '',
  desc: '',
  main_logo: '',
  logo_dark: '',
  logo_light: '',
  name: '',
  position: '',
  rating: 0,
})
const labelOptions = ['UX', 'Image', 'Code Review', 'Dashboard', 'Bug', 'Charts & maps']

function handleDrawerModelValueUpdate(val: boolean) {
  emit('update:isDrawerOpen', val)

  if (!val)
    formRef.value?.reset()
}

function checkActionSubmit() {
  formRef.value?.validate().then(async (valid) => {
    if (valid.valid) {
      if (props.drawerConfig.type === 'edit') {
        emit('update:isDrawerOpen', false)
      }
      emit('update:isDrawerOpen', false)
      await nextTick()
      formRef.value?.reset()
    }
  })
}

function updateReviewerData() {
  emit('update:isDrawerOpen', false)
}

// delete kanban item
function deleteKanbanItem() {
  emit('update:isDrawerOpen', false)
}

// 👉 label/chip color
const resolveLabelColor: any = {
  'UX': 'success',
  'Image': 'warning',
  'Code Review': 'info',
  'Dashboard': 'primary',
  'Bug': 'error',
  'Charts & maps': 'primary',
}

const users = [
  { img: avatar1, name: 'John Doe' },
  { img: avatar2, name: 'Jane Smith' },
  { img: avatar3, name: 'Robert Johnson' },
  { img: avatar4, name: 'Lucy Brown' },
  { img: avatar5, name: 'Mike White' },
  { img: avatar6, name: 'Anna Black' },
]

function handleImageUpdate(file: File | null) {
  console.log('««««« file »»»»»', file)
}

async function getReviewerData() {
  try {
    const res = await $api<CustomerReviewSectionType>(`/api/pages/landing-page/customer-review`)

    if (res.customer_review_data) {
      const found = res.customer_review_data.find((item: CustomerReview) => item.id === props.drawerConfig.reviewerId)
      reviewerData.value = found as CustomerReview
    }
  }
  catch (error) {
    console.log('««««« error »»»»»', error)
  }
}

watchEffect(() => {
  if (props.drawerConfig.type === 'edit' && props.drawerConfig.reviewerId) {
    getReviewerData()
  }
})
</script>

<template>
  <VNavigationDrawer
    location="end"
    :width="370"
    temporary
    border="0"
    :model-value="drawerConfig.isVisible"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Header -->
    <AppDrawerHeaderSection
      :title="drawerConfig.type === 'add' ? 'Add Reviewer' : 'Edit Reviewer'"
      @cancel="$emit('update:isDrawerOpen', false)"
    />
    <VDivider />

    <PerfectScrollbar
      :options="{ wheelPropagation: false }"
      style="block-size: calc(100vh - 4rem);"
    >
      <VForm
        v-if="drawerConfig.isVisible"
        ref="formRef"
        @submit.prevent="checkActionSubmit"
      >
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="reviewerData.name"
                label="Reviewer Name"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="reviewerData.position"
                label="Position"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" class="d-flex align-center gap-2">
              <VLabel class="label">
                Rating:
              </VLabel>
              <VRating v-model="reviewerData.rating" />
            </VCol>

            <VCol cols="12">
              <LandingPageImagePreview
                id="image"
                :model-value="reviewerData.main_logo"
                @update:model-value="handleImageUpdate"
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="reviewerData.desc"
                label="Comment"
                placeholder="Write a comment..."
                rows="5"
                textarea
              />
            </VCol>

            <VCol cols="12">
              <VBtn
                type="submit"
                class="me-3"
                @click="updateReviewerData"
              >
                Update
              </VBtn>
              <VBtn
                color="error"
                variant="outlined"
                @click="deleteKanbanItem"
              >
                Delete
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VForm>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<style lang="scss">
.assignee-select {
  .v-field__append-inner {
    .v-select__menu-icon {
      display: none;
    }
  }
}
.label {
    line-height: 20px;
  }
</style>
