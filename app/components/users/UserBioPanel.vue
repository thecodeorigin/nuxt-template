<script setup lang="ts">
import { type User, type UserWithRoles, useUserStore } from '@base/stores/admin/user'
import UserDrawer from './UserDrawer.vue'
import { avatarText } from '#imports'

defineProps<{
  user: UserWithRoles
}>()

const isUserInfoEditDialogVisible = ref(false)
const isUpgradePlanDialogVisible = ref(false)

const route = useRoute('admin-users-id')

const userStore = useUserStore()

async function handleSubmitEdit(payload: Partial<User>) {
  await userStore.updateUser(route.params.id, payload)
}
</script>

<template>
  <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">
      <VCard v-if="user">
        <VCardText class="text-center pt-12 pb-6">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            :size="120"
            :color="!user.avatar_url ? 'primary' : undefined"
            :variant="!user.avatar_url ? 'tonal' : undefined"
          >
            <VImg
              v-if="user.avatar_url"
              :src="user.avatar_url"
            />
            <span
              v-else
              class="text-5xl font-weight-medium"
            >
              {{ avatarText(user.full_name || 'User') }}
            </span>
          </VAvatar>

          <!-- 👉 User fullName -->
          <h5 class="text-h5 mt-4">
            {{ user.full_name }}
          </h5>

          <h6 class="text-body-1">
            {{ user.email }}
          </h6>
        </VCardText>

        <VCardText class="d-flex justify-center flex-wrap gap-6 pb-6">
          <!-- 👉 Done task -->
          <div class="d-flex align-center me-8">
            <VAvatar
              :size="40"
              rounded
              color="primary"
              variant="tonal"
              class="me-4"
            >
              <VIcon
                size="24"
                icon="ri-check-line"
              />
            </VAvatar>

            <h5 class="text-h5">
              {{ $t('Verified') }}
            </h5>
          </div>

          <!-- 👉 Done Project -->
          <div class="d-flex align-center me-4">
            <VAvatar
              :size="44"
              rounded
              color="primary"
              variant="tonal"
              class="me-4"
            >
              <VIcon
                size="24"
                icon="ri-shield-user-line"
              />
            </VAvatar>

            <h5 class="text-h5">
              {{ user.roles[0]?.role.name || $t('No role') }}
            </h5>
          </div>
        </VCardText>

        <!-- 👉 Details -->
        <VCardText class="pb-6">
          <VList class="card-list">
            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">{{ $t('Phone') }}:</span>
                <span class="text-body-1">
                  {{ user.phone }}
                </span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  {{ $t('Status') }}:
                </span>
                <span class="text-body-1 text-capitalize">{{ user.status }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">{{ $t('Role') }}: </span>
                <span class="text-capitalize text-body-1">{{ user.roles[0]?.role.name || '' }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  {{ $t('Country') }}:
                </span>
                <span class="text-body-1">
                  {{ user.country }}
                </span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  {{ $t('ZIP Code') }}:
                </span>
                <span class="text-body-1">{{ user.postcode }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  {{ $t('Language') }}:
                </span>
                <span class="text-body-1">{{ user.language }}</span>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>

        <!-- 👉 Edit and Suspend button -->
        <VCardText class="d-flex justify-center">
          <VBtn
            variant="elevated"
            class="me-4"
            @click="isUserInfoEditDialogVisible = true"
          >
            {{ $t('Edit') }}
          </VBtn>
          <VBtn
            variant="outlined"
            color="error"
          >
            {{ $t('Suspend') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- 👉 Edit user info dialog -->
  <UserDrawer
    v-model="isUserInfoEditDialogVisible"
    :user="user"
    @edit="handleSubmitEdit"
  />

  <!-- 👉 Upgrade plan dialog -->
  <UserUpgradePlanDialog v-model:is-dialog-visible="isUpgradePlanDialogVisible" />
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.5rem;
}

.current-plan {
  border: 2px solid rgb(var(--v-theme-primary));
}

.text-capitalize {
  text-transform: capitalize !important;
}
</style>
