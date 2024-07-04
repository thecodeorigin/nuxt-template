<script setup lang="ts">
import FlatPickr from 'vue-flatpickr-component'
import { useTheme } from 'vuetify'

// @ts-expect-error There won't be declaration file for it
import { VField, filterFieldProps, makeVFieldProps } from 'vuetify/lib/components/VField/VField'

// @ts-expect-error There won't be declaration file for it
import { VInput, makeVInputProps } from 'vuetify/lib/components/VInput/VInput'

// @ts-expect-error There won't be declaration file for it
import { filterInputAttrs } from 'vuetify/lib/util/helpers'

import { useConfigStore } from '@core/stores/config'

// inherit Attribute make false
defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  autofocus: Boolean,
  counter: [Boolean, Number, String] as PropType<true | number | string>,
  counterValue: Function as PropType<(value: any) => number>,
  prefix: String,
  placeholder: String,
  persistentPlaceholder: Boolean,
  persistentCounter: Boolean,
  suffix: String,
  type: {
    type: String,
    default: 'text',
  },
  modelModifiers: Object as PropType<Record<string, boolean>>,
  ...makeVInputProps({
    density: 'comfortable',
    hideDetails: 'auto',
  }),
  ...makeVFieldProps({
    variant: 'outlined',
    color: 'primary',
  }),
})

const emit = defineEmits<Emit>()

interface Emit {
  (e: 'click:control', val: MouseEvent): true
  (e: 'mousedown:control', val: MouseEvent): true
  (e: 'update:focused', val: MouseEvent): true
  (e: 'update:modelValue', val: string): void
  (e: 'click:clear', el: MouseEvent): void
}

const configStore = useConfigStore()
const attrs = useAttrs()

const [rootAttrs, compAttrs] = filterInputAttrs(attrs)

const { modelValue: _, ...inputProps } = VInput.filterProps(props)
const fieldProps = filterFieldProps(props)

const refFlatPicker = ref()
const { focused } = useFocus(refFlatPicker)
const isCalendarOpen = ref(false)
const isInlinePicker = ref(false)

// flat picker prop manipulation
if (compAttrs.config && compAttrs.config.inline) {
  isInlinePicker.value = compAttrs.config.inline
  Object.assign(compAttrs, { altInputClass: 'inlinePicker' })
}

compAttrs.config = {
  ...compAttrs.config,
  prevArrow: '<i class="ri-arrow-left-s-line v-icon" style="font-size: 22px; height: 22px; width: 22px;"></i>',
  nextArrow: '<i class="ri-arrow-right-s-line v-icon" style="font-size: 22px; height: 22px; width: 22px;"></i>',
}

// v-field clear prop
const onClear = (el: MouseEvent) => {
  el.stopPropagation()

  nextTick(() => {
    emit('update:modelValue', '')

    emit('click:clear', el)
  })
}

const vuetifyTheme = useTheme()

const vuetifyThemesName = Object.keys(vuetifyTheme.themes.value)

// Themes class added to flat-picker component for light and dark support
const updateThemeClassInCalendar = () => {
  // ℹ️ Flatpickr don't render it's instance in mobile and device simulator
  if (!refFlatPicker.value.fp.calendarContainer)
    return

  vuetifyThemesName.forEach(t => {
    refFlatPicker.value.fp.calendarContainer.classList.remove(`v-theme--${t}`)
  })
  refFlatPicker.value.fp.calendarContainer.classList.add(`v-theme--${vuetifyTheme.global.name.value}`)
}

watch(() => configStore.theme, updateThemeClassInCalendar)

onMounted(() => {
  updateThemeClassInCalendar()
})

