<script setup lang="ts">
interface Props {
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const dialogVisibleUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const referAndEarnSteps = [
  {
    icon: 'ri-send-plane-2-line',
    title: 'Send Invitation 👍🏻',
    subtitle: 'Send your referral link to your friend',
  },
  {
    icon: 'ri-pages-line',
    title: 'Registration 😎',
    subtitle: 'Let them register to our services',
  },
  {
    icon: 'ri-gift-line',
    title: 'Free Trial  🎉',
    subtitle: 'Your friend will get 30 days free trial',
  },
]
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="800"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="refer-and-earn-dialog pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pt-5">
        <div class="text-center pb-3">
          <h4 class="text-h4 pb-2">
            Refer & Earn
          </h4>

          <div class="text-body-1">
            Invite your friend to Materialize, if they sign up, you and your friend will get 30 days free trial
          </div>
        </div>

        <VRow class="text-center my-6">
          <VCol
            v-for="step in referAndEarnSteps"
            :key="step.title"
            cols="12"
            sm="4"
          >
            <div>
              <VAvatar
                variant="tonal"
                size="88"
                color="primary"
                class="mb-4"
              >
                <VIcon
                  size="40"
                  :icon="step.icon"
                />
              </VAvatar>

              <h6 class="text-h6 mb-2">
                {{ step.title }}
              </h6>

              <div class="text-body-1">
                {{ step.subtitle }}
              </div>
            </div>
          </VCol>
        </VRow>

        <VDivider class="mt-9 mb-6" />

        <h5 class="text-h5 mb-5">
          Invite your friends
        </h5>

        <p class="mb-2">
          Enter your friend's email address and invite them to join Materialize 😍
        </p>
        <VForm
          class="d-flex align-center gap-4 mb-6"
          @submit.prevent="() => {}"
        >
          <VTextField
            placeholder="johnDoe@gmail.com"
            density="compact"
          />

          <VBtn type="submit">
            Submit
          </VBtn>
        </VForm>

        <h5 class="text-h5 mb-5">
          Share the referral link
        </h5>

        <p class="mb-2">
          You can also copy and send it or share it on your social media. 🚀
        </p>
        <VForm
          class="d-flex align-center flex-wrap gap-4"
          @submit.prevent="() => {}"
        >
          <VTextField
            placeholder="http://referral.link"
            class="refer-link-input"
            density="compact"
          >
            <template #append-inner>
              <VBtn
                size="small"
                variant="text"
              >
                COPY LINK
              </VBtn>
            </template>
          </VTextField>

          <div class="d-flex gap-1">
            <VBtn
              icon
              class="rounded"
              color="#3B5998"
            >
              <VIcon
                color="white"
                icon="ri-facebook-circle-line"
              />
            </VBtn>

            <VBtn
              icon
              class="rounded"
              color="#55ACEE"
            >
              <VIcon
                color="white"
                icon="ri-twitter-line"
              />
            </VBtn>

            <VBtn
              icon
              class="rounded"
              color="#007BB6"
            >
              <VIcon
                color="white"
                icon="ri-linkedin-line"
              />
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.refer-link-input {
  .v-field--appended {
    padding-inline-end: 0.4375rem;
  }

  .v-field__append-inner {
    padding-block-start: 0;
  }
}
</style>
