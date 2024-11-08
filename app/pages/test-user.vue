<script setup lang="ts">
import { type User, useUserStore } from '@base/stores/admin/user'
import { DRAWER_ACTION_TYPES } from '~/constant/organization'
import type { DrawerConfig } from '~/utils/types'

definePageMeta({
  sidebar: {
    title: 'Test Users',
    icon: { icon: 'ri-id-card-line' },
  },
})

const userStore = useUserStore()
const { userList, userDetail, totalUsers } = storeToRefs(userStore)
const { fetchUserList, fetchUserDetail, updateUser, deleteUser, createUser } = userStore

const currentUserId = ref<string>('')
const currentUserData = ref<Partial<User>>({
  id: '',
  email: '',
  phone: '',
  provider: '',
  full_name: '',
  avatar_url: '',
  role_id: '',
  organization_id: null,
  country: '',
  language: '',
  postcode: '',
  status: '',
  address: '',
  city: '',
  email_verified: null,
})
const currentDrawerConfig = ref<DrawerConfig>({
  isVisible: false,
  type: DRAWER_ACTION_TYPES.ADD,
})

// 👉 Reset User Data
function handleResetUserData() {
  currentUserData.value = {
    id: '',
    email: '',
    phone: '',
    provider: '',
    full_name: '',
    avatar_url: '',
    role_id: '',
    organization_id: null,
    country: '',
    language: '',
    postcode: '',
    status: '',
    address: '',
    city: '',
    email_verified: null,
  }
}

// 👉 Fetch User Detail
async function handleFetchUserDetail(userId: string) {
  await fetchUserDetail(userId)
}

function handleOpenAddDrawer() {
  handleResetUserData()

  currentDrawerConfig.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.ADD,
  }
}

async function handleOpenEditDrawer(userId: string) {
  await handleFetchUserDetail(userId)

  currentUserData.value = {
    id: userDetail.value?.id,
    email: userDetail.value?.email,
    phone: userDetail.value?.phone,
    provider: userDetail.value?.provider,
    full_name: userDetail.value?.full_name,
    avatar_url: userDetail.value?.avatar_url,
    role_id: userDetail.value?.role_id,
    organization_id: userDetail.value?.organization_id,
    country: userDetail.value?.country,
    language: userDetail.value?.language,
    postcode: userDetail.value?.postcode,
    status: userDetail.value?.status,
    address: userDetail.value?.address,
    city: userDetail.value?.city,
    email_verified: userDetail.value?.email_verified,
  }

  currentDrawerConfig.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.EDIT,
  }
}

// 👉 Add User
async function handleAddNewUser(userPayload: Partial<User>) {
  await createUser(userPayload)

  await fetchUserList()
}

// 👉 Update User
async function handleUpdateUser(userId: string, payload: Partial<User>) {
  await updateUser(userId, payload)

  handleResetUserData()

  await fetchUserList()
}

// 👉 Create or Update
async function handleUserChange(payload: Partial<User>, type: 'add' | 'edit') {
  if (type === DRAWER_ACTION_TYPES.EDIT) {
    const { id, ...body } = payload
    await handleUpdateUser(id!, body)
    nextTick(() => {
      handleResetUserData()
    })
  }
  else {
    await handleAddNewUser(payload)
  }
}

// 👉 Delete
const isDeleteDialogVisible = ref(false)

function handleOpenDeleteDialog(permissionId: string) {
  isDeleteDialogVisible.value = true
  currentUserId.value = permissionId
}

async function handleConfirmDeleteUser(isConfirm: boolean) {
  if (isConfirm) {
    await deleteUser(currentUserId.value)

    await fetchUserList()
  }
}

useLazyAsyncData(
  async () => {
    await fetchUserList()
  },
)
</script>

<template>
  <div>
    <div>
      <h1 class="text-center">
        Test user
      </h1>

      <div>
        <h2 class="mb-2">
          user list:
        </h2>
        <div v-if="userList.length > 0">
          <p>
            Total users: {{ totalUsers }}
          </p>
          <br>

          <ul>
            <li
              v-for="user in userList"
              :key="user.id"
            >
              <div class="d-flex align-center justify-space-between">
                <p>
                  {{ user.full_name }}
                </p>

                <div class="d-flex align-center gap-2">
                  <VBtn @click="handleOpenEditDrawer(user.id)">
                    Edit
                  </VBtn>

                  <VBtn @click="handleOpenDeleteDialog(user.id)">
                    Delete
                  </VBtn>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else>
          No users
        </div>
      </div>

      <div>
        <h2 class="mb-2 mt-8 d-flex align-center">
          user detail:
        </h2>

        <div class="mb-2 d-flex align-center gap-2">
          <VTextField
            v-model="currentUserId"
            label="User ID"
          />

          <VBtn
            @click="fetchUserDetail(currentUserId)"
          >
            Fetch User
          </VBtn>
        </div>

        <div v-if="userDetail">
          <p>
            ID: {{ userDetail.id }}
          </p>
          <p>
            Name: {{ userDetail.full_name }}
          </p>
          <p>
            Email: {{ userDetail.email }}
          </p>
        </div>

        <div v-else>
          Not found
        </div>
      </div>

      <div>
        <h2 class="mb-2 mt-8 d-flex align-center">
          user create:
        </h2>

        <VBtn
          @click="handleOpenAddDrawer()"
        >
          Create User
        </VBtn>
      </div>
    </div>

    <UserDrawer
      v-model="currentUserData"
      :drawer-config="currentDrawerConfig"
      @update:is-drawer-open="currentDrawerConfig.isVisible = $event"
      @update:model-value="handleUserChange"
    />

    <AppDialog
      :is-dialog-visible="isDeleteDialogVisible"
      title="Delete user"
      label="Are you sure you want to delete this user?"
      type="warning"
      @confirm="handleConfirmDeleteUser($event)"
      @update:is-dialog-visible="isDeleteDialogVisible = $event"
    />
  </div>
</template>

<style lang="scss" scoped>

</style>
