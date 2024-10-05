<script setup lang="ts">
import { cloneDeep } from 'lodash-es'

const isLoading = ref(false)
function onFooterSubmit() {}
</script>

<template>
  <VForm @submit.prevent="onFooterSubmit">
    <div class="d-flex flex-column gap-4">
      <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4 d-block label">
        Footer Section
      </VLabel>
    </div>
  </VForm>
</template>

<style lang="scss" scoped>

</style>
