<script setup lang="ts">
import type { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'
import type { InferSelectModel } from 'drizzle-orm'
import { requiredValidator } from '#imports'
import { PermissionAction, PermissionScope } from '@base/server/db/schemas'
import { cloneDeep } from 'lodash-es'

type Permission = InferSelectModel<typeof sysPermissionTable>

const props = defineProps<{
  permission?: Permission | null
}>()

const emit = defineEmits<{
  (e: 'edit', payload: Permission): void
  (e: 'create', payload: Permission): void
  (e: 'cancel'): void
}>()

const modelValue = defineModel<boolean>({
  default: false,
})

const formTemplate = useTemplateRef('formRef')

function getDefaultFormData(): Permission {
  return {
    id: '',
    action: PermissionAction.READ,
    subject: '',
    scope: PermissionScope.ALL,
    scope_value: '',
  }
}

const formData = ref(getDefaultFormData())

watch(modelValue, (value) => {
  if (!value) {
    formData.value = getDefaultFormData()
  }
})

syncRef(computed(() => props.permission), formData, {
  direction: 'ltr',
  transform: {
    ltr(left) {
      if (left)
        return cloneDeep(left)

      return getDefaultFormData()
    },
  },
})

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
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
  >
    <VCard class="pa-sm-8 pa-5">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="modelValue = false"
      />

      <VCardText class="mt-5">
        <div class="text-center mb-6">
          <h4 class="text-h4 mb-2">
            {{ permission ? $t('Edit Permission') : $t('Create Permission') }}
          </h4>
        </div>

        <VForm
          ref="formRef"
          @submit.prevent="handleSubmit"
        >
          <VAlert
            type="warning"
            :title="$t('Be careful!')"
            variant="tonal"
            class="mb-6"
          >
            {{
              $t('By modifying permission, you might break the system permissions functionality. Please ensure you\'re absolutely certain before proceeding.')
            }}
          </VAlert>

          <!-- 👉 Role action -->
          <div class="mb-4">
            <div class="d-flex flex-column gap-4 mb-4">
              <VSelect
                v-model="formData.action"
                density="compact"
                :label="$t('Select Permission')"
                :placeholder="$t('Select Permission')"
                :rules="[requiredValidator]"
                :items="[
                  {
                    title: $t('Create'),
                    value: PermissionAction.CREATE,
                  },
                  {
                    title: $t('Read'),
                    value: PermissionAction.READ,
                  },
                  {
                    title: $t('Update'),
                    value: PermissionAction.UPDATE,
                  },
                  {
                    title: $t('Delete'),
                    value: PermissionAction.DELETE,
                  },
                  {
                    title: $t('Manage'),
                    value: PermissionAction.MANAGE,
                  },
                ]"
              />

              <VTextField
                v-model="formData.subject"
                placeholder="Post, Category, User, etc."
                :label="$t('Fill Module Name')"
                :rules="[requiredValidator]"
              />

              <VSelect
                v-model="formData.scope"
                density="compact"
                :label="$t('Select Scope')"
                :placeholder="$t('Select Scope')"
                :rules="[requiredValidator]"
                :items="[
                  {
                    title: $t('All'),
                    value: PermissionScope.ALL,
                  },
                  {
                    title: $t('Organization'),
                    value: PermissionScope.ORGANIZATION,
                  },
                  {
                    title: $t('Creator'),
                    value: PermissionScope.SELF,
                  },
                  {
                    title: $t('Custom'),
                    value: PermissionScope.CUSTOM,
                  },
                ]"
              />

              <VTextField
                v-if="formData.scope === PermissionScope.CUSTOM"
                v-model="formData.scope_value"
                placeholder="Post, Category, User, etc."
                :label="$t('Fill Scope Value')"
                :rules="[requiredValidator]"
              />
            </div>

            <VBtn type="submit">
              {{ permission ? $t('Update') : $t('Submit') }}
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
