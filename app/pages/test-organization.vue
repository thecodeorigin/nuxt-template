<script setup lang="ts">
import { type Organization, useOrganizationStore } from '@base/stores/admin/organization'
import { DRAWER_ACTION_TYPES } from '~/constant/organization'
import type { DrawerConfig } from '~/utils/types'
import type { DrawerActionTypes } from '~/utils/types/landing-page'

definePageMeta({
  sidebar: {
    title: 'Test Organizations',
    icon: { icon: 'ri-id-card-line' },
  },
})

const organizationStore = useOrganizationStore()
const { organizationDetail, organizationList, totalOrganizations } = storeToRefs(organizationStore)
const { fetchOrganizations, createOrganization, fetchOrganizationDetail, updateOrganization, deleteOrganization } = organizationStore

const currentOrganizationId = ref<string>('')
const currentOrganizationName = ref<string>('')
const currentOrganizationData = ref<Partial<Organization>>({
  id: '',
  name: '',
  avatar_url: '',
})
const currentDrawerConfig = ref<DrawerConfig>({
  isVisible: false,
  type: DRAWER_ACTION_TYPES.ADD,
})

function handleResetOrganizationData() {
  currentOrganizationData.value = {
    id: '',
    name: null,
    avatar_url: '',
  }
}

function handleOpenAddDrawer() {
  handleResetOrganizationData()

  currentDrawerConfig.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.ADD,
  }
}

async function handleOpenEditDrawer(organizationId: string) {
  await handleFetchOrganizationDetail(organizationId)

  currentOrganizationData.value = {
    id: organizationDetail.value?.id,
    name: organizationDetail.value?.name,
    avatar_url: organizationDetail.value?.avatar_url,
  }

  currentDrawerConfig.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.EDIT,
  }
}

async function handleFetchOrganizationDetail(organizationId: string) {
  await fetchOrganizationDetail(organizationId)
}

async function handleAddNewOrganization(organizationPayload: Partial<Organization>) {
  await createOrganization(organizationPayload)

  await fetchOrganizations()
}

async function handleUpdateOrganization(organizationId: string, payload: Partial<Organization>) {
  await updateOrganization(organizationId, payload)

  currentOrganizationName.value = ''

  await fetchOrganizations()
}

async function handleOrganizationChange(payload: Partial<Organization>, type: DrawerActionTypes) {
  if (type === DRAWER_ACTION_TYPES.EDIT) {
    const { id, ...body } = payload
    await handleUpdateOrganization(id!, body)
    nextTick(() => {
      handleResetOrganizationData()
    })
  }
  else {
    await handleAddNewOrganization(payload)
  }
}

async function handleDeleteOrganization(organizationId: string) {
  await deleteOrganization(organizationId)

  await fetchOrganizations()
}

useLazyAsyncData(
  async () => {
    await fetchOrganizations()
  },
)
</script>

<template>
  <div>
    <h1 class="text-center">
      Test Organization
    </h1>

    <div>
      <h2 class="mb-2">
        Organization list:
      </h2>
      <div v-if="organizationList.length > 0">
        <p>
          Total Organizations: {{ totalOrganizations }}
        </p>
        <br>
        <ul>
          <li
            v-for="organization in organizationList"
            :key="organization.id"
          >
            <div class="d-flex align-center justify-space-between">
              <p>
                {{ organization.name }}
              </p>

              <div class="d-flex align-center gap-2">
                <VBtn
                  @click="handleOpenEditDrawer(organization.id)"
                >
                  Edit
                </VBtn>

                <VBtn
                  @click="handleDeleteOrganization(organization.id)"
                >
                  Delete
                </VBtn>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-else>
        No Organization
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        Organization detail:
      </h2>

      <div class="mb-2 d-flex align-center gap-2">
        <VTextField
          v-model="currentOrganizationId"
          label="Organization ID"
        />

        <VBtn @click="fetchOrganizationDetail(currentOrganizationId)">
          Find Organization
        </VBtn>
      </div>

      <div v-if="organizationDetail">
        <p>
          ID: {{ organizationDetail.id }}
        </p>
        <p>
          Name: {{ organizationDetail.name }}
        </p>
      </div>

      <div v-else>
        Not found
      </div>
    </div>

    <div>
      <h2 class="mb-2 mt-8 d-flex align-center">
        Organization create:
      </h2>

      <VBtn
        @click="handleOpenAddDrawer()"
      >
        Create Organization
      </VBtn>
    </div>

    <OrganizationDrawer
      v-model="currentOrganizationData"
      :drawer-config="currentDrawerConfig"
      @update:is-drawer-open="currentDrawerConfig.isVisible = $event"
      @update:model-value="handleOrganizationChange"
    />
  </div>
</template>

