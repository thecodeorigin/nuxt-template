<script setup lang="ts">
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core'

interface Props {
  modelValue: string | null
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

interface FileData {
  file: File
  url: string
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dropZoneRef = ref<HTMLDivElement>()
const fileData = ref<FileData | null>()
const { open, onChange } = useFileDialog({ accept: 'image/*' })

const imageName = computed(() => {
  return props?.modelValue?.split('/').pop()
})

function onDrop(droppedFiles: File[] | null) {
  const file = droppedFiles?.[0]
  if (file) {
    if (file.type.slice(0, 6) !== 'image/') {
      // eslint-disable-next-line no-alert
      alert('Only image files are allowed')
      return
    }

    fileData.value = {
      file,
      url: useObjectUrl(file).value ?? '',
    }
  }
}

onChange(async (selectedFiles: FileList | null) => {
  if (!selectedFiles || selectedFiles.length === 0)
    return

  const file = selectedFiles[0]

  if (!file)
    return

  fileData.value = {
    file,
    url: useObjectUrl(file).value ?? '',
  }

  const ext = file.name.split('.').pop()
  const filename = file.name.replace(/\s/g, '_')
  const imageUrl = await uploadToS3(file, `landing-page/${filename || `${Date.now()}.${ext}`}`)

  emit('update:modelValue', imageUrl)
})

useDropZone(dropZoneRef, onDrop)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      fileData.value = { file: null as any, url: newValue }
    }
    else {
      fileData.value = null
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    ref="dropZoneRef"
    class="single-dropzone cursor-pointer"
    @click="() => open()"
  >
    <div
      v-if="!fileData"
      class="d-flex flex-column justify-center align-center gap-y-2 pa-8 border-dashed drop-zone"
    >
      <VAvatar
        variant="tonal"
        color="secondary"
        rounded
      >
        <VIcon icon="ri-upload-2-line" />
      </VAvatar>
      <h4 class="text-h4 text-wrap text-center clamp-text">
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
      class="d-flex justify-center align-center gap-3 pa-8 border-dashed drop-zone"
    >
      <VCard :ripple="false" class="w-100">
        <VCardText class="d-flex flex-column">
          <VImg
            :src="fileData.url"
            width="200px"
            height="150px"
            class="w-100 mx-auto"
          />
          <div class="mt-2">
            <span class="clamp-text text-wrap">
              {{ imageName }}
            </span>
          </div>
        </VCardText>
        <VCardActions>
          <VBtn
            variant="text"
            block
            @click.stop="fileData = null"
          >
            Remove File
          </VBtn>
        </VCardActions>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
.drop-zone {
  border: 1px dashed var(--v-border-color);
  border-radius: 8px;
}
</style>
