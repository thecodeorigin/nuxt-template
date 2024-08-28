<script setup lang="ts">
import { VTextField, VTextarea } from 'vuetify/components'
import { VForm } from 'vuetify/components/VForm'

const prop = defineProps<{
  projectId: string
  inputType: 'input' | 'textarea'
  label: string
  fieldName: string
}>()

const text = defineModel<string>({ required: true })
const isEditVisible = defineModel<boolean>('isEditVisible', { default: false })
const textHolder = ref(text.value)

const vFormRef = ref<VForm>()
const projectStore = useProjectStore()

async function onSubmitted() {
  const { valid } = await vFormRef.value!.validate()
  if (valid) {
    try {
      await projectStore.updateProject(prop.projectId, { [prop.fieldName]: textHolder.value })
      text.value = textHolder.value
    }
    catch (error) {
      console.error('error', error)
    }
    isEditVisible.value = false
  }
}
</script>

<template>
  <VForm
    ref="vFormRef"
    @submit.prevent="onSubmitted"
  >
    <Component
      :is="inputType === 'textarea' ? VTextarea : VTextField"
      v-model="textHolder"
      :label="label"
      placeholder="Enter subtitle"
      :rules="[requiredValidator]"
    />
    <VRow class="mt-2">
      <VCol cols="12">
        <VBtn
          color="primary"
          class="mr-2"
          type="submit"
        >
          Save
        </VBtn>
        <VBtn
          color="error"
          @click="isEditVisible = false"
        >
          Cancel
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
