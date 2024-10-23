<script setup lang="ts">
definePageMeta({
  public: true,
  layout: 'blank',
})

onMounted(() => {
  loading()

  setTimeout(() => {
    loading.close()
  }, 5000)
})
</script>

<template>
  <div>
    Sandbox
  </div>
</template>
