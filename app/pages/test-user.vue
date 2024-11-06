<script setup lang="ts">
import AddNewUserDrawer from '@base/components/users/AddNewUserDrawer.vue'
import { type User, useUserStore } from '@base/stores/admin/user'

definePageMeta({
  sidebar: {
    title: 'Test Users',
    icon: { icon: 'ri-id-card-line' },
  },
})

const userStore = useUserStore()
const { userList, userDetail, totalUsers } = storeToRefs(userStore)
const { fetchUserList, fetchUserDetail, updateUser, deleteUser, createUser } = userStore

const currentUserId = ref<string>('adeadb89-ce6c-4396-ab28-e4451ce0f456')
const currentUserName = ref<string>('')
const isAddNewUserDrawerVisible = ref(false)

async function handleUpdateUserName(userId: string, userName: string) {
  await updateUser(userId, { full_name: userName })

  currentUserName.value = ''

  await fetchUserList()
}

async function handleAddNewUser(userPayload: Partial<User>) {
  await createUser(userPayload)
}

async function handleDeleteUser(userId: string) {
  await deleteUser(userId)
}

useLazyAsyncData(
  async () => {
    await fetchUserList()
  },
)
</script>

<template>
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
            {{ user.full_name }}
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
        user update:
      </h2>

      <div class="mb-2 d-flex align-center gap-2">
        <VTextField
          v-model="currentUserId"
          label="User ID"
        />

        <VTextField
          v-model="currentUserName"
          label="User Name"
        />

        <VBtn
          @click="handleUpdateUserName(currentUserId, currentUserName)"
        >
          Update User
        </VBtn>
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        user create:
      </h2>

      <VBtn
        @click="isAddNewUserDrawerVisible = true"
      >
        Create User
      </VBtn>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        user delete:
      </h2>

      <div class="mb-2 d-flex align-center gap-2">
        <VTextField
          v-model="currentUserId"
          label="User ID"
        />

        <VBtn
          @click="handleDeleteUser(currentUserId)"
        >
          Delete User
        </VBtn>
      </div>
    </div>
  </div>

  <AddNewUserDrawer
    v-model:is-drawer-open="isAddNewUserDrawerVisible"
    @user-data="handleAddNewUser"
  />
</template>

<style lang="scss" scoped>

</style>
