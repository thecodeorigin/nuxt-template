<script setup lang="ts">
const props = defineProps<{ code: string }>()
const toast = useToast()

const referralUrl = computed(() => {
  if (import.meta.client)
    return `${window.location.origin}/?ref=${props.code}`
  return `/?ref=${props.code}`
})

async function copy() {
  if (import.meta.client) {
    await navigator.clipboard.writeText(referralUrl.value)
    toast.add({ title: 'Copied!', color: 'success' })
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UInput :model-value="referralUrl" readonly class="flex-1 font-mono text-sm" />
    <UButton icon="i-lucide-copy" color="neutral" variant="ghost" @click="copy" />
  </div>
</template>
