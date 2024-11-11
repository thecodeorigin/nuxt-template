<script setup lang="ts">
import { DRAWER_ACTION_TYPES } from '~/constant/organization'
import { type Role, useRoleStore } from '~/stores/admin/role'
import type { DrawerActionTypes } from '~/utils/types'

definePageMeta({
  sidebar: {
    title: 'Test Roles',
    icon: { icon: 'ri-id-card-line' },
  },
})

interface RoleDialog {
  isVisible: boolean
  data?: Partial<Role>
}

const roleStore = useRoleStore()
const { roleList, totalRoles, roleDetail } = storeToRefs(roleStore)
const { fetchRoles, fetchRoleDetail, createRole, updateRole, deleteRole, joinRolePermissions } = roleStore

const currentRoleId = ref<string>('')
const currentRoleData = ref<Partial<Role>>({
  id: '',
  name: '',
})
const currentDialogAction = ref<DrawerActionTypes>('add')
const currentDialogConfig = ref<RoleDialog>({
  isVisible: false,
  data: undefined,
})

function handleResetRoleData() {
  currentRoleData.value = {
    id: '',
    name: '',
  }
}

// 👉 Open Add Drawer and Create
function handleOpenAddDialog() {
  currentDialogAction.value = DRAWER_ACTION_TYPES.ADD

  handleResetRoleData()

  currentDialogConfig.value = {
    isVisible: true,
    data: undefined,
  }
}

// 👉 Open Edit Drawer And Update
async function handleOpenEditDialog(roleId: string) {
  currentDialogAction.value = DRAWER_ACTION_TYPES.EDIT

  await fetchRoleDetail(roleId)

  currentRoleData.value = {
    id: roleDetail.value?.id,
    name: roleDetail.value?.name,
  }

  currentDialogConfig.value = {
    isVisible: true,
    data: currentRoleData.value,
  }
}

// 👉 Create or Update
async function handleRoleChange(data: Partial<Role>) {
  if (currentDialogAction.value === DRAWER_ACTION_TYPES.EDIT) {
    const { id, ...body } = data

    await updateRole(id!, body)

    nextTick(() => {
      handleResetRoleData()
    })

    await fetchRoles()
  }
  else {
    await createRole(data)

    await fetchRoles()
  }
}

// 👉 Delete
const isDeleteDialogVisible = ref(false)

function handleOpenDeleteDialog(permissionId: string) {
  isDeleteDialogVisible.value = true

  currentRoleId.value = permissionId
}

async function handleConfirmDeleteRole(isConfirm: boolean) {
  if (isConfirm) {
    await deleteRole(currentRoleId.value)

    await fetchRoles()
  }
}

useLazyAsyncData(
  async () => {
    await fetchRoles()
    await joinRolePermissions()
  },
)
</script>

<template>
  <div>
    <h1 class="text-center">
      Test Role
    </h1>
    createRole
    <div>
      <h2 class="mb-2">
        Role list:
      </h2>
      <div v-if="roleList.length > 0">
        <p>
          Total Roles: {{ totalRoles }}
        </p>
        <br>
        <ul>
          <li
            v-for="role in roleList"
            :key="role.id"
          >
            <div class="d-flex align-center justify-space-between">
              {{ role.name }}
              <br>
              {{ role.id }}

              <div class="d-flex align-center gap-2">
                <VBtn
                  @click="handleOpenEditDialog(role.id)"
                >
                  Edit
                </VBtn>
                <VBtn
                  @click="handleOpenDeleteDialog(role.id)"
                >
                  Delete
                </VBtn>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-else>
        No Role
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        Role detail:
      </h2>

      <div class="mb-2 d-flex align-center gap-2">
        <VTextField
          v-model="currentRoleId"
          label="Role ID"
        />

        <VBtn
          @click="fetchRoleDetail(currentRoleId)"
        >
          Fetch Role
        </VBtn>
      </div>

      <div v-if="roleDetail">
        <p>
          ID: {{ roleDetail.id }}
        </p>
        <p>
          Name: {{ roleDetail.name }}
        </p>
      </div>

      <div v-else>
        Not found
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        Role create:
      </h2>

      <VBtn @click="handleOpenAddDialog">
        Role create
      </VBtn>
    </div>

    <AddEditRoleDialog
      v-model:is-dialog-visible="currentDialogConfig.isVisible"
      :role-data="currentDialogConfig.data"
      @update:role-permissions="handleRoleChange"
    />

    <AppDialog
      :is-dialog-visible="isDeleteDialogVisible"
      title="Delete role"
      label="Are you sure you want to delete this role?"
      type="warning"
      @confirm="handleConfirmDeleteRole($event)"
      @update:is-dialog-visible="isDeleteDialogVisible = $event"
    />
  </div>
</template>

<style lang="scss" scoped>

</style>
