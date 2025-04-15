<script setup lang="ts">
import { topupBusKey } from '@base/injections/credit'

const { credit, isRefreshingCredit, refreshCredit } = useCredit()

tryOnBeforeMount(refreshCredit)

const topupBus = useEventBus(topupBusKey)
</script>

<template>
  <UCard>
    <div>
      <strong>
        {{ $t('Available credits') }}: {{ credit }}

        <UIcon
          name="i-lucide-refresh-cw"
          class="ml-1 cursor-pointer"
          :class="{ 'animate-spin': isRefreshingCredit }"
          @click="refreshCredit"
        />
      </strong>
      <p>
        {{ $t('We will notify you if your credit is running low') }}
      </p>
    </div>
    <div class="mt-4">
      <UButton color="neutral" variant="solid" @click="topupBus.emit()">
        {{ $t('Buy more credit') }}
      </UButton>
    </div>
  </UCard>
</template>
