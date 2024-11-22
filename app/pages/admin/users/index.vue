<script setup lang="ts">
import type { RoleWithPermissions } from '@base/stores/admin/role'
import type { UserWithRoles } from '@base/stores/admin/user'
import { avatarText } from '#imports'
import { useRoleStore } from '@base/stores/admin/role'
import { useUserStore } from '@base/stores/admin/user'
import { match } from 'ts-pattern'

definePageMeta({
  sidebar: {
    title: 'Users',
    icon: { icon: 'ri-id-card-line' },
  },
})

const { t } = useI18n()

const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('Users')

const roleStore = useRoleStore()
const userStore = useUserStore()

const { data: roleData } = useLazyAsyncData('roles', () => roleStore.fetchRoles(), {
  server: false,
})

const selectedRole = ref<RoleWithPermissions | null>(null)

const userQuery = ref({
  page: 1,
  limit: 10,
  keyword: '',
})

const { data: userData, refresh: reFetchUsers } = useLazyAsyncData('users', () => userStore.fetchUsers(userQuery.value), {
  server: false,
})

const selectedUsers = ref<UserWithRoles[]>([])

const headers = [
  { title: 'User', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  // TODO: user credits / subscriptions
  // { title: 'Plan', key: 'plan' },
  { title: 'Verified', key: 'email_verified' },
  { title: 'Actions', key: 'actions', sortable: false },
]

function handleUpdateOptions(options: any) {
  userQuery.value.limit = options.itemsPerPage
  userQuery.value.page = options.page
}

function resolveUserRoleVariant(role: string) {
  const roleLowerCase = role.toLowerCase()

  return match(roleLowerCase)
    .with('admin', () => ({ color: 'primary', icon: 'ri-vip-crown-line' }))
    .with('editor', () => ({ color: 'warning', icon: 'ri-edit-box-line' }))
    .otherwise(() => ({ color: 'success', icon: 'ri-user-line' }))
}

async function handleDeleteUser(user: UserWithRoles) {
  try {
    await confirmation({
      title: 'Delete User',
      body: 'Are you sure you want to delete this user?',
    })

    await userStore.deleteUser(user.id)

    await reFetchUsers()
  }
  catch {}
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard class="mb-6">
        <VCardText class="d-flex flex-wrap gap-4 align-center">
          <!-- 👉 Export button -->
          <VSelect
            v-model="selectedRole"
            label="Select Role"
            placeholder="Select Role"
            :items="roleData?.data || []"
            clearable
            clear-icon="ri-close-line"
          />
          <VSpacer />
          <div class="d-flex align-center gap-4 flex-wrap">
            <!-- 👉 Search  -->
            <VTextField
              v-model="userQuery.keyword"
              placeholder="Search User"
              density="compact"
              style="min-width: 200px;"
            />
            <!-- 👉 Add user button -->
            <VBtn>
              {{ $t('Add New User') }}
            </VBtn>
          </div>
        </VCardText>

        <!-- SECTION datatable -->
        <VDataTable
          v-model:model-value="selectedUsers"
          :items="userData?.data || []"
          item-value="id"
          :headers="headers"
          show-select
          class="text-no-wrap rounded-0"
          @update:options="handleUpdateOptions"
        >
          <!-- User -->
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <VAvatar
                size="34"
                :variant="!item.avatar_url ? 'tonal' : undefined"
                :color="!item.avatar_url ? resolveUserRoleVariant(item.roles[0]?.role.name || '').color : undefined"
                class="me-3"
              >
                <VImg
                  v-if="item.avatar_url"
                  :src="item.avatar_url"
                />
                <span v-else>{{ avatarText(item.full_name || 'User') }}</span>
              </VAvatar>

              <div class="d-flex flex-column">
                <NuxtLink
                  :to="{ name: 'admin-users-id', params: { id: item.id } }"
                  class="text-link text-base font-weight-medium"
                >
                  {{ item.full_name }}
                </NuxtLink>

                <span class="text-sm text-medium-emphasis">{{ item.email }}</span>
              </div>
            </div>
          </template>
          <!-- Role -->
          <template #item.role="{ item }">
            <div class="d-flex gap-2">
              <VIcon
                :icon="resolveUserRoleVariant(item.roles[0]?.role.name || '').icon"
                :color="resolveUserRoleVariant(item.roles[0]?.role.name || '').color"
                size="22"
              />
              <span class="text-capitalize text-high-emphasis">
                {{ item.roles[0]?.role.name || $t('No role') }}
              </span>
            </div>
          </template>
          <!-- TODO: user credits / subscriptions -->
          <!-- <template #item.plan="{ item }">
            <span class="text-capitalize text-high-emphasis">{{ item.currentPlan }}</span>
          </template> -->
          <!-- Status -->
          <template #item.email_verified="{ item }">
            <VChip
              :color="item.email_verified ? 'success' : 'secondary'"
              size="small"
              class="text-capitalize"
            >
              {{ item.email_verified ? $t('Verified') : $t('Pending') }}
            </VChip>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <IconBtn
              size="small"
              @click="handleDeleteUser(item)"
            >
              <VIcon icon="ri-delete-bin-7-line" />
            </IconBtn>

            <IconBtn
              size="small"
            >
              <VIcon icon="ri-eye-line" />
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
                  <VListItem link>
                    <template #prepend>
                      <VIcon icon="ri-edit-box-line" />
                    </template>
                    <VListItemTitle>Edit</VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </IconBtn>
          </template>

          <template #bottom>
            <VDivider />

            <AppPagination
              v-model:page="userQuery.page"
              v-model:limit="userQuery.limit"
              :total="userData?.total || 0"
            />
          </template>
        </VDataTable>
      <!-- SECTION -->
      </VCard>
    </VCol>
  </VRow>
</template>
