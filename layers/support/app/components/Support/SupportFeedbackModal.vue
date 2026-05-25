<script setup lang="ts">
import { useSupportApi } from '#layers/support/app/api/useSupportApi'

const open = defineModel<boolean>('open', { default: false })

const api = useSupportApi()
const toast = useToast()
const loading = ref(false)
const subject = ref('')
const body = ref('')

const isValid = computed(() => subject.value.trim().length > 0 && body.value.trim().length > 0)

async function submit() {
  if (!isValid.value)
    return
  loading.value = true
  try {
    await api.createTicket({ kind: 'feedback', subject: subject.value.trim(), body: body.value.trim() })
    toast.add({ title: 'Thanks for your feedback', description: 'We\'ll follow up in your requests.', color: 'success' })
    subject.value = ''
    body.value = ''
    open.value = false
    await refreshNuxtData('support-tickets')
  }
  catch (err) {
    toast.add({ title: 'Could not send', description: getErrorMessage(err), color: 'error' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Send feedback" description="Tell us what's working or what could be better.">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Subject" required>
          <UInput v-model="subject" placeholder="A short summary" class="w-full" />
        </UFormField>
        <UFormField label="Message" required>
          <UTextarea v-model="body" :rows="5" placeholder="Your feedback…" class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="open = false" />
        <UButton label="Send feedback" :loading="loading" :disabled="!isValid" @click="submit" />
      </div>
    </template>
  </UModal>
</template>
