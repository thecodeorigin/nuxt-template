import { ref } from 'vue'

export function useUploadImage(emit: (event: 'update:modelValue', value: File | null) => void) {
  const previewUrl = ref<string | null>(null)

  const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement

    if (target.files && target.files[0]) {
      const file = target.files[0]

      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target?.result as string
      }

      reader.readAsDataURL(file)

      emit('update:modelValue', file)
    }
  }

  const removeImage = () => {
    previewUrl.value = null
    emit('update:modelValue', null)
  }

  return {
    previewUrl,
    onFileChange,
    removeImage,
  }
}
