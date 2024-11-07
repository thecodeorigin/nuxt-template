<script setup lang="ts">
import { type Permission, usePermissionStore } from '@base/stores/admin/permission'

definePageMeta({
  sidebar: {
    title: 'Test Permission',
    icon: { icon: 'ri-id-card-line' },
  },
})

interface PermissionDialog {
  isVisible: boolean
  data?: Partial<Permission>
}

const permissionStore = usePermissionStore()
const { permissionDetail, permissionList, totalPermissions } = storeToRefs(permissionStore)
const { fetchPermissions, fetchPermissionDetail, createPermission } = permissionStore

const currentPermissionId = ref<string>('')
const currentPermissionName = ref<string>('')

const currentPermissionData = ref<Partial<Permission>>({
  id: '',
  role_id: '',
  action: '',
  subject: '',
})
const currentDialogConfig = ref<PermissionDialog>({
  isVisible: false,
  data: undefined,
})

function handleResetPermissionData() {
  currentPermissionData.value = {
    id: '',
    role_id: '',
    action: '',
    subject: '',
  }
}

function handleOpenAddDialog() {
  handleResetPermissionData()

  currentDialogConfig.value = {
    isVisible: true,
    data: undefined,
  }
}

async function handleCreatePermission(permissionPayload: Partial<Permission>) {
  await createPermission(permissionPayload)

  await fetchPermissions()
}

// async function handleOpenEditDrawer(organizationId: string) {
//   await handleFetchOrganizationDetail(organizationId)

//   currentPermissionData.value = {
//     id: permissionDetail.value?.id,
//     role_id: permissionDetail.value?.role_id,
//     action: permissionDetail.value?.action,
//     subject: permissionDetail.value?.subject,
//   }

//   currentDrawerConfig.value = {
//     isVisible: true,
//     type: DRAWER_ACTION_TYPES.EDIT,
//   }
// }

// async function handleFetchOrganizationDetail(organizationId: string) {
//   await fetchOrganizationDetail(organizationId)
// }

// async function handleAddNewOrganization(organizationPayload: Partial<Organization>) {
//   await createOrganization(organizationPayload)

//   await fetchPermissions()
// }

// async function handleUpdateOrganization(organizationId: string, payload: Partial<Organization>) {
//   await updateOrganization(organizationId, payload)

//   currentPermissionName.value = ''

//   await fetchPermissions()
// }

// async function handleOrganizationChange(payload: Partial<Organization>, type: DrawerActionTypes) {
//   if (type === DRAWER_ACTION_TYPES.EDIT) {
//     const { id, ...body } = payload
//     await handleUpdateOrganization(id!, body)
//     nextTick(() => {
//       handleResetPermissionData()
//     })
//   }
//   else {
//     await handleAddNewOrganization(payload)
//   }
// }

// async function handleDeleteOrganization(organizationId: string) {
//   await deleteOrganization(organizationId)

//   await fetchPermissions()
// }

useLazyAsyncData(
  async () => {
    await fetchPermissions()
  },
)
</script>

<template>
  <div>
    <h1 class="text-center">
      Test Permission
    </h1>

    <div>
      <h2 class="mb-2">
        Permission list:
      </h2>
      <div v-if="permissionList.length > 0">
        <p>
          Total Permissions: {{ totalPermissions }}
        </p>
        <br>
        <ul>
          <li
            v-for="permission in permissionList"
            :key="permission.id"
          >
            <div class="d-flex align-center justify-space-between">
              <p>
                {{ permission.id }}
                <span>
                  {{ permission.action }}
                </span>
              </p>

              <div class="d-flex align-center gap-2">
                <!-- <VBtn
                  @click="handleOpenEditDrawer(permission.id)"
                >
                  Edit
                </VBtn> -->

                <!-- <VBtn
                  @click="handleDeleteOrganization(permission.id)"
                >
                  Delete
                </VBtn> -->
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-else>
        No permission
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        permission detail:
      </h2>

      <div class="mb-2 d-flex align-center gap-2">
        <VTextField
          v-model="currentPermissionId"
          label="permission ID"
        />

        <VBtn @click="fetchPermissionDetail(currentPermissionId)">
          Find Organization
        </VBtn>
      </div>

      <div v-if="permissionDetail">
        <p>
          ID: {{ permissionDetail.id }}
        </p>
        <p>
          Name: {{ permissionDetail.action }}
        </p>
        <p>
          Role: {{ permissionDetail.role_id }}
        </p>
      </div>

      <div v-else>
        Not found
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        Permission create:
      </h2>

      <VBtn
        @click="handleOpenAddDialog()"
      >
        Create permission
      </VBtn>
    </div>

    <AddEditPermissionDialog
      v-model:is-dialog-visible="currentDialogConfig.isVisible"
      :permission-data="currentDialogConfig.data"
    />
  </div>
</template>
