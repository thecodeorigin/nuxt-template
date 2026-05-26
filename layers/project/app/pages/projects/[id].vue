<script setup lang="ts">
import type { ProjectDetail } from '#layers/project/app/api/useProjectApi'
import { useProjectApi } from '#layers/project/app/api/useProjectApi'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

definePageMeta({ can: ['project:read', 'project:write', 'project:manage'] })

const route = useRoute()
const api = useProjectApi()
const toast = useToast()
const id = route.params.id as string

const { data: project, error, refresh } = useAsyncData<ProjectDetail>(`project-${id}`, () => api.fetchProject(id))
whenError(error)

useHead(() => ({ title: project.value?.name ?? 'Project' }))

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
          <div v-if="project.products.length === 0" class="text-sm text-muted">
            No products linked.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="pp in project.products"
              :key="pp.product_id"
              class="flex items-center justify-between p-3 bg-elevated rounded-lg border border-default"
            >
              <span class="text-sm">Product ID: {{ pp.product_id }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted">qty: {{ pp.quantity }}</span>
                <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="removeProduct(pp.product_id)" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 class="font-semibold mb-3">
            Members ({{ project.members.length }})
          </h2>
          <div v-if="project.members.length === 0" class="text-sm text-muted">
            No members.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="m in project.members"
              :key="m.user_id"
              class="flex items-center justify-between p-3 bg-elevated rounded-lg border border-default"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm">{{ m.user_id }}</span>
                <UBadge variant="subtle" size="xs">
                  {{ m.role }}
                </UBadge>
              </div>
              <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="removeMember(m.user_id)" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-48 text-muted">
        <USkeleton class="h-48 w-full max-w-3xl" />
      </div>
    </template>
  </UDashboardPanel>
</template>
