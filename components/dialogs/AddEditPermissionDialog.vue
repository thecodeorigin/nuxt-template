<script setup lang="ts">
interface Props {
  isDialogVisible: boolean
  permissionName?: string
}
interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'update:permissionName', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  permissionName: '',
})

const emit = defineEmits<Emit>()

const currentPermissionName = ref('')

const onReset = () => {
  emit('update:isDialogVisible', false)
  currentPermissionName.value = ''
}

const onSubmit = () => {
  emit('update:isDialogVisible', false)
  emit('update:permissionName', currentPermissionName.value)
}

watch(() => props, () => {
  currentPermissionName.value = props.permissionName
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <VCard class="pa-sm-8 pa-5">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="onReset"
      />

      <VCardText class="mt-5">
        <!-- 👉 Title -->
        <div class="text-center mb-6">
          <h4 class="text-h4 mb-2">
            {{ props.permissionName ? 'Edit' : 'Add' }} Permission
          </h4>

          <p class="text-body-1">
            {{ props.permissionName ? 'Edit' : 'Add' }}  permission as per your requirements.
          </p>
        </div>

        <!-- 👉 Form -->
        <VForm>
          <VAlert
            type="warning"
            title="Warning!"
            variant="tonal"
            class="mb-6"
          >
            By {{ props.permissionName ? 'editing' : 'adding' }} the permission name, you might break the system permissions functionality. Please ensure you're absolutely certain before proceeding.
          </VAlert>

          <!-- 👉 Role name -->
          <div class="d-flex align-center gap-4 mb-4">
            <VTextField
              v-model="currentPermissionName"
              density="compact"
              placeholder="Enter Permission Name"
            />

            <VBtn @click="onSubmit">
              Update
            </VBtn>
          </div>

          <VCheckbox label="Set as core permission" />
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.permission-table {
  td {
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    padding-block: 0.5rem;
    padding-inline: 0;
  }
}
</style>
