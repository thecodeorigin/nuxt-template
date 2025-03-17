<script setup lang="ts">
definePageMeta({
  middleware(to) {
    if (to.path === '/app/settings')
      return navigateTo('/app/settings/profile')
  },
})
</script>
