<script setup lang="ts">
import avatar1 from '@images/avatars/avatar-1.png'
import avatar10 from '@images/avatars/avatar-10.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import avatar7 from '@images/avatars/avatar-7.png'
import avatar8 from '@images/avatars/avatar-8.png'
import avatar9 from '@images/avatars/avatar-9.png'
import poseM from '@images/pages/pose_m1.png'

interface Permission {
  name: string
  read: boolean
  write: boolean
  create: boolean
}

interface RoleDetails {
  name: string
  permissions: Permission[]
}

interface Roles {
  role: string
  users: string[]
  details: RoleDetails
}

// 👉 Roles List
const roles = ref<Roles[]>([
  {
    role: 'Administrator',
    users: [avatar1, avatar2, avatar3, avatar4],
    details: {
      name: 'Administrator',
      permissions: [
        {
          name: 'User Management',
          read: true,
          write: true,
          create: true,
        },
        {
          name: 'Disputes Management',
          read: true,
          write: true,
          create: true,
        },
        {
          name: 'API Control',
          read: true,
          write: true,
          create: true,
        },
      ],
    },
  },
  {
    role: 'Manager',
    users: [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7],
    details: {
      name: 'Manager',
      permissions: [
        {
          name: 'Reporting',
          read: true,
          write: true,
          create: false,
        },
        {
          name: 'Payroll',
          read: true,
          write: true,
          create: true,
        },
        {
          name: 'User Management',
          read: true,
          write: true,
          create: true,
        },
      ],
    },
  },
  {
    role: 'Users',
    users: [avatar1, avatar2, avatar3, avatar4, avatar5],
    details: {
      name: 'Users',
      permissions: [
        {
          name: 'User Management',
          read: true,
          write: false,
          create: false,
        },
        {
          name: 'Content Management',
          read: true,
          write: false,
          create: false,
        },
        {
          name: 'Disputes Management',
          read: true,
          write: false,
          create: false,
        },
        {
          name: 'Database Management',
          read: true,
          write: false,
          create: false,
        },
      ],
    },
  },
  {
    role: 'Support',
    users: [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6],
    details: {
      name: 'Support',
      permissions: [
        {
          name: 'Repository Management',
          read: true,
          write: true,
          create: false,
        },
        {
          name: 'Content Management',
          read: true,
          write: true,
          create: false,
        },
        {
          name: 'Database Management',
          read: true,
          write: true,
          create: false,
        },
      ],
    },
  },
  {
    role: 'Restricted User',
    users: [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10],
    details: {
      name: 'Restricted User',
      permissions: [
        {
          name: 'User Management',
          read: true,
          write: false,
          create: false,
        },
        {
          name: 'Content Management',
          read: true,
          write: false,
          create: false,
        },
        {
          name: 'Disputes Management',
          read: true,
          write: false,
          create: false,
        },
        {
          name: 'Database Management',
          read: true,
          write: false,
          create: false,
        },
      ],
    },
  },
])

const isRoleDialogVisible = ref(false)

const roleDetail = ref<RoleDetails>()

const isAddRoleDialogVisible = ref(false)

const editPermission = (value: RoleDetails) => {
  isRoleDialogVisible.value = true
  roleDetail.value = value
}
</script>

<template>
  <VRow>
    <!-- 👉 Roles -->
    <VCol
      v-for="item in roles"
      :key="item.role"
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard>
        <VCardText class="d-flex align-center pb-4">
          <span>Total {{ item.users.length }} users</span>

          <VSpacer />

          <div class="v-avatar-group">
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
          </div>
        </VCardText>

        <VCardText>
          <div class="d-flex justify-space-between align-end">
            <div>
              <h5 class="text-h5 mb-1">
                {{ item.role }}
              </h5>
              <a
                href="javascript:void(0)"
                @click="editPermission(item.details)"
              >
                Edit Role
              </a>
            </div>

            <IconBtn
              color="secondary"
              class="mt-n2"
            >
              <VIcon icon="ri-file-copy-line" />
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
                @click="isAddRoleDialogVisible = true"
              >
                Add Role
              </VBtn>
              <span class="text-end">Add new role, if it doesn't exist.</span>
            </VCardText>
          </VCol>
        </VRow>
      </VCard>
      <AddEditRoleDialog v-model:is-dialog-visible="isAddRoleDialogVisible" />
    </VCol>
  </VRow>

  <AddEditRoleDialog
    v-model:is-dialog-visible="isRoleDialogVisible"
    v-model:role-permissions="roleDetail"
  />
</template>
