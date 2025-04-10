<script setup lang="ts">
const { credit, isRefreshingCredit, refreshCredit } = useCredit()

tryOnBeforeMount(refreshCredit)
</script>

<template>
  <UCard>
    <div>
      <strong>
        Available credits: {{ credit }}

        <UIcon
          name="i-lucide-refresh-cw"
          class="ml-1 cursor-pointer"
          :class="{ 'animate-spin': isRefreshingCredit }"
          @click="refreshCredit"
        />
      </strong>
      <p>
        We will notify you if your credit is running low
      </p>
    </div>
    <div class="mt-4">
      <UButton color="neutral" variant="solid" to="/pricing">
        Buy more credit
      </UButton>
    </div>
  </UCard>
</template>
