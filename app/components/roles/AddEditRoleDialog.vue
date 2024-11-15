<script setup lang="ts">
import { cloneDeep, debounce } from 'lodash-es'
import { VForm } from 'vuetify/components/VForm'
import { usePermissionStore } from '~/stores/admin/permission'
import type { PivotRolePermission, Role } from '~/stores/admin/role'

interface Props {
  isDialogVisible: boolean
  roleData?: Partial<PivotRolePermission>
}
interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'update:rolePermissions', value: Partial<PivotRolePermission>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const permissionStore = usePermissionStore()
const { permissionList } = storeToRefs(permissionStore)
const { fetchPermissions } = permissionStore

const refPermissionForm = ref<VForm>()
const isFormValid = ref(false)

const localRoleData = ref<Partial<PivotRolePermission>>({
  id: '',
  name: '',
  permissions: [],
})

// 👉 Fetch Query
const queryKeyword = ref('')
const queryOptions = ref<ParsedFilterQuery> ({
  keyword: '',
  keywordLower: '',
  sortBy: 'action',
  sortAsc: true,
  limit: 10,
  page: 1,
  withCount: true,
})

const handleSearch = debounce((keyword: string) => {
  queryOptions.value.keyword = keyword
}, 1000)

watch(queryKeyword, (newValue) => {
  handleSearch(newValue)
})

watch(queryOptions.value, async () => {
  await fetchPermissions(queryOptions.value)
})

// 👉 select all and none
const isSelectAll = computed(() => {
  return (
    localRoleData.value.permissions?.length === permissionList.value.length
  )
})

function handleCheckAllPermissions() {
  localRoleData.value.permissions = [...permissionList.value]
}

function handleCheckNonePermissions() {
  localRoleData.value.permissions = []
}

// 👉 Submit
function onReset() {
  emit('update:isDialogVisible', false)

  refPermissionForm.value?.reset()

  localRoleData.value = {
    id: '',
    name: '',
    permissions: [],
  }
}

function onSubmit() {
  refPermissionForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('update:rolePermissions', props.roleData
        ? localRoleData.value
        : {
            name: localRoleData.value.name,
            permissions: localRoleData.value.permissions,
          })

      onReset()
    }
  })
}

watch(() => props.roleData, (newRoleData) => {
  if (newRoleData) {
    localRoleData.value = {
      id: newRoleData.id,
      name: newRoleData.name,
      permissions: permissionList.value.filter(permission =>
        newRoleData.permissions?.some(p => p.id === permission.id),
      ),
    }
  }
}, { immediate: true })

onMounted(async () => {
  await fetchPermissions()

  if (props.roleData) {
    localRoleData.value.permissions = permissionList.value.filter(permission =>
      props.roleData?.permissions?.some(p =>
        p.id === permission.id,
      ),
    )
  }
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? '100%' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="onReset"
      />

      <VCardText>
        <!-- 👉 Title -->
        <div class="text-center mb-10">
          <h4 class="text-h4 mb-2">
            {{ !props.roleData ? 'Add' : 'Edit' }} Role
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm ref="refPermissionForm" v-model="isFormValid" @submit.prevent>
          <!-- 👉 Role name -->
          <VTextField
            v-model="localRoleData.name"
            :rules="[requiredValidator]"
            class="mb-6"
            label="Role Name"
            placeholder="Enter Role Name"
          />

          <!-- 👉 Role filter -->
          <VRow>
            <VCol cols="12" md="4" class="d-flex align-center">
              <h5 class="text-h5">
                Permissions
              </h5>
            </VCol>

            <VCol cols="12" md="8">
              <div class="d-flex align-center gap-3 flex-wrap">
                <p>
                  Select:
                </p>

                <VBtn
                  :color="isSelectAll ? 'primary' : 'secondary'"
                  variant="text"
                  text="All"
                  @click="handleCheckAllPermissions"
                />

                <VBtn
                  :color="localRoleData?.permissions?.length === 0 ? 'primary' : 'secondary'"
                  variant="text"
                  text="None"
                  @click="handleCheckNonePermissions"
                />

                <div class="flex-grow-1">
                  <VTextField
                    v-model="queryKeyword"
                    placeholder="Search"
                    density="compact"
                    prepend-inner-icon="ri-search-line"
                  />
                </div>
              </div>
            </VCol>
          </VRow>

          <!-- 👉 Role Permissions -->
          <div class="mt-6 d-flex flex-wrap gap-3 permission-container">
            <div v-for="permission in permissionList" :key="permission.id" class="d-flex align-center gap-2 flex-wrap">
              <VLabel>
                <VCheckbox
                  v-model="localRoleData.permissions"
                  :value="permission"
                  class="border pa-2"
                  :class="{ 'border border-primary text-primary': localRoleData?.permissions && localRoleData?.permissions.some(p => p.id === permission.id) }"
                  multiple
                >
                  <template #label>
                    <span class="pr-3" :class="{ 'text-primary': localRoleData?.permissions && localRoleData?.permissions.some(p => p.id === permission.id) }">
                      {{ permission.action }} : {{ permission.subject }}
                    </span>
                  </template>
                </VCheckbox>
              </VLabel>
            </div>
          </div>

          <!-- 👉 Actions button -->
          <div class="d-flex align-center justify-center gap-3 mt-6">
            <VBtn @click="onSubmit">
              Submit
            </VBtn>

            <VBtn
              color="secondary"
              variant="outlined"
              @click="onReset"
            >
              Cancel
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.permission-container {
  min-block-size: 150px;
}
</style>
