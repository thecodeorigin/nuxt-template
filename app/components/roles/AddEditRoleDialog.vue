<script setup lang="ts">
import type { Permission } from '@base/stores/admin/permission'
import type { RoleWithPermissions } from '@base/stores/admin/role'
import { requiredValidator } from '#imports'
import { VForm } from 'vuetify/components/VForm'

const props = defineProps<{
  role?: RoleWithPermissions | null
  permissions: Permission[]
}>()

const emit = defineEmits<{
  (e: 'edit', payload: ReturnType<typeof getDefaultFormData>): void
  (e: 'create', payload: Omit<ReturnType<typeof getDefaultFormData>, 'id'>): void
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

const formTemplate = useTemplateRef('formRef')

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

async function handleSubmit() {
  try {
    if (formTemplate.value) {
      const { valid, errors } = await formTemplate.value.validate()

      if (valid) {
        if (formData.value.id) {
          emit('edit', formData.value)
        }
        else {
          emit('create', {
            name: formData.value.name,
            permissions: formData.value.permissions,
          })
        }
      }
      else if (errors.length) {
        notifyWarning({
          content: errors[0]?.errorMessages[0],
        })
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
        <VForm ref="formRef">
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
                  multiple
                  :class="{ 'text-primary': formData.permissions.includes(permission.id) }"
                  :value="permission.id"
                  :rules="[requiredValidator(formData.permissions)]"
                >
                  <template #label>
                    <span class="pr-3" :class="{ 'text-primary': formData.permissions.includes(permission.id) }">
                      {{ permission.action.toLowerCase() }}:{{ permission.subject.toLowerCase() }}
                    </span>
                  </template>
                </VCheckbox>
              </VLabel>
            </div>
          </div>

          <!-- 👉 Actions button -->
          <div class="d-flex align-center justify-center gap-3 mt-6">
            <VBtn @click="handleSubmit">
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
