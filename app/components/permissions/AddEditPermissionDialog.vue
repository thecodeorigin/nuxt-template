<script setup lang="ts">
import { on } from 'node:events'
import type { VForm } from 'vuetify/components/VForm'
import type { Permission } from '~/stores/admin/permission'
import { useRoleStore } from '~/stores/admin/role'

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

const roleStore = useRoleStore()
const { roleList } = storeToRefs(roleStore)
const { fetchRoles } = roleStore

const isFormValid = ref(false)
const refForm = ref<VForm>()

const isPermissionDataEmpty = computed(() => {
  const data = props.permissionData
  return !data || Object.values(data).every(value => value === '')
})

const localPermissionData = ref<Partial<Permission>>({
  id: '',
  role_id: '',
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
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('update:permissionData', props.permissionData
        ? localPermissionData.value
        : {
            role_id: localPermissionData.value.role_id,
            action: localPermissionData.value.action,
            subject: localPermissionData.value.subject,
          })

      onReset()
    }
  })
}

watch(() => props.permissionData, (newPermissionData) => {
  if (newPermissionData) {
    localPermissionData.value = { ...newPermissionData }
  }
}, { immediate: true })

onMounted(async () => {
  await fetchRoles()
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
            {{ isPermissionDataEmpty ? 'Add' : 'Edit' }} Permission
          </h4>

          <p class="text-body-1">
            {{ isPermissionDataEmpty ? 'Add' : 'Edit' }}  permission as per your requirements.
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
            <div class="d-flex flex-column gap-4 mb-4">
              <VSelect
                v-model="localPermissionData.action"
                density="compact"
                :rules="[requiredValidator]"
                label="Select Action"
                placeholder="Select Action"
                :items="[
                  {
                    title: 'Create',
                    value: 'create',
                  },
                  {
                    title: 'Read',
                    value: 'read',
                  },
                  {
                    title: 'Update',
                    value: 'update',
                  },
                  {
                    title: 'Delete',
                    value: 'delete',
                  },
                  {
                    title: 'Manage',
                    value: 'manage',
                  },
                ]"
              />

              <VSelect
                v-model="localPermissionData.role_id"
                density="compact"
                label="Select Role"
                :rules="[requiredValidator]"
                :items="roleList"
                item-title="name"
                item-value="id"
              />

              <VSelect
                v-model="localPermissionData.subject"
                density="compact"
                :rules="[requiredValidator]"
                label="Select Subject"
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
              {{ isPermissionDataEmpty ? 'Add' : 'Edit' }}
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
