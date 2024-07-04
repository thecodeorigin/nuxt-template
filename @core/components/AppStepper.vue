<script setup lang="ts">
import stepperCheck from '@images/svg/stepper-check.svg'

interface Item {
  title: string
  icon?: string | object
  size?: string
  subtitle?: string
}

type Direction = 'vertical' | 'horizontal'

interface Props {
  items: Item[]
  currentStep?: number
  direction?: Direction
  iconSize?: string | number
  isActiveStepValid?: boolean
  align?: 'start' | 'center' | 'end' | 'default'
}

interface Emit {
  (e: 'update:currentStep', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  currentStep: 0,
  direction: 'horizontal',
  iconSize: 52,
  isActiveStepValid: undefined,
  align: 'default',
})

const emit = defineEmits<Emit>()

const currentStep = ref(props.currentStep || 0)

// check if step is completed or active and return class name accordingly
const activeOrCompletedStepsClasses = computed(() => (index: number) => (
  index < currentStep.value
    ? 'stepper-steps-completed'
    : index === currentStep.value ? 'stepper-steps-active' : ''
))

// check if step is horizontal and not last step
const isHorizontalAndNotLastStep = computed(() => (index: number) => (
  props.direction === 'horizontal'
  && props.items.length - 1 !== index
))

// check if validation is enabled
const isValidationEnabled = computed(() => {
  return props.isActiveStepValid !== undefined
})

watchEffect(() => {
  // we need to check undefined because if we pass 0 as currentStep it will be falsy
  if (
    props.currentStep !== undefined
    && props.currentStep < props.items.length
    && props.currentStep >= 0
  )
    currentStep.value = props.currentStep

  emit('update:currentStep', currentStep.value)
})
</script>

<template>
  <VSlideGroup
    v-model="currentStep"
    class="app-stepper"
    show-arrows
    :direction="props.direction"
    :class="`app-stepper-${props.align} ${props.items[0].icon ? 'app-stepper-icons' : ''}`"
  >
    <VSlideGroupItem
      v-for="(item, index) in props.items"
      :key="item.title"
      :value="index"
    >
      <div
        class="cursor-pointer app-stepper-step"
        :class="[
          (!props.isActiveStepValid && (isValidationEnabled)) && 'stepper-steps-invalid',
          activeOrCompletedStepsClasses(index),
        ]"
        @click="!isValidationEnabled && emit('update:currentStep', index)"
      >
        <!-- SECTION stepper step with icon -->
        <template v-if="item.icon">
          <div class="stepper-icon-step text-high-emphasis d-flex align-center gap-2">
            <!-- 👉 icon and title -->
            <div
              class="d-flex align-center gap-2 step-wrapper"
              :class="[props.direction === 'horizontal' && 'flex-column']"
            >
              <div class="stepper-icon">
                <template v-if="typeof item.icon === 'object'">
                  <Component :is="item.icon" />
                </template>

                <VIcon
                  v-else
                  :icon="item.icon"
                  :size="item.size || props.iconSize"
                />
              </div>

              <div class="d-flex flex-column gap-y-1">
                <p class="stepper-title font-weight-medium text-base mb-0">
                  {{ item.title }}
                </p>
                <p
                  v-if="item.subtitle"
                  class="stepper-subtitle text-sm mb-0"
                >
                  {{ item.subtitle }}
                </p>
              </div>
            </div>

            <!-- 👉 append chevron -->
            <VIcon
              v-if="isHorizontalAndNotLastStep(index)"
              class="flip-in-rtl stepper-chevron-indicator mx-6"
              size="20"
              icon="ri-arrow-right-s-line"
            />
          </div>
        </template>
        <!-- !SECTION  -->

        <!-- SECTION stepper step without icon -->
        <template v-else>
          <div class="d-flex align-center gap-x-2 me-2">
            <div class="d-flex align-center gap-2">
              <div class="d-flex align-center justify-center">
                <!-- 👉 custom circle icon -->
                <template v-if="index >= currentStep">
                  <div
                    v-if="(!isValidationEnabled || props.isActiveStepValid || index !== currentStep)"
                    class="stepper-step-indicator"
                  />

                  <VIcon
                    v-else
                    icon="ri-error-warning-line"
                    size="24"
                    color="error"
                  />
                </template>

                <!-- 👉 step completed icon -->

                <component
                  :is="stepperCheck"
                  v-else
                  class="stepper-step-icon"
                />
              </div>

              <!-- 👉 Step Number -->
              <h4 :class="`${!item.subtitle ? 'text-h6' : 'text-h4'} step-number`">
                {{ (index + 1).toString().padStart(2, '0') }}
              </h4>
            </div>

            <!-- 👉 title and subtitle -->
            <div
              class="app-stepper-title-wrapper"
              style="line-height: 0;"
            >
              <h6 class="text-base font-weight-medium step-title">
                {{ item.title }}
              </h6>

              <p
                v-if="item.subtitle"
                class="text-sm step-subtitle mb-0"
              >
                {{ item.subtitle }}
              </p>
            </div>

            <!-- 👉 stepper step line -->
            <div
              v-if="isHorizontalAndNotLastStep(index)"
              class="stepper-step-line"
            />
          </div>

          <div
            v-if="props.direction === 'vertical' && props.items.length - 1 !== index"
            class="stepper-step-line vertical"
          />
        </template>
        <!-- !SECTION  -->
      </div>
    </VSlideGroupItem>
  </VSlideGroup>
