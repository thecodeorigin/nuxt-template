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
        class="custom-input custom-checkbox rounded-xl cursor-pointer"
        :class="props.selectedCheckbox.includes(item.value) ? 'active' : ''"
      >
        <div>
          <VCheckbox
            :model-value="props.selectedCheckbox"
            :value="item.value"
            @update:model-value="updateSelectedOption"
          />
        </div>
        <slot :item="item">
          <div class="flex-grow-1">
            <div class="d-flex align-center mb-2">
              <h6 class="cr-title text-base">
                {{ item.title }}
              </h6>
              <VSpacer />
              <span
                v-if="item.subtitle"
                class="text-sm text-disabled"
              >{{ item.subtitle }}</span>
            </div>
            <p class="text-sm text-medium-emphasis mb-0">
              {{ item.desc }}
            </p>
          </div>
        </slot>
      </VLabel>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.custom-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;

  .v-checkbox {
    margin-block-start: -0.375rem;
  }

  .cr-title {
    font-weight: 500;
  }
}
</style>
