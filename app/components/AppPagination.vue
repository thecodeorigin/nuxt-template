<script setup lang="ts">
defineProps<{
  total: number
}>()

const limit = defineModel('limit', { type: Number, required: true })
const page = defineModel('page', { type: Number, required: true })
</script>

<template>
  <div>
    <VDivider />

    <div class="d-flex justify-end flex-wrap gap-x-6 px-2 py-1">
      <div class="d-flex align-center gap-x-2 text-medium-emphasis text-base">
        Rows Per Page:
        <VSelect
          v-model="limit"
          class="per-page-select"
          variant="plain"
          :items="[10, 25, 50, 100]"
        />
      </div>

      <p class="d-flex align-center text-base text-high-emphasis me-2 mb-0">
        {{ paginationMeta({ page, itemsPerPage: limit }, total) }}
      </p>

      <div class="d-flex gap-x-2 align-center me-2">
        <VBtn
          class="flip-in-rtl"
          icon="ri-arrow-left-s-line"
          variant="text"
          density="comfortable"
          color="high-emphasis"
          :disabled="page <= 1"
          @click="page <= 1 ? page = 1 : page--"
        />

        <VBtn
          class="flip-in-rtl"
          icon="ri-arrow-right-s-line"
          density="comfortable"
          variant="text"
          color="high-emphasis"
          :disabled="page >= Math.ceil(total / limit)"
          @click="page >= Math.ceil(total / limit) ? page = Math.ceil(total / limit) : page++ "
        />
      </div>
    </div>
  </div>
</template>
