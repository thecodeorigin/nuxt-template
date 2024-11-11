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
const { t } = useI18n()
const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('Users')

// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

// Update data table options
function updateOptions(options: any) {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

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

// Headers
const headers = [
  { title: 'Avatar', key: 'avatar_url' },
  { title: 'Full Name', key: 'full_name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

function resolveUserStatusVariant(stat: string) {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'

  return 'primary'
}

function resolveUserRoleVariant(role: string) {
  const roleLowerCase = role?.toLowerCase()

  if (roleLowerCase === 'visitor')
    return { color: 'success', icon: 'ri-user-line' }
  if (roleLowerCase === 'user')
    return { color: 'warning', icon: 'ri-edit-box-line' }
  if (roleLowerCase === 'admin')
    return { color: 'primary', icon: 'ri-vip-crown-line' }

  return { color: 'success', icon: 'ri-user-line' }
}

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

    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Filters</VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            sm="4"
          >
            <VSelect
              v-model="selectedRole"
              label="Select Role"
              placeholder="Select Role"
              :items="roles"
              clearable
              clear-icon="ri-close-line"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <VSelect
              v-model="selectedPlan"
              label="Select Plan"
              placeholder="Select Plan"
              :items="plans"
              clearable
              clear-icon="ri-close-line"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <VSelect
              v-model="selectedStatus"
              label="Select Status"
              placeholder="Select Status"
              :items="status"
              clearable
              clear-icon="ri-close-line"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4 align-center">
        <!-- 👉 Export button -->
        <VBtn
          variant="outlined"
          color="secondary"
          prepend-icon="ri-upload-2-line"
        >
          Export
        </VBtn>

        <VSpacer />

        <div class="d-flex align-center gap-4 flex-wrap">
          <!-- 👉 Search  -->
          <div class="app-user-search-filter">
            <VTextField
              v-model="searchQuery"
              placeholder="Search User"
              density="compact"
            />
          </div>
          <!-- 👉 Add user button -->
          <VBtn @click="handleOpenAddDrawer()">
            Add New User
          </VBtn>
        </div>
      </VCardText>

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="userList"
        :items-length="totalUsers"
        :headers="headers"
        :sort-by="sortBy"
        :sort-desc="orderBy === 'desc'"
        class="rounded-0"
        @update:options="updateOptions"
      >
        <!-- Avatar -->
        <template #item.avatar_url="{ item }">
          <VAvatar
            size="32"
            :variant="!item.avatar_url ? 'tonal' : undefined"
            :color="!item.avatar_url ? resolveUserRoleVariant(item.role.name).color : undefined"
            :src="item.avatar_url"
          >
            <span v-if="!item.avatar_url">
              {{ item.email[0]?.toUpperCase() }}
            </span>

            <VImg
              v-else
              :src="item.avatar_url"
            />
          </VAvatar>
        </template>

        <!-- Full Name -->
        <template #item.full_name="{ item }">
          {{ item.full_name || 'N/A' }}
        </template>

        <!-- Email -->
        <template #item.email="{ item }">
          {{ item.email || 'N/A' }}
        </template>

        <!-- Role -->
        <template #item.role="{ item }">
          <div class="d-flex gap-2">
            <!-- <VIcon
              :icon="resolveUserRoleVariant(item.role).icon"
              :color="resolveUserRoleVariant(item.role).color"
              size="22"
            /> -->
            <span class="text-capitalize text-high-emphasis">{{ item.role.name }}</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            class="text-capitalize"
          >
            {{ item.status }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center gap-2">
            <IconBtn
              size="small"
              @click="handleOpenDeleteDialog(item.id)"
            >
              <VIcon icon="ri-delete-bin-7-line" />
            </IconBtn>

            <IconBtn
              size="small"
              color="medium-emphasis"
            >
              <VIcon icon="ri-more-2-line" />

              <VMenu activator="parent">
                <VList>
                  <VListItem link>
                    <template #prepend>
                      <VIcon icon="ri-download-line" />
                    </template>
                    <VListItemTitle>Download</VListItemTitle>
                  </VListItem>

                  <VListItem @click="handleOpenEditDrawer(item.id)">
                    <template #prepend>
                      <VIcon icon="ri-edit-box-line" />
                    </template>
                    <VListItemTitle>Edit</VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </IconBtn>
          </div>
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>

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
