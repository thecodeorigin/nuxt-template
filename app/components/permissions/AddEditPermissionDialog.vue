<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'
import type { Permission } from '~/stores/admin/permission'

interface Props {
  isDialogVisible: boolean
  permissionData?: Partial<Permission>
}
interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'update:permissionData', value: Partial<Permission>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isFormValid = ref(false)
const refForm = ref<VForm>()

const isPermissionDataEmpty = computed(() => {
  const data = props.permissionData
  return !data || Object.values(data).every(value => value === '')
})

const localPermissionData = ref<Partial<Permission>>({
  id: '',
  role_id: 'ecd82042-0cf5-4085-9f28-7a95cf341301', // TODO: select role
  action: '',
  subject: '',
})

function onReset() {
  emit('update:isDialogVisible', false)

  localPermissionData.value = {
    id: '',
    role_id: '',
    action: '',
    subject: '',
  }
}

function onSubmit() {
  emit('update:isDialogVisible', false)
  emit('update:permissionData', localPermissionData.value)
}

watch(() => props, () => {
  if (props && props.permissionData)
    localPermissionData.value = props.permissionData
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
            {{ isPermissionDataEmpty ? 'Edit' : 'Add' }} Permission
          </h4>

          <p class="text-body-1">
            {{ isPermissionDataEmpty ? 'Edit' : 'Add' }}  permission as per your requirements.
          </p>
        </div>

        <!-- 👉 Form -->
        <VForm
          ref="refForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <VAlert
            type="warning"
            title="Warning!"
            variant="tonal"
            class="mb-6"
          >
            By {{ isPermissionDataEmpty ? 'editing' : 'adding' }} the permission name, you might break the system permissions functionality. Please ensure you're absolutely certain before proceeding.
          </VAlert>

          <!-- 👉 Role action -->
          <div class="mb-4">
            <div class="d-flex flex-column gap-2 mb-4">
              <VTextField
                v-model="localPermissionData.action"
                density="compact"
                placeholder="Enter Permission action"
              />

              <VTextField
                v-model="localPermissionData.subject"
                density="compact"
                placeholder="Enter Permission subject"
              />

              <!-- TODO: select role after role CRUD -->
              <!-- <VSelect
                v-model="localPermissionData.role_id"
                density="compact"
                placeholder="Select Role"
                :items="roles"
                item-title="name"
                item-value="id"
              /> -->

              <VSelect
                v-model="localPermissionData.subject"
                density="compact"
                placeholder="Select Role"
                :items="[
                  {
                    title: 'Category',
                    value: 'category',
                  },
                  {
                    title: 'Project',
                    value: 'project',
                  },
                  {
                    title: 'All',
                    value: 'all',
                  },
                ]"
              />
            </div>

            <VBtn @click="onSubmit">
              Update
            </VBtn>
          </div>
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
