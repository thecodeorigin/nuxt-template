<script setup lang="ts">
interface Props {
  title: string
  color?: string
  icon: string
  stats: string
  change: number
  subtitle: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const isPositive = computed(() => Math.sign(props.change) === 1)
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-center">
      <VAvatar
        v-if="props.icon"
        rounded="lg"
        variant="tonal"
        :color="props.color"
      >
        <VIcon
          :icon="props.icon"
          size="24"
        />
      </VAvatar>

      <VSpacer />

      <div
        v-if="props.change"
        :class="isPositive ? 'text-success' : 'text-error'"
        class="d-flex align-center text-base mt-n4"
      >
        <span>{{ isPositive ? `+${props.change}` : props.change }}%</span>

        <VIcon
          :icon="isPositive ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
          size="18"
        />
      </div>
    </VCardText>

    <VCardText>
      <h5 class="text-h5 mb-1">
        {{ props.stats }}
      </h5>
      <p>
        {{ props.title }}
      </p>

      <VChip
        size="small"
        color="secondary"
      >
        <span class="text-truncate">{{ props.subtitle }}</span>
      </VChip>
    </VCardText>
  </VCard>
</template>
