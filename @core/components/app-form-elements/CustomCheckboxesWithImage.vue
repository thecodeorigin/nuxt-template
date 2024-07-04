<script lang="ts" setup>
import type { GridColumn } from '@core/types'

interface Props {
  selectedCheckbox: string[]
  checkboxContent: { bgImage: string; value: string; label?: string }[]
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
      :key="item.value"
      v-bind="gridColumn"
    >
      <VLabel
        class="custom-input custom-checkbox rounded-xl cursor-pointer w-100"
        :class="props.selectedCheckbox.includes(item.value) ? 'active' : ''"
      >
        <div>
          <VCheckbox
            :id="`custom-checkbox-with-img-${item.value}`"
            :model-value="props.selectedCheckbox"
            :value="item.value"
            @update:model-value="updateSelectedOption"
          />
        </div>
        <img
          :src="item.bgImage"
          alt="bg-img"
          class="custom-checkbox-image"
        >
      </VLabel>

      <VLabel
        v-if="item.label || $slots.label"
        :for="`custom-checkbox-with-img-${item.value}`"
        class="cursor-pointer"
      >
        <slot
          name="label"
          :label="item.label"
        >
          {{ item.label }}
        </slot>
      </VLabel>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.custom-checkbox {
  position: relative;
  padding: 0;

  .custom-checkbox-image {
    block-size: 100%;
    inline-size: 100%;
    min-inline-size: 100%;
  }

  .v-checkbox {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    visibility: hidden;
  }

  &.active {
    border-width: 1px;
  }

  &:hover,
  &.active {
    .v-checkbox {
      visibility: visible;
    }
  }
}
</style>
