<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { usePermissionStore } from '~/stores/admin/permission'
import { type Role, useRoleStore } from '~/stores/admin/role'

interface Props {
  isDialogVisible: boolean
  roleData?: Partial<Role>
}
interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'update:rolePermissions', value: Partial<Role>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const roleStore = useRoleStore()
const { roleList } = storeToRefs(roleStore)
const permissionStore = usePermissionStore()
const { permissionList } = storeToRefs(permissionStore)

const refPermissionForm = ref<VForm>()
const isFormValid = ref(false)

const isSelectAll = ref(false)
const localRoleData = ref<Partial<Role>>({
  id: '',
  name: '',
})

// const checkedCount = computed(() => {
//   let counter = 0

//   permissions.value.forEach((permission) => {
//     Object.entries(permission).forEach(([key, value]) => {
//       if (key !== 'name' && value)
//         counter++
//     })
//   })

//   return counter
// })

// const isIndeterminate = computed(() => checkedCount.value > 0 && checkedCount.value < (permissions.value.length * 3))

// // select all
// watch(isSelectAll, (val) => {
//   permissions.value = permissions.value.map(permission => ({
//     ...permission,
//     read: val,
//     write: val,
//     create: val,
//   }))
// })

// // if Indeterminate is false, then set isSelectAll to false
// watch(isIndeterminate, () => {
//   if (!isIndeterminate.value)
//     isSelectAll.value = false
// })

// // if all permissions are checked, then set isSelectAll to true
// watch(permissions, () => {
//   if (checkedCount.value === (permissions.value.length * 3))
//     isSelectAll.value = true
// }, { deep: true })

// // if rolePermissions is not empty, then set permissions
// watch(() => props, () => {
//   if (props.rolePermissions && props.rolePermissions.permissions.length) {
//     role.value = props.rolePermissions.name
//     permissions.value = permissions.value.map((permission) => {
//       const rolePermission = props.rolePermissions?.permissions.find(item => item.name === permission.name)

//       if (rolePermission) {
//         return {
//           ...permission,
//           ...rolePermission,
//         }
//       }

//       return permission
//     })
//   }
// })

function onReset() {
  emit('update:isDialogVisible', false)

  isSelectAll.value = false
  refPermissionForm.value?.reset()

  localRoleData.value = {
    id: '',
    name: '',
  }
}

function onSubmit() {
  refPermissionForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('update:rolePermissions', props.roleData
        ? localRoleData.value
        : {
            name: localRoleData.value.name,
          })

      onReset()
    }
  })
}

watch(() => props.roleData, (newRoleData) => {
  if (newRoleData) {
    localRoleData.value = { ...newRoleData }
  }
}, { immediate: true })
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="onReset"
      />

      <VCardText>
        <!-- 👉 Title -->
        <div class="text-center mb-10">
          <h4 class="text-h4 mb-2">
            {{ !props.roleData ? 'Add' : 'Edit' }} Role
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm ref="refPermissionForm" v-model="isFormValid" @submit.prevent>
          <!-- 👉 Role name -->
          <VTextField
            v-model="localRoleData.name"
            :rules="[requiredValidator]"
            label="Role Name"
            placeholder="Enter Role Name"
          />

          <h5 class="text-h5 my-6">
            Role Permissions
          </h5>

          <!-- 👉 Role Permissions -->

          <VTable class="permission-table text-no-wrap">
            <!-- 👉 Admin  -->
            <!-- <tr>
              <td class="text-h6">
                Admin
              </td>
              <td colspan="3">
                <div class="d-flex justify-end">
                  <VCheckbox
                    v-model="isSelectAll"
                    v-model:indeterminate="isIndeterminate"
                    label="Select All"
                  />
                </div>
              </td>
            </tr> -->

            <!-- 👉 Other permission loop -->
            <!-- <template
              v-for="permission in permissionList"
              :key="permission.id"
            >
              <tr>
                <td class="text-h6">
                  {{ permission.action }}
                </td>
                <td style="inline-size: 5.75rem;">
                  <div class="d-flex justify-end">
                    <VCheckbox
                      v-model="permission.read"
                      label="Read"
                    />
                  </div>
                </td>
                <td style="inline-size: 5.75rem;">
                  <div class="d-flex justify-end">
                    <VCheckbox
                      v-model="permission.write"
                      label="Write"
                    />
                  </div>
                </td>
                <td style="inline-size: 5.75rem;">
                  <div class="d-flex justify-end">
                    <VCheckbox
                      v-model="permission.create"
                      label="Create"
                    />
                  </div>
                </td>
              </tr>
            </template> -->
          </VTable>

          <!-- 👉 Actions button -->
          <div class="d-flex align-center justify-center gap-3 mt-6">
            <VBtn @click="onSubmit">
              Submit
            </VBtn>

            <VBtn
              color="secondary"
              variant="outlined"
              @click="onReset"
            >
              Cancel
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
    padding-block: 0.625rem;

    .v-checkbox {
      min-inline-size: 4.75rem;
    }

    &:not(:first-child) {
      padding-inline: 0.75rem;
    }

    .v-label {
      white-space: nowrap;
    }
  }
}
</style>
