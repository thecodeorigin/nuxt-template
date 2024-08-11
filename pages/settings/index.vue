<script setup lang="ts">
definePageMeta({
  sidebar: {
    order: 99,
    title: 'Settings',
    icon: { icon: 'ri-settings-3-line' },
  },
  middleware() {
    return navigateTo({ name: 'settings-tab', params: { tab: 'account' } })
  },
})
</script>
