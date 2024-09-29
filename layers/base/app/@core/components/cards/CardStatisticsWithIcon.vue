<script setup lang="ts">
defineProps<{
  title: string
  value: string
  change: number
  desc: string
  icon: string
  iconColor: string
}>()
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between">
        <div class="d-flex flex-column gap-y-1">
          <div class="text-body-1 text-high-emphasis">
            {{ title }}
          </div>
          <div class="d-flex align-center gap-x-2">
            <h4 class="text-h4">
              {{ value }}
            </h4>
            <span
              class="text-base"
              :class="change > 0 ? 'text-success' : 'text-error'"
            >({{ prefixWithPlus(change) }}%)</span>
          </div>
          <div class="text-body-2">
            {{ desc }}
          </div>
        </div>
        <VAvatar
          :color="iconColor"
          variant="tonal"
          rounded="lg"
          size="42"
        >
          <VIcon
            :icon="icon"
            size="26"
          />
        </VAvatar>
      </div>
    </VCardText>
  </VCard>
</template>
