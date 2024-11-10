<script setup lang="ts">
import { type Permission, usePermissionStore } from '@base/stores/admin/permission'
import { DRAWER_ACTION_TYPES } from '~/constant/organization'
import type { DrawerActionTypes } from '~/utils/types'

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
const { fetchPermissions, fetchPermissionDetail, createPermission, updatePermission, deletePermission } = permissionStore

const currentPermissionId = ref<string>('')
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

const currentDialogAction = ref<DrawerActionTypes>('add')

// 👉 Open Create Dialog
function handleOpenAddDialog() {
  currentDialogAction.value = DRAWER_ACTION_TYPES.ADD

  handleResetPermissionData()

  currentDialogConfig.value = {
    isVisible: true,
    data: undefined,
  }
}

// 👉 Open Update Dialog
async function handleOpenEditDialog(permissionId: string) {
  currentDialogAction.value = DRAWER_ACTION_TYPES.EDIT

  await fetchPermissionDetail(permissionId)

  currentPermissionData.value = {
    id: permissionDetail.value?.id,
    role_id: permissionDetail.value?.role_id,
    action: permissionDetail.value?.action,
    subject: permissionDetail.value?.subject,
  }

  currentDialogConfig.value = {
    isVisible: true,
    data: currentPermissionData.value,
  }
}

// 👉 Create or Update
async function handlePermissionChange(payload: Partial<Permission>) {
  if (currentDialogAction.value === DRAWER_ACTION_TYPES.EDIT) {
    const { id, ...body } = payload

    await updatePermission(id!, body)

    nextTick(() => {
      handleResetPermissionData()
    })

    await fetchPermissions()
  }
  else {
    await createPermission(payload)

    await fetchPermissions()
  }
}

// 👉 Delete
const isDeleteDialogVisible = ref(false)

function handleOpenDeleteDialog(permissionId: string) {
  isDeleteDialogVisible.value = true
  currentPermissionId.value = permissionId
}

async function handleDeletePermission(isConfirm: boolean) {
  if (isConfirm) {
    await deletePermission(currentPermissionId.value)

    await fetchPermissions()
  }
}

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
                <VBtn
                  @click="handleOpenEditDialog(permission.id)"
                >
                  Edit
                </VBtn>

                <VBtn
                  @click="handleOpenDeleteDialog(permission.id)"
                >
                  Delete
                </VBtn>
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
      @update:permission-data="handlePermissionChange"
    />

    <AppDialog
      :is-dialog-visible="isDeleteDialogVisible"
      title="Delete permission"
      label="Are you sure you want to delete this permission?"
      type="warning"
      @confirm="handleDeletePermission($event)"
      @update:is-dialog-visible="isDeleteDialogVisible = $event"
    />
  </div>
</template>
