<script setup lang="ts">
const dropZoneRef = ref<HTMLDivElement>()
interface FileData {
  files: File[]
  url: string
}
const fileData = defineModel<FileData>({ required: true })

const { open, onChange } = useFileDialog({ multiple: false, reset: true, accept: '.mp4, .mov, .mkv, .avi, .srt, .mp3' })

onChange((selectedFiles: any) => {
  if (!selectedFiles)
    return

  for (const file of selectedFiles) {
    fileData.value.files[0] = file
  }
})
function selectFile() {
  if (fileData.value.url.trim() !== '')
    return
  open()
}
</script>

<template>
  <VCard class="mb-6">
    <VCardItem>
      <template #title>
        Resource from computer
      </template>
    </VCardItem>

    <VCardText>
      <div class="flex">
        <div class="w-full h-auto relative">
          <div
            ref="dropZoneRef"
            class="border-dashed drop-zone py-8"
          >
            <div
              class="d-flex flex-column justify-center align-center gap-y-2 pt-2 "
            >
              <VAvatar
                variant="tonal"
                color="secondary"
                rounded
              >
                <VIcon icon="ri-upload-2-line" />
              </VAvatar>
              <h4 class="text-h4 text-wrap">
                Select up to 1 file (video, audio, or subtitles) to start
              </h4>
              <span class="text-disabled">Allowed file types include .mp4, .mov, .mkv, .avi, .srt, .mp3</span>

              <VBtn
                variant="outlined"
                size="small"
                data-test="button-select-project-file"
                :disabled="fileData.url.trim() !== ''"
                :style="{ cursor: fileData.url.trim() !== '' ? 'not-allowed' : 'pointer' }"
                @click="selectFile"
              >
                Select File
              </VBtn>
            </div>

            <div
              v-if="fileData.files.length !== 0"
              class="d-flex justify-center align-center gap-3 pa-8 pb-0 flex-wrap"
            >
              <VRow class="justify-center match-height w-100">
                <template
                  v-for="(item, index) in fileData.files"
                  :key="index"
                >
                  <VCol>
                    <VCard :ripple="false">
                      <VCardText
                        class="d-flex flex-column"
                        @click.stop
                      >
                        <div class="mt-2 d-flex flex-column align-center">
                          <span class="clamp-text text-center text-h6 text-wrap w-100">
                            {{ item.name }}
                          </span>
                        </div>
                      </VCardText>
                      <VCardActions>
                        <VBtn
                          data-test="button-remove-project-file"
                          variant="text"
                          block
                          @click.stop="fileData.files.splice(index, 1)"
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
        </div>
      </div>
    </VCardText>
    <VCardItem>
      <template #title>
        Add resource from URL
      </template>
    </VCardItem>
    <VCardText>
      <div class="flex">
        <VTextField
          v-model="fileData.url"
          data-test="input-project-source-url"
          :rules="[fileData.files.length === 0 ? requiredValidator : null]"
          :disabled="fileData.files.length !== 0"
          placeholder="Example: https://www.youtube.com/watch?v=YkeWTEULGwU"
        />
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
  .drop-zone {
    border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 8px;
  }
</style>