const emitModelValue = (val: string) => {
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="app-picker-field">
    <VInput
      v-bind="{ ...inputProps, ...rootAttrs }"
      :model-value="modelValue"
      :hide-details="props.hideDetails"
      :class="[{
        'v-text-field--prefixed': props.prefix,
        'v-text-field--suffixed': props.suffix,
        'v-text-field--flush-details': ['plain', 'underlined'].includes(props.variant),
      }, props.class]"
      class="position-relative v-text-field"
      :style="props.style"
    >
      <template #default="{ id, isDirty, isValid, isDisabled, isReadonly }">
        <!-- v-field -->
        <VField
          v-bind="{ ...fieldProps }"
          :id="id.value"
          role="textbox"
          :active="focused || isDirty.value || isCalendarOpen"
          :focused="focused || isCalendarOpen"
          :dirty="isDirty.value || props.dirty"
          :error="isValid.value === false"
          :disabled="isDisabled.value"
          @click:clear="onClear"
        >
          <template #default="{ props: vFieldProps }">
            <div v-bind="vFieldProps">
              <!-- flat-picker  -->
              <FlatPickr
                v-if="!isInlinePicker"
                v-bind="compAttrs"
                ref="refFlatPicker"
                :model-value="modelValue"
                :placeholder="props.placeholder"
                :readonly="isReadonly.value"
                class="flat-picker-custom-style"
                :disabled="isReadonly.value"
                @on-open="isCalendarOpen = true"
                @on-close="isCalendarOpen = false"
                @update:model-value="emitModelValue"
              />

              <!-- simple input for inline prop -->
              <input
                v-if="isInlinePicker"
                :value="modelValue"
                :placeholder="props.placeholder"
                :readonly="isReadonly.value"
                class="flat-picker-custom-style"
                type="text"
              >
            </div>
          </template>
        </VField>
      </template>
    </VInput>

    <!-- flat picker for inline props -->
    <FlatPickr
      v-if="isInlinePicker"
      v-bind="compAttrs"
      ref="refFlatPicker"
      :model-value="modelValue"
      @update:model-value="emitModelValue"
      @on-open="isCalendarOpen = true"
      @on-close="isCalendarOpen = false"
    />
  </div>
</template>

<style lang="scss">
/* stylelint-disable no-descending-specificity */
@use "flatpickr/dist/flatpickr.css";
@use "@core/scss/base/mixins";

.flat-picker-custom-style {
  position: absolute;
  color: inherit;
  inline-size: 100%;
  inset: 0;
  outline: none;
  padding-block: 0;
  padding-inline: var(--v-field-padding-start);
}

$heading-color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
$body-color: rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity));

// hide the input when your picker is inline
input[altinputclass="inlinePicker"] {
  display: none;
}

