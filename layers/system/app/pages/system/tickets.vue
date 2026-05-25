<script setup lang="ts">
import SystemTicketInbox from '#layers/system/app/components/System/SystemTicketInbox.vue'

definePageMeta({ can: ['support:manage'] })
useHead({ title: 'System · Tickets' })
</script>

<template>
  <SystemTicketInbox />
</template>
