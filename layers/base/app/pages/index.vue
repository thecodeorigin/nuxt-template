<script setup lang="ts">
definePageMeta({
  middleware() {
    return navigateTo({ path: '/dashboard' })
  },
})
</script>
