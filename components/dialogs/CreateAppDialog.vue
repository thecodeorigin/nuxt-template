<script setup lang="ts">
import illustrationJohn from '@images/pages/illustration-john.png'

import angularIcon from '@images/icons/brands/angular.png'
import laravelIcon from '@images/icons/brands/laravel.png'
import reactIcon from '@images/icons/brands/react.png'
import vueIcon from '@images/icons/brands/vue.png'

import awsIcon from '@images/icons/brands/aws.png'
import firebaseIcon from '@images/icons/brands/firebase.png'
import mysqlIcon from '@images/icons/brands/mysql.png'

const props = defineProps<{
  isDialogVisible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isDialogVisible', val: boolean): void
  (e: 'updatedData', val: unknown): void
}>()

const currentStep = ref(0)

const createApp = [
  {
    icon: 'ri-file-text-line',
    title: 'DETAILS',
    subtitle: 'Enter Details',
  },
  {
    icon: 'ri-star-smile-line',
    title: 'FRAMEWORKS',
    subtitle: 'Select Framework',
  },
  {
    icon: 'ri-pie-chart-2-line',
    title: 'DATABASE',
    subtitle: 'Select Database',
  },
  {
    icon: 'ri-bank-card-line',
    title: 'BILLING',
    subtitle: 'Payment Details',
  },
  {
    icon: 'ri-check-double-line',
    title: 'SUBMIT',
    subtitle: 'submit',
  },
]

const categories = [
  {
    icon: 'ri-bar-chart-box-line',
    color: 'info',
    title: 'CRM Application',
    subtitle: 'Scales with any business',
    slug: 'crm-application',
  },
  {
    icon: 'ri-shopping-cart-line',
    color: 'success',
    title: 'Ecommerce Platforms',
    subtitle: 'Grow Your Business With App',
    slug: 'ecommerce-application',
  },
  {
    icon: 'ri-video-upload-line',
    color: 'error',
    title: 'Online Learning platform',
    subtitle: 'Start learning today',
    slug: 'online-learning-application',
  },
]

const frameworks = [
  {
    icon: reactIcon,
    color: 'info',
    title: 'React Native',
    subtitle: 'Create truly native apps',
    slug: 'react-framework',
  },
  {
    icon: angularIcon,
    color: 'error',
    title: 'Angular',
    subtitle: 'Most suited for your application',
    slug: 'angular-framework',
  },
  {
    icon: vueIcon,
    color: 'success',
    title: 'Vue',
    subtitle: 'Progressive Framework',
    slug: 'vue-framework',
  },
  {
    icon: laravelIcon,
    color: 'warning',
    title: 'Laravel',
    subtitle: 'PHP web frameworks',
    slug: 'laravel-framework',
  },
]

const databases = [
  {
    icon: firebaseIcon,
    color: 'warning',
    title: 'Firebase',
    subtitle: 'Cloud Firestore',
    slug: 'firebase-database',
  },
  {
    icon: awsIcon,
    color: 'secondary',
    title: 'AWS',
    subtitle: 'Amazon Fast NoSQL Database',
    slug: 'aws-database',
  },
  {
    icon: mysqlIcon,
    color: 'info',
    title: 'MySQL',
    subtitle: 'Basic MySQL database',
    slug: 'mysql-database',
  },
]

const createAppData = ref({
  category: 'crm-application',
  framework: 'vue-framework',
  database: 'firebase-database',
  cardNumber: null,
  cardName: '',
  cardExpiry: '',
  cardCvv: '',
  isSave: false,
})

const dialogVisibleUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
  currentStep.value = 0
}

watch(() => props, () => {
  if (!props.isDialogVisible)
    currentStep.value = 0
})