.flatpickr-calendar {
  border-radius: 0.625rem;
  background-color: rgb(var(--v-theme-surface));
  inline-size: 16.875rem;

  @include mixins.elevation(6);

  .flatpickr-day:focus {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .flatpickr-rContainer {
    inline-size: 16.875rem;

    .flatpickr-weekdays {
      padding-inline: 0.5rem;
    }

    .flatpickr-days {
      font-size: 0.9375rem;
      min-inline-size: 16.875rem;

      .dayContainer {
        justify-content: center !important;
        inline-size: 16.875rem !important;
        min-inline-size: 16.875rem !important;
        padding-block: 0.75rem 0.5rem;

        .flatpickr-day {
          block-size: 36px;
          line-height: 36px;
          margin-block-start: 0 !important;
          max-inline-size: 36px;
        }
      }
    }
  }

  .flatpickr-day {
    color: $heading-color;

    &.today {
      &,
      &:hover {
        border-color: transparent;
        background-color: rgb(var(--v-theme-primary), 0.24);
        color: rgba(var(--v-theme-primary));
      }
    }

    &.selected,
    &.selected:hover {
      border-color: rgb(var(--v-theme-primary));
      background: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-on-primary)) !important;

      @include mixins.elevation(2);
    }

    &.inRange,
    &.inRange:hover {
      border: none;
      background: rgba(var(--v-theme-primary), 0.1) !important;
      box-shadow: none !important;
      color: rgb(var(--v-theme-primary));
    }

    &.inRange.today {
      background: rgba(var(--v-theme-primary), 0.24) !important;
    }

    &.startRange {
      @include mixins.elevation(2);
    }

    &.endRange {
      @include mixins.elevation(2);
    }

    &.startRange,
    &.endRange,
    &.startRange:hover,
    &.endRange:hover {
      border-color: rgb(var(--v-theme-primary));
      background: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-on-primary));
    }

    &.selected.startRange + .endRange:not(:nth-child(7n + 1)),
    &.startRange.startRange + .endRange:not(:nth-child(7n + 1)),
    &.endRange.startRange + .endRange:not(:nth-child(7n + 1)) {
      box-shadow: -10px 0 0 rgb(var(--v-theme-primary));
    }

    &.flatpickr-disabled,
    &.prevMonthDay:not(.startRange,.inRange),
    &.nextMonthDay:not(.endRange,.inRange) {
      color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
    }

    &:hover {
      border-color: transparent;
      background: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
      color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    }
  }

  .flatpickr-weekday {
    color: $heading-color;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }

  &::after,
  &::before {
    display: none;
  }

  .flatpickr-months {
    padding-block: 0.25rem;
    padding-inline: 2px;

    .flatpickr-prev-month,
    .flatpickr-next-month {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      block-size: 38px;
      color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
      inline-size: 38px;

      svg {
        block-size: 13px;
        inline-size: 13px;
        stroke: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
      }

      &:hover i,
      &:hover svg {
        fill: $body-color;
      }
    }
  }

  .flatpickr-current-month {
    padding-block: 6px 0;
    padding-inline: 0;

    span.cur-month {
      font-weight: 400;
    }
  }

  &.open {
    // Open calendar above overlay
    z-index: 2401;
  }

  &.hasTime.open {
    .flatpickr-time {
      border: none;
      block-size: auto;
    }
  }

  &.hasTime .flatpickr-time:first-child {
    border-color: transparent;
  }
}

// Time picker hover & focus bg color
.flatpickr-time input:hover,
.flatpickr-time .flatpickr-am-pm:hover,
.flatpickr-time input:focus,
.flatpickr-time .flatpickr-am-pm:focus {
  background: transparent;
}

// Time picker
.flatpickr-time {
  input.flatpickr-hour {
    font-weight: 400;
  }

  .flatpickr-am-pm,
  .flatpickr-time-separator,
  input {
    color: $heading-color;
  }

  .numInputWrapper {
    span {
      &.arrowUp {
        &::after {
          border-block-end-color: rgb(var(--v-border-color));
        }
      }

      &.arrowDown {
        &::after {
          border-block-start-color: rgb(var(--v-border-color));
        }
      }
    }
  }
}

//  Added bg color for flatpickr input only as it has default readonly attribute
.flatpickr-input[readonly],
.flatpickr-input ~ .form-control[readonly],
.flatpickr-human-friendly[readonly] {
  background-color: inherit;
}

// week sections
.flatpickr-weekdays {
  block-size: auto;
  margin-block: 0.375rem !important;
}

// Month and year section
.flatpickr-current-month {
  .flatpickr-monthDropdown-months {
    appearance: none;
    block-size: 24px;
  }

  .flatpickr-monthDropdown-months,
  .numInputWrapper {
    padding: 2px;
    border-radius: 4px;
    color: $heading-color;
    font-size: 0.9375rem;
    font-weight: 400;
    transition: all 0.15s ease-out;

    span {
      display: none;
    }

    input.cur-year {
      font-weight: 400 !important;
    }

    .flatpickr-monthDropdown-month {
      background-color: rgb(var(--v-theme-surface));
    }
  }
}

.flatpickr-day.flatpickr-disabled,
.flatpickr-day.flatpickr-disabled:hover {
  color: $body-color;
}
</style>
