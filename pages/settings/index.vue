<script setup lang="ts">
definePageMeta({
  middleware() {
    return navigateTo({ name: 'settings-tab', params: { tab: 'account' } })
  },
})
</script>
