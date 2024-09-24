<script setup lang="ts">
import { kFormatter } from '@core/utils/formatters'

interface Props {
  title: string
  color?: string
  icon: string
  stats: number
  change: number
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const isPositive = controlledComputed(() => props.change, () => Math.sign(props.change) === 1)
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-center">
      <VAvatar
        size="40"
        rounded="lg"
        :color="props.color"
        variant="tonal"
        class="me-4"
      >
        <VIcon
          :icon="props.icon"
          size="24"
        />
      </VAvatar>

      <div class="d-flex flex-column">
        <div class="d-flex align-center flex-wrap gap-x-2">
          <h5 class="text-h5">
            ${{ kFormatter(props.stats) }}
          </h5>
          <div
            v-if="props.change"
            class="d-flex align-center"
            :class="`${isPositive ? 'text-success' : 'text-error'}`"
          >
            <VIcon
              size="24"
              :icon="isPositive ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
            />
            <div class="text-base">
              {{ Math.abs(props.change) }}%
            </div>
          </div>
        </div>
        <div class="text-body-1">
          {{ props.title }}
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
