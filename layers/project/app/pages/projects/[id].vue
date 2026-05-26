<script setup lang="ts">
import type { ProjectDetail } from '#layers/project/app/api/useProjectApi'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'
import { useProductApi } from '#layers/product/app/api/useProductApi'
import { useProjectApi } from '#layers/project/app/api/useProjectApi'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

definePageMeta({ can: ['project:read', 'project:write', 'project:manage'] })

const route = useRoute()
const api = useProjectApi()
const orgApi = useOrganizationApi()
const productApi = useProductApi()
const toast = useToast()
const id = route.params.id as string

const { data: project, error, refresh } = useAsyncData<ProjectDetail>(`project-${id}`, () => api.fetchProject(id))
whenError(error)

useHead(() => ({ title: project.value?.name ?? 'Project' }))

const { data: orgMembers } = useAsyncData('org-members-for-project', () => orgApi.fetchMembers({ limit: 100 }), { default: () => ({ items: [], hasMore: false }) })
const { data: allProducts } = useAsyncData('products-for-project', () => productApi.fetchProducts('active'), { default: () => [] })

const addProductId = ref('')
const addProductQty = ref(1)
const addingProduct = ref(false)

const addMemberUserId = ref('')
const addMemberRole = ref<'owner' | 'member' | 'viewer'>('member')
const addingMember = ref(false)

const availableProducts = computed(() => {
  const linked = new Set(project.value?.products.map(p => p.product_id) ?? [])
  return (allProducts.value ?? []).filter(p => !linked.has(p.id))
})

const availableMembers = computed(() => {
  const linked = new Set(project.value?.members.map(m => m.user_id) ?? [])
  return (orgMembers.value?.items ?? []).filter(m => !linked.has(m.id))
})

async function addProduct() {
  if (!addProductId.value)
    return
  addingProduct.value = true
  try {
    await api.addProduct(id, { product_id: addProductId.value, quantity: addProductQty.value })
    await refresh()
    addProductId.value = ''
    addProductQty.value = 1
    toast.add({ title: 'Product added', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    addingProduct.value = false
  }
}

async function removeProduct(productId: string) {
  try {
    await api.removeProduct(id, productId)
    await refresh()
    toast.add({ title: 'Product removed', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
}

async function addMember() {
  if (!addMemberUserId.value)
    return
  addingMember.value = true
  try {
    await api.addMember(id, { user_id: addMemberUserId.value, role: addMemberRole.value })
    await refresh()
    addMemberUserId.value = ''
    addMemberRole.value = 'member'
    toast.add({ title: 'Member added', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    addingMember.value = false
  }
}

async function removeMember(userId: string) {
  try {
    await api.removeMember(id, userId)
    await refresh()
    toast.add({ title: 'Member removed', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel id="project-detail">
    <template #header>
      <DashboardNavbar :title="project?.name ?? 'Project'">
        <template #leading>
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/projects" />
        </template>
        <template #right>
          <UBadge
            v-if="project"
            :color="project.status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ project.status }}
          </UBadge>
        </template>
      </DashboardNavbar>
    </template>
    <template #body>
      <div v-if="project" class="max-w-3xl mx-auto p-4 space-y-6">
        <p v-if="project.description" class="text-muted">
          {{ project.description }}
        </p>

        <div>
          <h2 class="font-semibold mb-3">
            Products ({{ project.products.length }})
          </h2>
          <div v-if="project.products.length === 0" class="text-sm text-muted mb-3">
            No products linked.
          </div>
          <div v-else class="space-y-2 mb-3">
            <div
              v-for="pp in project.products"
              :key="pp.product_id"
              class="flex items-center justify-between p-3 bg-elevated rounded-lg border border-default"
            >
              <span class="text-sm font-medium">
                {{ allProducts?.find(p => p.id === pp.product_id)?.name ?? pp.product_id }}
              </span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted">qty: {{ pp.quantity }}</span>
                <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="removeProduct(pp.product_id)" />
              </div>
            </div>
          </div>
          <Can I="write" a="project">
            <div v-if="availableProducts.length > 0" class="flex items-end gap-2">
              <UFormField label="Add product" class="flex-1">
                <USelect
                  v-model="addProductId"
                  :items="availableProducts.map(p => ({ label: p.name, value: p.id }))"
                  placeholder="Select a product"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Qty" class="w-20">
                <UInput v-model.number="addProductQty" type="number" min="1" />
              </UFormField>
              <UButton :loading="addingProduct" :disabled="!addProductId" icon="i-lucide-plus" @click="addProduct">
                Add
              </UButton>
            </div>
          </Can>
        </div>

        <div>
          <h2 class="font-semibold mb-3">
            Members ({{ project.members.length }})
          </h2>
          <div v-if="project.members.length === 0" class="text-sm text-muted mb-3">
            No members.
          </div>
          <div v-else class="space-y-2 mb-3">
            <div
              v-for="m in project.members"
              :key="m.user_id"
              class="flex items-center justify-between p-3 bg-elevated rounded-lg border border-default"
            >
              <div class="flex items-center gap-2">
                <UAvatar
                  :src="m.avatar ?? undefined"
                  :alt="m.name ?? m.username ?? m.user_id"
                  size="xs"
                />
                <span class="text-sm">{{ m.name ?? m.username ?? m.user_id }}</span>
                <UBadge variant="subtle" size="xs">
                  {{ m.role }}
                </UBadge>
              </div>
              <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="removeMember(m.user_id)" />
            </div>
          </div>
          <Can I="write" a="project">
            <div v-if="availableMembers.length > 0" class="flex items-end gap-2">
              <UFormField label="Add member" class="flex-1">
                <USelect
                  v-model="addMemberUserId"
                  :items="availableMembers.map(m => ({ label: m.name ?? m.username ?? m.primary_email, value: m.id }))"
                  placeholder="Select a member"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Role">
                <USelect
                  v-model="addMemberRole"
                  :items="[{ label: 'Owner', value: 'owner' }, { label: 'Member', value: 'member' }, { label: 'Viewer', value: 'viewer' }]"
                />
              </UFormField>
              <UButton :loading="addingMember" :disabled="!addMemberUserId" icon="i-lucide-plus" @click="addMember">
                Add
              </UButton>
            </div>
          </Can>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-48 text-muted">
        <USkeleton class="h-48 w-full max-w-3xl" />
      </div>
    </template>
  </UDashboardPanel>
</template>
