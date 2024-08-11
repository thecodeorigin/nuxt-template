<script setup lang="ts">
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core'

const dropZoneRef = ref<HTMLDivElement>()
interface FileData {
  file: File
  url: string
}

const fileData = ref<FileData[]>([])
const { open, onChange } = useFileDialog({ accept: 'image/*' })

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

onChange((selectedFiles: any) => {
  if (!selectedFiles)
    return

  for (const file of selectedFiles) {
    fileData.value.push({
      file,
      url: useObjectUrl(file).value ?? '',
    })
  }
})

useDropZone(dropZoneRef, onDrop)
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
      <VRow class="match-height w-100">
        <template
          v-for="(item, index) in fileData"
          :key="index"
        >
          <VCol
            cols="12"
            sm="4"
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
                    {{ item.file.name }}
                  </span>
                  <span>
                    {{ item.file.size / 1000 }} KB
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
