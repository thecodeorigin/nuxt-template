<script setup lang="ts">
import { omit } from 'lodash-es'
import type { Action, ConfirmationServiceProps } from './confirm-dialog'

import { confirmationProps } from './confirm-dialog'

const props = withDefaults(
  defineProps<ConfirmationServiceProps>(),
  {
    ...confirmationProps,
    closeOnHashChange: true,
    body: '',
    dangerouslyUseHTMLString: false,
  },
)

const emit = defineEmits(['vanish', 'action'])

const propsComputed = computed(() => omit(props, ['closeOnHashChange', 'body', 'dangerouslyUseHTMLString']))

const visible = ref(false)

const hasBody = computed(() => Boolean(props.body))

const action = ref<Action>()

onMounted(async () => {
  await nextTick()
  if (props.closeOnHashChange) {
    window.addEventListener('hashchange', doClose)
  }
})

onBeforeUnmount(() => {
  if (props.closeOnHashChange) {
    window.removeEventListener('hashchange', doClose)
  }
})

function doClose() {
  if (!visible.value)
    return

  visible.value = false

  nextTick(() => {
    if (action.value)
      emit('action', action.value)
  })
}

function handleAction(value: Action) {
  action.value = value

  if (props.beforeClose) {
    props.beforeClose?.(doClose)
  }
  else {
    doClose()
  }
}

function handleCancel() {
  handleAction('cancel')
}

function handleConfirm() {
  handleAction('confirm')
}

function setVisible(value: boolean) {
  visible.value = value
}

defineExpose({
  setVisible,
  doClose,
  handleCancel,
  handleAction,
})
</script>

<template>
  <VDialog
    v-model="visible"
    v-bind="propsComputed"
    max-width="500"
  >
    <!-- Dialog Content -->
    <VCard>
      <VCardTitle class="d-flex align-center gap-2">
        <VIcon
          size="24"
          icon="ri-error-warning-fill"
          color="warning"
        />
        {{ title }}
      </VCardTitle>
      <VCardText class="text-body-1">
        <slot>
          <template v-if="hasBody">
            <template v-if="!dangerouslyUseHTMLString">
              {{ !dangerouslyUseHTMLString ? body : '' }}
            </template>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-else
              v-html="body"
            />
          </template>
        </slot>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-4">
        <VBtn
          color="secondary"
          variant="outlined"
          @click="handleCancel"
        >
          {{ $t('Cancel') }}
        </VBtn>
        <VBtn
          variant="elevated"
          @click="handleConfirm"
        >
          {{ $t('Confirm') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
