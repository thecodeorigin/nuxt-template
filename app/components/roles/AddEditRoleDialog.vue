<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { usePermissionStore } from '~/stores/admin/permission'

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

const permissionStore = usePermissionStore()
const { permissionList } = storeToRefs(permissionStore)
const { fetchPermissions } = permissionStore

const refPermissionForm = ref<VForm>()
const isFormValid = ref(false)

const isSelectAll = ref(false)
const localRoleData = ref<Partial<Role>>({
  id: '',
  name: '',
})

const permissions = [
  {
    action: 'Read',
    subject: 'All',
    value: {
      action: 'read',
      subject: 'all',
    },
  },
  {
    action: 'Read',
    subject: 'Category',
    value: {
      action: 'read',
      subject: 'category',
    },
  },
  {
    action: 'Create',
    subject: 'All',
    value: {
      action: 'create',
      subject: 'all',
    },
  },
]

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

onMounted(() => {
  fetchPermissions()
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? '100%' : 900"
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
            class="mb-6"
            label="Role Name"
            placeholder="Enter Role Name"
          />

          <!-- 👉 Role filter -->
          <VRow>
            <VCol cols="12" md="4" class="d-flex align-center">
              <h5 class="text-h5">
                Role Permissions
              </h5>
            </VCol>

            <VCol cols="12" md="8">
              <div class="d-flex align-center gap-3 flex-wrap">
                <p>
                  Select:
                </p>

                <VBtn
                  color="secondary"
                  variant="text"
                  text="All"
                />

                <VBtn
                  color="secondary"
                  variant="text"
                  text="None"
                />

                <div class="flex-grow-1">
                  <VTextField
                    v-model="search"
                    placeholder="Search"
                    density="compact"
                    prepend-inner-icon="ri-search-line"
                  />
                </div>
              </div>
            </VCol>
          </VRow>

          <!-- 👉 Role Permissions -->
          <div class="mt-6 d-flex flex-wrap gap-3">
            <div v-for="permission in permissionList" :key="permission.id" class="d-flex align-center gap-2 flex-wrap border px-3 py-2">
              <VLabel>
                <VCheckboxBtn />

                {{ permission.action }}:{{ permission.subject }}
              </VLabel>
            </div>
          </div>

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

<style lang="scss" scoped>
</style>
