<script lang="ts" setup>
import type { CustomInputContent, GridColumn } from '@core/types'

interface Props {
  selectedCheckbox: string[]
  checkboxContent: CustomInputContent[]
  gridColumn?: GridColumn
}

interface Emit {
  (e: 'update:selectedCheckbox', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const updateSelectedOption = (value: string[] | null) => {
  if (typeof value !== 'boolean' && value !== null)
    emit('update:selectedCheckbox', value)
}
</script>

<template>
  <VRow v-if="props.checkboxContent && props.selectedCheckbox">
    <VCol
      v-for="item in props.checkboxContent"
      :key="item.title"
      v-bind="gridColumn"
    >
      <VLabel
        class="custom-input custom-checkbox-icon rounded-xl cursor-pointer"
        :class="props.selectedCheckbox.includes(item.value) ? 'active' : ''"
      >
        <slot :item="item">
          <div class="d-flex flex-column align-center text-center gap-2">
            <VIcon
              size="28"
              :icon="item.icon"
              class="text-high-emphasis"
            />

            <h6 class="cr-title text-base">
              {{ item.title }}
            </h6>
            <p class="text-sm text-medium-emphasis clamp-text mb-0">
              {{ item.desc }}
            </p>
          </div>
        </slot>
        <div>
          <VCheckbox
            :model-value="props.selectedCheckbox"
            :value="item.value"
            @update:model-value="updateSelectedOption"
          />
        </div>
      </VLabel>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.custom-checkbox-icon {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .v-checkbox {
    margin-block-end: -0.375rem;

    .v-selection-control__wrapper {
      margin-inline-start: 0;
    }
  }

  .cr-title {
    font-weight: 500;
  }
}
</style>

<style lang="scss">
.custom-checkbox-icon {
  .v-checkbox {
    margin-block-end: -0.375rem;

    .v-selection-control__wrapper {
      margin-inline-start: 0;
    }
  }
}
</style>
