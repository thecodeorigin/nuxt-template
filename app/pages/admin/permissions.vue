<script setup lang="ts">
import type { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'
import type { InferSelectModel } from 'drizzle-orm'
import { usePermissionStore } from '@base/stores/admin/permission'

type Permission = InferSelectModel<typeof sysPermissionTable>

definePageMeta({
  sidebar: {
    title: 'Permissions',
    icon: { icon: 'ri-lock-2-line' },
  },
})

const permissionStore = usePermissionStore()

const formQuery = ref({
  page: 1,
  limit: 10,
  keyword: '',
  withCount: true,
})

function resetQuery() {
  formQuery.value.page = 1
  formQuery.value.limit = 10
  formQuery.value.keyword = ''
}

const { data: permissionData, status: permissionStatus, refresh: reFetchPermissions } = useLazyAsyncData(
  'permissions',
  () => permissionStore.fetchPermissions(formQuery.value),
  {
    watch: [formQuery],
  },
)

const permissionSelected = ref<Permission | null>(null)

const headers = [
  { title: 'Permission', key: 'action' },
  { title: 'Module', key: 'subject' },
  { title: 'Actions', key: 'actions', sortable: false },
]

function handleUpdateOptions(options: any) {
  formQuery.value.limit = options.itemsPerPage
  formQuery.value.page = options.page
}

const dialogVisible = ref(false)

function handleEditPermission(permission: Permission) {
  permissionSelected.value = permission
  dialogVisible.value = true
}

async function handleSubmitEdit(permission: Permission) {
  await permissionStore.updatePermission(permission.id, permission)

  permissionSelected.value = null
  dialogVisible.value = false

  resetQuery()
  await reFetchPermissions()
}

async function handleSubmitCreate(permission: Permission) {
  await permissionStore.createPermission(permission)

  dialogVisible.value = false

  resetQuery()
  await reFetchPermissions()
}

function handleCancelEdit() {
  permissionSelected.value = null
  dialogVisible.value = false
}

async function handleDeletePermission(permission: Permission) {
  try {
    await confirmation({
      title: 'Delete Permission',
      body: 'Are you sure you want to delete this permission?',
    })

    await permissionStore.deletePermission(permission.id)

    resetQuery()
    await reFetchPermissions()
  }
  catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center justify-sm-space-between justify-start gap-4 flex-wrap">
        <VTextField
          v-model="formQuery.keyword"
          density="compact"
          placeholder="Search Permission"
          style="max-inline-size: 15.625rem; min-inline-size: 12rem;"
        />

        <VBtn
          density="default"
          @click="dialogVisible = true"
        >
          Add Permission
        </VBtn>
      </VCardText>

      <VDataTable
        v-model:page="formQuery.page"
        v-model:items-per-page="formQuery.limit"
        :loading="permissionStatus === 'pending'"
        :headers="headers"
        :items="permissionData?.data || []"
        class="text-no-wrap"
        @update:options="handleUpdateOptions"
      >
        <template #item.actions="{ item }">
          <IconBtn
            size="small"
            @click="handleEditPermission(item)"
          >
            <VIcon icon="ri-edit-box-line" />
          </IconBtn>

          <IconBtn
            size="small"
            @click="handleDeletePermission(item)"
          >
            <VIcon icon="ri-delete-bin-7-line" />
          </IconBtn>
        </template>
        <template #bottom>
          <VDivider />

          <AppPagination
            v-model:page="formQuery.page"
            v-model:limit="formQuery.limit"
            :total="permissionData?.total || 0"
          />
        </template>
      </VDataTable>
    </VCard>

    <AddEditPermissionDialog
      v-model="dialogVisible"
      :permission="permissionSelected"
      @create="handleSubmitCreate"
      @edit="handleSubmitEdit"
      @cancel="handleCancelEdit"
    />
  </div>
</template>
