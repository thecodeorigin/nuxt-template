<script setup lang="ts">
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core'

interface Props {
  modelValue?: string | null
}

interface Emits {
  (e: 'update:modelValue', value: File): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dropZoneRef = ref<HTMLDivElement>()
interface FileData {
  file: File
  url: string
}
const fileData = ref<FileData | null>()
const { open, onChange } = useFileDialog({ accept: 'image/*' })

function onDrop(DroppedFiles: File[] | null) {
  DroppedFiles?.forEach((file) => {
    if (file.type.slice(0, 6) !== 'image/') {
      // eslint-disable-next-line no-alert
      alert('Only image files are allowed')

      return
    }

    fileData.value = {
      file,
      url: useObjectUrl(file).value ?? '',
    }
  },
  )
}

onChange((selectedFiles: FileList | null) => {
  if (!selectedFiles)
    return

  for (const file of selectedFiles) {
    fileData.value = {
      file,
      url: useObjectUrl(file).value ?? '',
    }

    emit('update:modelValue', file)
  }
})

function removeFile() {
  if (fileData.value) {
    URL.revokeObjectURL(fileData.value.url)
    fileData.value = null
  }
}

useDropZone(dropZoneRef, onDrop)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && typeof newValue === 'string') {
      fileData.value = { file: null as any, url: newValue }
    }
    else if (!newValue && !fileData.value?.file) {
      removeFile()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex">
    <div class="w-full h-auto relative">
      <div
        ref="dropZoneRef"
        class="cursor-pointer"
        @click="() => open()"
      >
        <div
          v-if="!fileData"
          class="d-flex flex-column justify-center align-center gap-y-2 pa-12 border-dashed drop-zone"
        >
          <VAvatar
            variant="tonal"
            color="secondary"
            rounded
          >
            <VIcon icon="ri-upload-2-line" />
          </VAvatar>
          <h4 class="text-h4 text-wrap">
            Drag and Drop Your Image Here.
          </h4>
          <span class="text-disabled">or</span>

          <VBtn
            variant="outlined"
            size="small"
          >
            Browse Images
          </VBtn>
        </div>

        <div
          v-else
          class="d-flex justify-center align-center gap-3 pa-8 border-dashed drop-zone flex-wrap"
        >
          <VCard :ripple="false" class="w-100">
            <VCardText
              class="d-flex flex-column"
              @click.stop
            >
              <VImg
                :src="fileData.url"
                width="200px"
                height="150px"
                class="w-100 mx-auto"
              />
              <div class="mt-2">
                <span class="clamp-text text-wrap">
                  {{ fileData?.file?.name }}
                </span>
                <span v-if="fileData?.file?.size">
                  {{ (fileData?.file?.size / 1000).toFixed(2) }} KB
                </span>
              </div>
            </VCardText>
            <VCardActions>
              <VBtn
                variant="text"
                block
                @click.stop="removeFile"
              >
                Remove File
              </VBtn>
            </VCardActions>
          </VCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .drop-zone {
    border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 8px;
  }
</style>
