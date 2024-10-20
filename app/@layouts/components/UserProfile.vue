<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const { t } = useI18n()
const { signOut } = useAuth()
const authStore = useAuthStore()
const tokenDeviceStore = useTokenDeviceStore()
const userEmail = computed(() => authStore.currentUser?.email)
const userAvatar = computed(() => authStore.currentUser?.avatar_url)
const userFullname = computed(() => authStore.currentUser?.full_name)
const userRole = computed(() => authStore.currentUser?.role?.name || t('User'))

async function logout() {
  try {
    if (authStore.currentUser)
      await tokenDeviceStore.clearTokenDevice()

    await signOut({ redirect: false, callbackUrl: '/' })

    navigateTo({ name: 'auth-login' })
  }
  catch (error: any) {
    throw createError(error)
  }
}

const userProfileList: Array<{
  type: 'divider' | 'navItem'
  icon?: string
  title?: string
  to?: RouteLocationRaw
  chipsProps?: any
}> = [
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-user-line',
    title: t('Profile Settings'),
    to: { name: 'settings-tab', params: { tab: 'account' } },
  },
  {
    type: 'navItem',
    icon: 'ri-file-text-line',
    title: t('Billing & Plan'),
    to: { name: 'settings-tab', params: { tab: 'billing-plans' } },
    chipsProps: { color: 'error', text: '4', size: 'small' },
  },
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-money-dollar-circle-line',
    title: t('Pricing'),
    to: { name: 'settings-pricing' },
  },
  {
    type: 'navItem',
    icon: 'ri-question-line',
    title: 'FAQ',
    to: { name: 'faq' },
  },
]
</script>

<template>
  <VBadge
    v-if="authStore.currentUser"
    dot
    bordered
    location="bottom right"
    offset-x="2"
    offset-y="2"
    color="success"
    class="user-profile-badge"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
      :color="!userAvatar ? 'primary' : undefined"
      :variant="!userAvatar ? 'tonal' : undefined"
    >
      <VImg
        v-if="userAvatar"
        :src="userAvatar"
      />
      <VIcon
        v-else
        icon="ri-user-line"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <VListItem class="px-4">
            <div class="d-flex gap-x-2 align-center">
              <VAvatar
                :color="!userAvatar ? 'primary' : undefined"
                :variant="!userAvatar ? 'tonal' : undefined"
              >
                <VImg
                  v-if="userAvatar"
                  :src="userAvatar"
                />
                <VIcon
                  v-else
                  icon="ri-user-line"
                />
              </VAvatar>

              <div>
                <div class="text-body-2 font-weight-medium text-high-emphasis">
                  {{ userFullname || userEmail }}
                </div>
                <div class="text-capitalize text-caption text-disabled">
                  {{ userRole }}
                </div>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
                class="px-4"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template
                  v-if="item.chipsProps"
                  #append
                >
                  <VChip
                    v-bind="item.chipsProps"
                    variant="elevated"
                  />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-1"
              />
            </template>

            <VListItem class="px-4">
              <VBtn
                block
                color="error"
                size="small"
                append-icon="ri-logout-box-r-line"
                @click="logout"
              >
                {{ $t('Logout') }}
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- SECTION -->
    </VAvatar>
  </VBadge>
</template>

<style lang="scss">
.user-profile-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>
