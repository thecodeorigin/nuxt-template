<script setup lang="ts">
interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
}

interface Prop {
  isDialogVisible: boolean
}

const props = defineProps<Prop>()

defineEmits<Emit>()

const selectedPlan = ref('basic')

const plansList = [
  { desc: 'Standard - $99/month', title: 'Standard', value: 'standard' },
  { desc: 'Basic - $0/month', title: 'Basic', value: 'basic' },
  { desc: 'Enterprise - $499/month', title: 'Enterprise', value: 'enterprice' },
  { desc: 'Company - $999/month', title: 'Company', value: 'company' },
]

const isConfirmDialogVisible = ref(false)
</script>

<template>
  <!-- 👉 upgrade plan -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 650"
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
        <div class="text-center mb-6">
          <h4 class="text-h4 mb-2">
            Upgrade Plan
          </h4>
          <div class="text-body-1">
            Choose the best plan for user.
          </div>
        </div>

        <div class="d-flex justify-space-between flex-column flex-sm-row gap-4 px-0 mt-4">
          <VSelect
            v-model="selectedPlan"
            :items="plansList"
            density="compact"
            label="Choose a plan"
            placeholder="Basic"
          />
          <VBtn>
            Upgrade
          </VBtn>
        </div>

        <VDivider class="my-6" />

        <p class="text-body-1 mb-1">
          User current plan is standard plan
        </p>
        <div class="d-flex justify-center justify-sm-space-between align-center flex-wrap gap-2">
          <div class="d-flex align-center me-3">
            <sup class="text-base text-primary">$</sup>
            <h1 class="text-h1 text-primary">
              99
            </h1>
            <sub class="text-body-2 mt-3">/month</sub>
          </div>
          <VBtn
            color="error"
            variant="outlined"
            @click="isConfirmDialogVisible = true"
          >
            Cancel Subscription
          </VBtn>
        </div>

        <!-- 👉 Confirm Dialog -->
        <ConfirmDialog
          v-model:isDialogVisible="isConfirmDialogVisible"
          cancel-title="Cancelled"
          confirm-title="Unsubscribed!"
          confirm-msg="Your subscription cancelled successfully."
          confirmation-question="Are you sure to cancel your subscription?"
          cancel-msg="Unsubscription Cancelled!!"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>
