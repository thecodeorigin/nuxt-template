<script setup lang="ts">
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core'

type ImageType = 'main' | 'sub'
type ImageTheme = 'light' | 'dark'

interface Props {
  modelValue: string | null
  imageType: 'main' | 'sub'
  imageTheme: 'light' | 'dark'
}

interface Emits {
  (e: 'update:modelValue', value: string, imageType: ImageType, imageTheme: ImageTheme): void
}

interface FileData {
  file: File
  url: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  imageType: 'main',
  imageTheme: 'light',
})
const emit = defineEmits<Emits>()

const dropZoneRef = ref<HTMLDivElement>()
const fileData = ref<FileData[]>([])
const { open, onChange } = useFileDialog({ accept: 'image/*' })

const imageName = computed(() => {
  return props?.modelValue?.split('/').pop()
})

function onDrop(DroppedFiles: File[] | null) {
  DroppedFiles?.forEach((file) => {
    if (file.type.slice(0, 6) !== 'image/') {
      // eslint-disable-next-line no-alert
      alert('Only image files are allowed')

      return
    }

    fileData.value.push({
      file,
      url: useObjectUrl(file).value ?? '',
    })
  },
  )
}

onChange(async (selectedFiles: any) => {
  if (!selectedFiles)
    return

  for (const file of selectedFiles) {
    fileData.value.push({
      file,
      url: useObjectUrl(file).value ?? '',
    })
  }
  let imageUrl = ''
  const ext = selectedFiles[0].name.split('.').pop()
  const filename = selectedFiles[0].name.replace(/\s/, '_')
  imageUrl = await uploadToS3(selectedFiles[0], `landing-page/${filename || `${new Date().getTime()}.${ext}`}`)

  emit('update:modelValue', imageUrl, props.imageType, props.imageTheme)
})

useDropZone(dropZoneRef, onDrop)

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fileData.value = [{ file: null as any, url: newValue }]
  }
  else {
    fileData.value = []
  }
}, { immediate: true })
</script>

<template>
  <div
    ref="dropZoneRef"
    class="cursor-pointer"
    @click="() => open()"
  >
    <div
      v-if="fileData.length === 0"
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
      class="d-flex justify-center align-center gap-3 pa-8 border-dashed drop-zone flex-wrap"
    >
      <VRow class="match-height w-100">
        <template
          v-for="(item, index) in fileData"
          :key="index"
        >
          <VCol
            cols="12"
            sm="12"
          >
            <VCard :ripple="false">
              <VCardText
                class="d-flex flex-column"
                @click.stop
              >
                <VImg
                  :src="item.url"
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
                  @click.stop="fileData.splice(index, 1)"
                >
                  Remove File
                </VBtn>
              </VCardActions>
            </VCard>
          </VCol>
        </template>
      </VRow>
    </div>
  </div>
</template>

<style lang="scss">
  .drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
}
</style>
