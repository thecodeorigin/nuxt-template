<script setup lang="ts">
import poseM from '@base/images/pages/pose_m1.png'

import type { RoleWithPermissions } from '@base/stores/admin/role'
import type { Permission } from '@base/stores/admin/permission'
import AddEditRoleDialog from './AddEditRoleDialog.vue'

defineProps<{
  roles: RoleWithPermissions[]
  permissions: Permission[]
}>()

const emit = defineEmits<{
  (e: 'edit', payload: { id: string, name: string, permissions: string[] }): void
  (e: 'create', payload: { id: string, name: string, permissions: string[] }): void
  (e: 'delete', payload: RoleWithPermissions): void
}>()

const dialogVisible = ref(false)

const roleSelected = ref<RoleWithPermissions | null>(null)

watch(dialogVisible, (value) => {
  if (!value) {
    roleSelected.value = null
  }
})

function handleCreate() {
  dialogVisible.value = true
}

function handleEdit(role: RoleWithPermissions) {
  dialogVisible.value = true

  roleSelected.value = role
}

async function handleDelete(role: RoleWithPermissions) {
  try {
    await confirmation({
      title: 'Delete Role',
      body: 'Are you sure you want to delete this role?',
    })

    emit('delete', role)
  }
  catch {}
}

function handleSubmitEdit(role: { id: string, name: string, permissions: string[] }) {
  emit('edit', role)

  dialogVisible.value = false
}

function handleSubmitCreate(role: { id: string, name: string, permissions: string[] }) {
  emit('create', role)

  dialogVisible.value = false
}
</script>

<template>
  <VRow class="card-container">
    <!-- 👉 Roles -->
    <VCol
      v-for="role in roles"
      :key="role.id"
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard>
        <VCardText class="d-flex align-center pb-4">
          <span>{{ $t('Total {number} permissions', { number: role.permissions.length }) }}</span>

          <VSpacer />

          <!-- <div class="v-avatar-group">
            <template
              v-for="(user, index) in item.users"
              :key="user"
            >
              <VAvatar
                v-if="item.users.length > 4 && item.users.length !== 4 && index < 3"
                size="40"
                :image="user"
              />

              <VAvatar
                v-if="item.users.length === 4"
                size="40"
                :image="user"
              />
            </template>
            <VAvatar
              v-if="item.users.length > 4"
              :color="$vuetify.theme.current.dark ? '#383B55' : '#F0EFF0'"
            >
              <span class="text-high-emphasis">
                +{{ item.users.length - 3 }}
              </span>
            </VAvatar>
          </div> -->
        </VCardText>

        <VCardText>
          <div class="d-flex justify-space-between align-end">
            <div>
              <h5 class="text-h5 mb-1">
                {{ role.name }}
              </h5>
              <a
                href="javascript:void(0)"
                @click="handleEdit(role)"
              >
                {{ $t('Edit Role') }}
              </a>
            </div>

            <IconBtn
              color="secondary"
              class="mt-n2"
              @click="handleDelete(role)"
            >
              <VIcon icon="ri-delete-bin-7-line" />
            </IconBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Add New Role -->
    <VCol
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard
        class="h-100"
        :ripple="false"
      >
        <VRow
          no-gutters
          class="h-100"
        >
          <VCol
            cols="5"
            class="d-flex flex-column justify-end align-center"
          >
            <img
              width="69"
              :src="poseM"
            >
          </VCol>

          <VCol cols="7">
            <VCardText class="d-flex flex-column align-end justify-end gap-4">
              <VBtn
                size="small"
                @click="handleCreate"
              >
                Create Role
              </VBtn>
              <span class="text-end">Add new role, if it doesn't exist.</span>
            </VCardText>
          </VCol>
        </VRow>
      </VCard>
      <AddEditRoleDialog
        v-model="dialogVisible"
        :role="roleSelected"
        :permissions="permissions"
        @edit="handleSubmitEdit"
      />
    </VCol>
  </VRow>

  <AddEditRoleDialog
    v-model="dialogVisible"
    :permissions="permissions"
    @create="handleSubmitCreate"
  />
</template>

<style lang="scss" scoped>
.card-container {
  max-height: 600px;
  margin-bottom: 2rem;
  overflow-y: auto;
}
</style>
