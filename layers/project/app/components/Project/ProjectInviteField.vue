<script setup lang="ts">
import { useProjectApi } from '#layers/project/app/api/useProjectApi'
import { invitationMetadataKey } from '~/composables/useLayerRegistry'
import { whenError } from '~/utils/error'

const metadata = inject(invitationMetadataKey)
const projectApi = useProjectApi()
const selected = ref<string[]>([])

const { data: projects, error } = useAsyncData('invite-projects', () => projectApi.fetchProjects(), { default: () => [] })
whenError(error)
const options = computed(() => projects.value.map(p => ({ label: p.name, value: p.id })))

watch(selected, (v) => {
  if (!metadata)
    return
  if (v.length)
    metadata.project_ids = v
  else delete metadata.project_ids
})
</script>

<template>
  <UFormField v-if="options.length > 0" label="Projects">
    <USelectMenu v-model="selected" :items="options" value-key="value" label-key="label" multiple placeholder="None" class="min-w-48" />
  </UFormField>
</template>