</template>

<style lang="scss">
@use "@core/scss/base/mixins.scss";

/* stylelint-disable no-descending-specificity */
.app-stepper {
  &.app-stepper-default:not(.app-stepper-icons) .app-stepper-step:not(:last-child) {
    inline-size: 100%;
  }

  // 👉 stepper step with icon and  default
  .v-slide-group__content {
    .stepper-step-indicator {
      border: 0.1875rem solid rgb(var(--v-theme-primary));
      border-radius: 50%;
      background-color: rgb(var(--v-theme-surface));
      block-size: 1.25rem;
      inline-size: 1.25rem;
      opacity: var(--v-activated-opacity);
    }

    .stepper-step-line {
      border-radius: 0.1875rem;
      background-color: rgb(var(--v-theme-primary));
      block-size: 0.1875rem;
      opacity: var(--v-activated-opacity);
    }

    .stepper-step-line:not(.vertical) {
      inline-size: 100%;
      min-inline-size: 3rem;
    }

    .stepper-step-line.vertical {
      border-radius: 1.25rem;
      block-size: 1.25rem;
      inline-size: 0.1875rem;
      margin-inline-start: 0.5rem;
    }

    .stepper-chevron-indicator {
      color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
    }

    .stepper-steps-completed,
    .stepper-steps-active {
      .stepper-icon-step,
      .stepper-step-icon {
        color: rgb(var(--v-theme-primary)) !important;
      }

      .stepper-step-indicator {
        border-width: 0.3125rem;
        opacity: 1;
      }
    }

    .stepper-steps-completed {
      .stepper-step-line {
        opacity: 1;
      }

      .stepper-chevron-indicator {
        color: rgb(var(--v-theme-primary));
      }
    }

    .stepper-steps-invalid.stepper-steps-active {
      .stepper-icon-step,
      .step-number,
      .step-title,
      .step-subtitle {
        color: rgb(var(--v-theme-error)) !important;
      }
    }

    .app-stepper-step:not(.stepper-steps-active,.stepper-steps-completed) {
      .step-number {
        color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
      }

      .step-subtitle {
        color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
      }
    }
  }

  .app-stepper-title-wrapper {
    text-wrap: nowrap;
  }

  // 👉 stepper step with bg color
  &.stepper-icon-step-bg {
    .v-slide-group__content {
      row-gap: 1.5rem;
    }

    .stepper-icon-step {
      .step-wrapper {
        flex-direction: row !important;
      }

      .stepper-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
        block-size: 2.5rem;
        color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
        inline-size: 2.5rem;
        margin-inline-end: 0.5rem;
      }

      .stepper-title,
      .stepper-subtitle {
        line-height: normal;
      }

      .stepper-title {
        color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
        font-size: 0.9375rem;
        line-height: 1.375rem;
      }

      .stepper-subtitle {
        color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
        font-size: 0.8125rem;
        font-weight: 400;
        line-height: 1.25rem;
      }
    }

    .stepper-steps-active {
      .stepper-icon-step {
        .stepper-icon {
          background-color: rgb(var(--v-theme-primary));
          color: rgba(var(--v-theme-on-primary));

          @include mixins.elevation(2);
        }
      }
    }

    .stepper-steps-completed {
      .stepper-icon-step {
        .stepper-icon {
          background: rgba(var(--v-theme-primary), 0.16);
          color: rgba(var(--v-theme-primary));
        }
      }
    }
  }

  // 👉 stepper alignment
  &.app-stepper-default {
    .v-slide-group__content {
      justify-content: space-between;
    }
  }

  &.app-stepper-center {
    .v-slide-group__content {
      justify-content: center;
    }
  }

  &.app-stepper- {
    .v-slide-group__content {
      justify-content: start;
    }
  }

  &.app-stepper-end {
    .v-slide-group__content {
      justify-content: end;
    }
  }

  &.app-stepper-icons {
    .app-stepper-step:not(.stepper-steps-active,.stepper-steps-completed) {
      .stepper-title {
        color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
      }
    }

    &:not(.stepper-icon-step-bg) {
      .step-wrapper {
        padding-block: 1.25rem;
        padding-inline: 1.875rem;
      }
    }

    &.v-slide-group--vertical {
      .step-wrapper {
        padding-inline: 0;
      }
    }
  }
}
</style>
