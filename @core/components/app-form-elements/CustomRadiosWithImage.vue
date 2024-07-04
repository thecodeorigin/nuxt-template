<script lang="ts" setup>
import type { GridColumn } from '@core/types'

interface Props {
  selectedRadio: string
  radioContent: { bgImage: string | undefined; value: string; label?: string }[]
  gridColumn?: GridColumn
}

interface Emit {
  (e: 'update:selectedRadio', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const updateSelectedOption = (value: string | null) => {
  if (value !== null)
    emit('update:selectedRadio', value)
}
</script>

<template>
  <VRadioGroup
    v-if="props.radioContent"
    :model-value="props.selectedRadio"
    @update:model-value="updateSelectedOption"
  >
    <VRow>
      <VCol
        v-for="item in props.radioContent"
        :key="item.bgImage"
        v-bind="gridColumn"
      >
        <div
          class="d-flex flex-column"
          style="gap: 2px;"
        >
          <VLabel
            class="custom-input custom-radio rounded-xl cursor-pointer w-100"
            :class="props.selectedRadio === item.value ? 'active' : ''"
          >
            <slot
              name="content"
              :item="item"
            >
              <template v-if="typeof item.bgImage === 'object'">
                <Component
                  :is="item.bgImage"
                  class="custom-radio-image"
                />
              </template>
              <img
                v-else
                :src="item.bgImage"
                alt="bg-img"
                class="custom-radio-image"
              >
            </slot>
            <VRadio
              :id="`custom-radio-with-img-${item.value}`"
              :value="item.value"
            />
          </VLabel>
          <VLabel
            v-if="item.label || $slots.label"
            :for="`custom-radio-with-img-${item.value}`"
            class="cursor-pointer"
          >
            <slot
              name="label"
              :label="item.label"
            >
              {{ item.label }}
            </slot>
          </VLabel>
        </div>
      </VCol>
    </VRow>
  </VRadioGroup>
</template>

<style lang="scss" scoped>
.custom-radio {
  padding: 0 !important;

  &.active {
    border-width: 1px;
  }

  .custom-radio-image {
    block-size: 100%;
    inline-size: 100%;
    min-inline-size: 100%;
  }

  .v-radio {
    visibility: hidden;
  }
}
</style>
