<script setup lang="ts">
import type { RoleWithPermissions } from '@base/stores/admin/role'
import RoleCards from '@base/components/roles/RoleCards.vue'
import { usePermissionStore } from '@base/stores/admin/permission'
import { useRoleStore } from '@base/stores/admin/role'
import { sortBy } from 'lodash-es'
// import UserList from '@base/components/roles/UserList.vue'

definePageMeta({
  action: 'manage',
  subject: 'Role',
  sidebar: {
    title: 'Roles',
    icon: { icon: 'ri-shield-user-line' },
  },
})

const { t } = useI18n()

const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('Roles')

const roleStore = useRoleStore()
const permissionStore = usePermissionStore()

const { data: roleData, refresh: reFetchRoles } = useLazyAsyncData('roles', () => roleStore.fetchRoles(), {
  server: false,
})

const { data: permissionData } = useLazyAsyncData('permissions', () => permissionStore.fetchPermissions({ page: 1, limit: 100, keyword: '' }), {
  server: false,
  transform(permissionData) {
    return {
      ...permissionData,
      data: sortBy(permissionData.data, ['subject', 'action']),
    }
  },
})

async function handleSubmitEdit(role: { id: string, name: string, permissions: string[] }) {
  await roleStore.updateRole(role.id, role)

  notifySuccess({
    content: t('Role updated successfully'),
  })

  await reFetchRoles()
}

async function handleSubmitCreate(role: { name: string, permissions: string[] }) {
  await roleStore.createRole(role)

  notifySuccess({
    content: t('Role created successfully'),
  })

  await reFetchRoles()
}

async function handleSubmitDelete(role: RoleWithPermissions) {
  await roleStore.deleteRole(role.id)

  notifySuccess({
    content: t('Role deleted successfully'),
  })

  await reFetchRoles()
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">
        Roles List
      </h4>
      <p class="text-body-1 mb-0">
        A role provided access to predefined menus and features so that depending on assigned role an administrator can have access to what he need
      </p>
    </VCol>

    <!-- 👉 Roles Cards -->
    <VCol cols="12">
      <RoleCards
        :roles="roleData?.data || []"
        :permissions="permissionData?.data || []"
        @edit="handleSubmitEdit"
        @create="handleSubmitCreate"
        @delete="handleSubmitDelete"
      />
    </VCol>
  </VRow>
</template>
