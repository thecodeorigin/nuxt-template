<script setup lang="ts">
import { useRoleStore } from '~/stores/admin/role'

definePageMeta({
  sidebar: {
    title: 'Test Roles',
    icon: { icon: 'ri-id-card-line' },
  },
})
const roleStore = useRoleStore()
const { roleList, totalRoles, roleDetail } = storeToRefs(roleStore)
const { fetchRoles, fetchRoleDetail } = roleStore

const currentRoleId = ref<string>('')

useLazyAsyncData(
  async () => {
    await fetchRoles()
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
            {{ role.name }}
            <br>
            {{ role.id }}
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
          label="User ID"
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

      <VBtn>
        Role create
      </VBtn>
    </div>

    <!-- <AddEditRoleDialog
      :is-dialog-visible="true"
    /> -->
  </div>
</template>

<style lang="scss" scoped>

</style>
