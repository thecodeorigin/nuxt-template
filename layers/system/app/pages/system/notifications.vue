<script setup lang="ts">
import SystemEmailDispatch from '#layers/system/app/components/System/SystemEmailDispatch.vue'

definePageMeta({ can: ['system:manage'] })
useHead({ title: 'System · Notifications' })
</script>

<template>
  <SystemEmailDispatch />
</template>
