<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <VueApexCharts v-bind="$attrs" />
</template>
