<script setup lang="ts">
import type { TicketCategory } from '@nuxthub/db/schema'
import { TICKET_CATEGORIES } from '@nuxthub/db/schema'
import { useSupportApi } from '#layers/support/app/api/useSupportApi'
import { useSupportTicketOpen } from '#layers/support/app/composables/useSupportModal'

const props = withDefaults(defineProps<{ open?: boolean }>(), { open: false })
const emit = defineEmits<{ 'update:open': [boolean] }>()

const internalOpen = useSupportTicketOpen()
const open = computed({
  get: () => props.open || internalOpen.value,
  set: (val) => {
    internalOpen.value = val
    emit('update:open', val)
  },
})

const api = useSupportApi()
const toast = useToast()
const loading = ref(false)
const category = ref<TicketCategory>()
const subject = ref('')
const body = ref('')

const categoryItems = TICKET_CATEGORIES.map(c => ({
  label: c.charAt(0).toUpperCase() + c.slice(1),
  value: c,
}))

const isValid = computed(() => !!category.value && subject.value.trim().length > 0 && body.value.trim().length > 0)

async function submit() {
  if (!isValid.value || !category.value)
    return
  loading.value = true
  try {
    await api.createTicket({ kind: 'support', category: category.value, subject: subject.value.trim(), body: body.value.trim() })
    toast.add({ title: 'Request submitted', description: 'We\'ll reply in your requests.', color: 'success' })
    category.value = undefined
    subject.value = ''
    body.value = ''
    open.value = false
    await refreshNuxtData('support-tickets')
  }
  catch (err) {
    toast.add({ title: 'Could not submit', description: getErrorMessage(err), color: 'error' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Help & support" description="Tell us what you need help with.">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Category" required>
          <USelect v-model="category" :items="categoryItems" value-key="value" placeholder="Choose a category" class="w-full" />
        </UFormField>
        <UFormField label="Subject" required>
          <UInput v-model="subject" placeholder="A short summary" class="w-full" />
        </UFormField>
        <UFormField label="Message" required>
          <UTextarea v-model="body" :rows="5" placeholder="Describe the issue…" class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="open = false" />
        <UButton label="Submit request" :loading="loading" :disabled="!isValid" @click="submit" />
      </div>
    </template>
  </UModal>
</template>
