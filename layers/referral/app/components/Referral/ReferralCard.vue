<script setup lang="ts">
const props = defineProps<{ code: string }>()
const toast = useToast()

const origin = useRequestURL().origin
const referralUrl = computed(() => `${origin}/?ref=${props.code}`)

const { copy, copied } = useClipboard({ source: referralUrl })

function onCopy() {
  copy()
  toast.add({ title: 'Copied!', color: 'success' })
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UInput :model-value="referralUrl" readonly class="flex-1 font-mono text-sm" />
    <UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" color="neutral" variant="ghost" @click="onCopy" />
  </div>
</template>
