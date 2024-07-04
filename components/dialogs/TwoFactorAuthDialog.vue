<script setup lang="ts">
import type { CustomInputContent } from '@core/types'

interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
}
interface Props {
  isDialogVisible: boolean
  smsCode?: string
  authAppCode?: string
}

const props = withDefaults(defineProps<Props>(), {
  isDialogVisible: false,
  smsCode: '',
  authAppCode: '',
})

const emit = defineEmits<Emit>()

const authMethods: CustomInputContent[] = [
  {
    icon: 'ri-settings-4-line',
    title: 'Authenticator Apps',
    desc: 'Get code from an app like Google Authenticator or Microsoft Authenticator.',
    value: 'authApp',
  },
  {
    icon: 'ri-wechat-line',
    title: 'SMS',
    desc: 'We will send a code via SMS if you need to use your backup login method.',
    value: 'sms',
  },
]

const selectedMethod = ref('authApp')
const isAuthAppDialogVisible = ref(false)
const isSmsDialogVisible = ref(false)

const openSelectedMethodDialog = () => {
  if (selectedMethod.value === 'authApp') {
    isAuthAppDialogVisible.value = true
    isSmsDialogVisible.value = false
    emit('update:isDialogVisible', false)
  }
  if (selectedMethod.value === 'sms') {
    isAuthAppDialogVisible.value = false
    isSmsDialogVisible.value = true
    emit('update:isDialogVisible', false)
  }
}
</script>

<template>
  <VDialog
    max-width="800"
    :model-value="props.isDialogVisible"
    @update:model-value="(val) => $emit('update:isDialogVisible', val)"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="$emit('update:isDialogVisible', false)"
      />

      <VCardText class="pt-5">
        <div class="mb-6">
          <div class="text-center mb-6">
            <h4 class="text-h4 mb-2">
              Select Authentication Method
            </h4>
            <div class="text-body-1">
              You also need to select a method by which the proxy authenticates to the directory serve.
            </div>
          </div>
          <CustomRadios
            v-model:selected-radio="selectedMethod"
            :radio-content="authMethods"
            :grid-column="{ cols: '12' }"
          >
            <template #default="items">
              <div class="d-flex flex-column">
                <div class="d-flex mb-2 align-center gap-x-1">
                  <VIcon
                    :icon="items.item.icon"
                    size="20"
                    class="text-high-emphasis"
                  />
                  <div class="text-body-1 font-weight-medium text-high-emphasis">
                    {{ items.item.title }}
                  </div>
                </div>
                <p class="text-body-2 mb-0">
                  {{ items.item.desc }}
                </p>
              </div>
            </template>
          </CustomRadios>
        </div>

        <div class="text-end">
          <VBtn @click="openSelectedMethodDialog">
            continue
            <VIcon
              end
              icon="ri-arrow-right-line"
              class="flip-in-rtl"
            />
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>

  <AddAuthenticatorAppDialog
    v-model:isDialogVisible="isAuthAppDialogVisible"
    :auth-code="props.authAppCode"
  />
  <EnableOneTimePasswordDialog
    v-model:isDialogVisible="isSmsDialogVisible"
    :mobile-number="props.smsCode"
  />
</template>

<style lang="scss">
.auth-method-card {
  &.card-list .v-list-item {
    padding-block: 20px !important;
    padding-inline: 30px !important;
  }

  &.responsive-card {
    .v-list-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;

      .v-list-item__prepend {
        svg {
          margin: 0;
        }
      }
    }
  }
}
</style>
