<script setup lang="ts">
definePageMeta({
  middleware() {
    return navigateTo({ name: 'dashboard' })
  },
})
</script>
