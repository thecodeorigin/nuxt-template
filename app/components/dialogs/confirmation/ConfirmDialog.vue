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
    <VCard class="text-center px-10 py-6">
      <VCardText>
        <VBtn
          icon
          variant="outlined"
          color="warning"
          class="my-4"
          size="x-large"
        >
          <span class="text-4xl">!</span>
        </VBtn>

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

      <VCardText class="d-flex align-center justify-center gap-4">
        <VBtn
          variant="elevated"
          @click="handleConfirm"
        >
          {{ $t('Confirm') }}
        </VBtn>

        <VBtn
          color="secondary"
          variant="outlined"
          @click="handleCancel"
        >
          {{ $t('Cancel') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