const onSubmit = () => {
  // eslint-disable-next-line no-alert
  alert('submitted...!!')
  emit('updatedData', createAppData.value)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="900"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="create-app-dialog pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pt-5">
        <div class="text-center mb-6">
          <h4 class="text-h4 text-center mb-2">
            Create App
          </h4>
          <div class="text-body-1">
            Provide data with this form to create your app.
          </div>
        </div>

        <VRow>
          <VCol
            cols="12"
            sm="4"
          >
            <AppStepper
              v-model:current-step="currentStep"
              direction="vertical"
              :items="createApp"
              icon-size="24"
              class="stepper-icon-step-bg"
            />
          </VCol>

          <VCol
            cols="12"
            sm="8"
          >
            <VWindow
              v-model="currentStep"
              class="disable-tab-transition stepper-content"
            >
              <!-- 👉 category -->
              <VWindowItem>
                <VTextField
                  label="Application Name"
                  placeholder="myRider"
                />

                <h5 class="text-h5 mb-4 mt-6">
                  Category
                </h5>
                <VRadioGroup v-model="createAppData.category">
                  <VList class="card-list">
                    <VListItem
                      v-for="category in categories"
                      :key="category.title"
                      @click="createAppData.category = category.slug"
                    >
                      <template #prepend>
                        <VAvatar
                          size="46"
                          rounded
                          variant="tonal"
                          :color="category.color"
                          class="me-1"
                        >
                          <VIcon
                            :icon="category.icon"
                            size="30"
                          />
                        </VAvatar>
                      </template>

                      <VListItemTitle class="font-weight-medium mb-1">
                        {{ category.title }}
                      </VListItemTitle>
                      <VListItemSubtitle class="text-body-2 me-2">
                        {{ category.subtitle }}
                      </VListItemSubtitle>

                      <template #append>
                        <VRadio :value="category.slug" />
                      </template>
                    </VListItem>
                  </VList>
                </VRadioGroup>
              </VWindowItem>

              <!-- 👉 Frameworks -->
              <VWindowItem>
                <h5 class="text-h5 mb-4">
                  Select Framework
                </h5>
                <VRadioGroup v-model="createAppData.framework">
                  <VList class="card-list">
                    <VListItem
                      v-for="framework in frameworks"
                      :key="framework.title"
                      @click="createAppData.framework = framework.slug"
                    >
                      <template #prepend>
                        <VAvatar
                          size="46"
                          rounded
                          variant="tonal"
                          :color="framework.color"
                          class="me-1"
                        >
                          <img :src="framework.icon">
                        </VAvatar>
                      </template>
                      <VListItemTitle class="mb-1 font-weight-medium">
                        {{ framework.title }}
                      </VListItemTitle>
                      <VListItemSubtitle class="me-2">
                        {{ framework.subtitle }}
                      </VListItemSubtitle>
                      <template #append>
                        <VRadio :value="framework.slug" />
                      </template>
                    </VListItem>
                  </VList>
                </VRadioGroup>
              </VWindowItem>

              <!-- 👉 Database Engine -->
              <VWindowItem>
                <VTextField
                  label="Database Name"
                  placeholder="userDB"
                />

                <h5 class="text-h5 mt-6 mb-4">
                  Select Database Engine
                </h5>
                <VRadioGroup v-model="createAppData.database">
                  <VList class="card-list">
                    <VListItem
                      v-for="database in databases"
                      :key="database.title"
                      @click="createAppData.database = database.slug"
                    >
                      <template #prepend>
                        <VAvatar
                          size="46"
                          rounded
                          variant="tonal"
                          :color="database.color"
                          class="me-1"
                        >
                          <img :src="database.icon">
                        </VAvatar>
                      </template>
                      <VListItemTitle class="mb-1 font-weight-medium">
                        {{ database.title }}
                      </VListItemTitle>
                      <VListItemSubtitle class="me-2">
                        {{ database.subtitle }}
                      </VListItemSubtitle>
                      <template #append>
                        <VRadio :value="database.slug" />
                      </template>
                    </VListItem>
                  </VList>
                </VRadioGroup>
              </VWindowItem>

              <!-- 👉 Billing form -->
              <VWindowItem>
                <VForm>
                  <VRow>
                    <VCol cols="12">
                      <VTextField
                        v-model="createAppData.cardNumber"
                        label="Card Number"
                        placeholder="1234 1234 1234 1234"
                        type="number"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="createAppData.cardName"
                        label="Name on Card"
                        placeholder="John Doe"
                      />
                    </VCol>

                    <VCol
                      cols="6"
                      md="3"
                    >
                      <VTextField
                        v-model="createAppData.cardExpiry"
                        label="Expiry"
                        placeholder="MM/YY"
                      />
                    </VCol>

                    <VCol
                      cols="6"
                      md="3"
                    >
                      <VTextField
                        v-model="createAppData.cardCvv"
                        label="CVV"
                        placeholder="123"
                      />
                    </VCol>

                    <VCol cols="12">
                      <VSwitch
                        v-model="createAppData.isSave"
                        label="Save Card for future billing?"
                      />
                    </VCol>
                  </VRow>
                </VForm>
              </VWindowItem>

              <VWindowItem class="text-center">
                <h5 class="text-h5 mb-2 mt-3">
                  Submit 🥳
                </h5>
                <p class="text-body-2 mb-4">
                  Submit to kickstart your project.
                </p>

                <VImg
                  :src="illustrationJohn"
                  width="261"
                  class="mx-auto"
                />
              </VWindowItem>
            </VWindow>

            <div class="d-flex justify-space-between mt-6">
              <VBtn
                variant="outlined"
                color="secondary"
                :disabled="currentStep === 0"
                @click="currentStep--"
              >
                <VIcon
                  icon="ri-arrow-left-line"
                  start
                  class="flip-in-rtl"
                />
                Previous
              </VBtn>

              <VBtn
                v-if="createApp.length - 1 === currentStep"
                color="success"
                append-icon="ri-check-line"
                @click="onSubmit"
              >
                submit
              </VBtn>

              <VBtn
                v-else
                @click="currentStep++"
              >
                Next

                <VIcon
                  icon="ri-arrow-right-line"
                  end
                  class="flip-in-rtl"
                />
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.stepper-content .card-list {
  --v-card-list-gap: 1rem;
}
</style>
