<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <UDashboardPanelContent class="pb-24 pt-10">
    <div class="grid gap-5 grid-cols-1 lg:grid-cols-3">
      <div>
        <p class="font-semibold">
          Credit available
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Buy more credits to use better n8n instances without getting interupted!
        </p>
      </div>
      <div class="col-span-2">
        <UCard>
          <div>
            <strong>
              Available credits: {{ authStore.currentUser?.custom_data?.credit || 0 }}
            </strong>
            <p>
              We will notify you if your credit is running low
            </p>
          </div>
          <div class="mt-4">
            <UButton color="white" variant="solid" to="/pricing">
              Buy more credit
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </UDashboardPanelContent>
</template>
