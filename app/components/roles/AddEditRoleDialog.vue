<script setup lang="ts">
import { debounce, values } from 'lodash-es'
import { VForm } from 'vuetify/components/VForm'
import { usePermissionStore } from '@base/stores/admin/permission'
import type { Permission } from '@base/stores/admin/permission'
import type { PivotRolePermission, RoleWithPermissions } from '@base/stores/admin/role'
import { requiredValidator } from '#imports'

const props = defineProps<{
  role?: RoleWithPermissions | null
  permissions: Permission[]
}>()

const emit = defineEmits<{
  (e: 'edit', payload: ReturnType<typeof getDefaultFormData>): void
  (e: 'create', payload: ReturnType<typeof getDefaultFormData>): void
}>()

const modelValue = defineModel<boolean>({
  default: false,
})

function getDefaultFormData(): { id: string, name: string, permissions: string[] } {
  return {
    id: '',
    name: '',
    permissions: [],
  }
}

const formData = ref(getDefaultFormData())

syncRef(computed(() => props.role), formData, {
  direction: 'ltr',
  transform: {
    ltr(left) {
      if (left) {
        return {
          id: left.id,
          name: left.name,
          permissions: left.permissions.map(p => p.permission.id),
        }
      }

      return getDefaultFormData()
    },
  },
})

watch(modelValue, (value) => {
  if (!value) {
    formData.value = {
      id: '',
      name: '',
      permissions: [],
    }
  }
})

const formTemplate = useTemplateRef('formRef')

async function handleSubmit() {
  try {
    if (formTemplate.value) {
      const { valid } = await formTemplate.value.validate()

      if (valid) {
        if (formData.value.id)
          emit('edit', formData.value)
        else
          emit('create', formData.value)
      }
    }
  }
  catch {}
}
</script>

<template>
  <VDialog
    v-model="modelValue"
    :width="$vuetify.display.smAndDown ? '100%' : 900"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="modelValue = false"
      />

      <VCardText>
        <!-- 👉 Title -->
        <div class="text-center mb-10">
          <h4 class="text-h4 mb-2">
            {{ role ? $t('Edit Role') : $t('Create Role') }}
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <!-- 👉 Role name -->
          <VTextField
            v-model="formData.name"
            :rules="[requiredValidator]"
            class="mb-6"
            label="Role Name"
            placeholder="Enter Role Name"
          />

          <!-- 👉 Role Permissions -->
          <div class="mt-6 d-flex flex-wrap gap-3 permission-container">
            <div v-for="permission in permissions" :key="permission.id" class="d-flex align-center gap-2 flex-wrap">
              <VLabel>
                <VCheckbox
                  v-model="formData.permissions"
                  :value="permission.id"
                  class="border pa-2"
                  :class="{ 'border border-primary text-primary': formData.permissions.includes(permission.id) }"
                  multiple
                >
                  <template #label>
                    <span class="pr-3" :class="{ 'text-primary': formData.permissions.includes(permission.id) }">
                      {{ permission.action }}:{{ permission.subject }}
                    </span>
                  </template>
                </VCheckbox>
              </VLabel>
            </div>
          </div>

          <!-- 👉 Actions button -->
          <div class="d-flex align-center justify-center gap-3 mt-6">
            <VBtn type="submit">
              {{ role ? $t('Update Role') : $t('Create Role') }}
            </VBtn>

            <VBtn
              color="secondary"
              variant="outlined"
              @click="modelValue = false"
            >
              {{ $t('Cancel') }}
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.permission-container {
  min-block-size: 150px;
}
</style>
