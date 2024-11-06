<script setup lang="ts">
import { type User, useUserStore } from '@base/stores/admin/user'

definePageMeta({
  sidebar: {
    title: 'Test Permissions',
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
      Test Permissions
    </h1>

    <div>
      <h2 class="mb-2">
        Permission list:
      </h2>
      <div v-if="userList.length > 0">
        <p>
          Total permissions: {{ totalUsers }}
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
        No permissions
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        Permission detail:
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
        Permission update:
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
          Permission update
        </VBtn>
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        Permissions create:
      </h2>

      <VBtn
        @click="isAddNewUserDrawerVisible = true"
      >
        Permission create
      </VBtn>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        Permissions delete:
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
</template>

<style lang="scss" scoped>

</style>
