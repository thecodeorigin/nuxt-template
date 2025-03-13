<script setup lang="ts">
useHead({
  title: 'Credit Information',
})

const creditStore = useCreditStore()

const isUpdatingCredit = ref(false)
async function handleUpdateCredit() {
  try {
    isUpdatingCredit.value = true

    await creditStore.updateCredit()
  }
  catch {}
  finally {
    isUpdatingCredit.value = false
  }
}
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
              Available credits: {{ creditStore.credit }}

              <UIcon
                name="i-heroicons-arrow-path"
                class="ml-1 cursor-pointer"
                :class="{ 'animate-spin': isUpdatingCredit }"
                @click="handleUpdateCredit"
              />
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
