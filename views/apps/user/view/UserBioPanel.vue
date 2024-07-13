<script setup lang="ts">
const { currentUser } = useAuthStore()

const userAvatar = computed(() => currentUser?.avatar_url || currentUser?.image || '')
const userFullname = computed(() => currentUser?.full_name || currentUser?.name || '')
const userEmail = computed(() => currentUser?.email || '')
const userRole = computed(() => currentUser?.role.name || '')

const standardPlan = {
  plan: 'Standard',
  price: 99,
  benefits: ['10 Users', 'Up to 10GB storage', 'Basic Support'],
}

const isUserInfoEditDialogVisible = ref(false)
const isUpgradePlanDialogVisible = ref(false)

// 👉 Role variant resolver
function resolveUserRoleVariant(role: string) {
  if (role === 'subscriber')
    return { color: 'primary', icon: 'ri-user-line' }
  if (role === 'author')
    return { color: 'warning', icon: 'ri-settings-2-line' }
  if (role === 'maintainer')
    return { color: 'success', icon: 'ri-database-2-line' }
  if (role === 'Editor')
    return { color: 'info', icon: 'ri-pencil-line' }
  if (role === 'Admin')
    return { color: 'error', icon: 'ri-server-line' }

  return { color: 'primary', icon: 'ri-user-line' }
}
</script>

<template>
  <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">
      <VCard v-if="currentUser">
        <VCardText class="text-center pt-12 pb-6">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            :size="120"
            :color="!userAvatar ? 'primary' : undefined"
            :variant="!userAvatar ? 'tonal' : undefined"
          >
            <VImg
              v-if="userAvatar"
              :src="userAvatar"
            />
            <span
              v-else
              class="text-5xl font-weight-medium"
            >
              {{ avatarText(userFullname) }}
            </span>
          </VAvatar>

          <!-- 👉 User fullName -->
          <h5 class="text-h5 mt-4">
            {{ userFullname }}
          </h5>

          <!-- 👉 Role chip -->
          <VChip
            :color="resolveUserRoleVariant(userRole).color"
            size="small"
            class="text-capitalize mt-4"
          >
            {{ userRole }}
          </VChip>
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

            <div>
              <h5 class="text-h5">
                {{ kFormatter(5) }}
              </h5>
              <span>Task Done</span>
            </div>
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
                icon="ri-briefcase-line"
              />
            </VAvatar>

            <div>
              <h5 class="text-h5">
                {{ kFormatter(5) }}
              </h5>
              <span>Project Done</span>
            </div>
          </div>
        </VCardText>

        <!-- 👉 Details -->
        <VCardText class="pb-6">
          <h5 class="text-h5">
            Details
          </h5>

          <VDivider class="my-4" />

          <!-- 👉 User Details list -->
          <VList class="card-list">
            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  Email:
                </span>
                <span class="text-body-1">{{ userEmail }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">Role: </span>
                <span class="text-capitalize text-body-1">{{ userRole }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  Phone:
                </span>
                <span class="text-body-1">{{ currentUser.phone }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  Language:
                </span>
                <span class="text-body-1">{{ currentUser.language }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  Country:
                </span>
                <span class="text-body-1">{{ currentUser.country }}</span>
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
            Edit
          </VBtn>
          <VBtn
            variant="outlined"
            color="error"
          >
            Suspend
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->

    <!-- SECTION Current Plan -->
    <VCol cols="12">
      <VCard
        flat
        class="current-plan"
      >
        <VCardText class="d-flex">
          <!-- 👉 Standard Chip -->
          <VChip
            color="primary"
            size="small"
          >
            Standard
          </VChip>

          <VSpacer />

          <!-- 👉 Current Price  -->
          <div class="d-flex align-center">
            <sup class="text-primary text-lg font-weight-medium">$</sup>
            <h1 class="text-h1 text-primary">
              99
            </h1>
            <sub class="mt-5"><h6 class="text-h6 font-weight-regular">month</h6></sub>
          </div>
        </VCardText>

        <VCardText>
          <!-- 👉 Price Benefits -->
          <VList class="card-list">
            <VListItem
              v-for="benefit in standardPlan.benefits"
              :key="benefit"
            >
              <div class="d-flex align-center">
                <VIcon
                  size="10"
                  color="medium-emphasis"
                  class="me-2"
                  icon="ri-circle-fill"
                />
                <div class="text-medium-emphasis">
                  {{ benefit }}
                </div>
              </div>
            </VListItem>
          </VList>

          <!-- 👉 Days -->
          <div class="my-6">
            <div class="d-flex mb-1">
              <h6 class="text-h6">
                Days
              </h6>
              <VSpacer />
              <h6 class="text-h6">
                26 of 30 Days
              </h6>
            </div>

            <!-- 👉 Progress -->
            <VProgressLinear
              rounded
              :model-value="86"
              color="primary"
            />

            <p class="text-sm mt-1">
              4 days remaining
            </p>
          </div>

          <!-- 👉 Upgrade Plan -->
          <VBtn
            block
            @click="isUpgradePlanDialogVisible = true"
          >
            Upgrade Plan
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </VRow>

  <!-- 👉 Edit user info dialog -->
  <!-- <UserInfoEditDialog
    v-model:isDialogVisible="isUserInfoEditDialogVisible"
    :user-data="props.user"
  /> -->

  <!-- 👉 Upgrade plan dialog -->
  <UserUpgradePlanDialog v-model:isDialogVisible="isUpgradePlanDialogVisible" />
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
