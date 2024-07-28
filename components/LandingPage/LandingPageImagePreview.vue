<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [File, String, null] as PropType<File | string | null>,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const fileInputRef = ref<HTMLInputElement | null>(null)

const { previewUrl, onFileChange, removeImage } = useUploadImage(emit)

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal)
      previewUrl.value = null
  },
)

function triggerFileInput() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="landing-page-upload">
    <VFileInput
      :id="props.id"
      ref="fileInputRef"
      type="file"
      accept="image/*"
      @change="onFileChange"
    />

    <div class="landing-page-upload-wrapper mx-auto mt-6">
      <h2 class="landing-page-upload-title">
        Drag and drop your file
      </h2>

      <p class="landing-page-upload-subtitle">
        PNG, JPG, GIF, WEBP, MP4 or MP3. Max 100mb.
      </p>

      <p class="landing-page-upload-description">
        or choose a file
      </p>

      <VBtn
        class="landing-page-upload-btn"
        variant="outlined"
        @click.prevent="triggerFileInput"
      >
        Upload files
      </VBtn>

      <VBtn
        v-if="previewUrl"
        color="secondary"
        class="landing-page-image-remove"
        icon="ri-close-line"
        size="large"
        @click="removeImage"
      />

      <img
        v-if="previewUrl"
        class="landing-page-image-preview"
        :src="previewUrl"
        alt="Image preview"
      >
    </div>
  </div>
</template>

<style lang="scss">
.landing-page-upload-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    width: 380px;
    height: 350px;
    border: 2px dashed #d3d3d3;

    .landing-page-upload-title {
      margin-top: 24px;
      font-weight: 700;
      line-height: 30px;
      text-align: center;
    }

    .landing-page-upload-subtitle {
      margin-top: 20px;
      font-weight: 600;
      line-height: 22px;
      text-align: center;
    }

    .landing-page-upload-description {
      margin-top: 40px;
      font-weight: 600;
      line-height: 20px;
      text-align: center;
    }

    .landing-page-upload-btn {
      width: 160px;
      height: 50px;
      margin-top: 40px;
      border: 2px solid #E2E5E8;
      padding: 6px 24px 6px 24px !important;
      gap: 8px;
      border-radius: 90px;
      font-size: 16px;
      font-weight: 700;
      line-height: 20px;
      text-align: center;
    }

    .landing-page-image-remove {
      cursor: pointer;
      position: absolute;
      z-index: 100;
      top: 10px;
      right: 10px;
      width: 50px;
      height: 50px;

      &:hover {
        transform: scale(1.1);
      }
    }

    .landing-page-image-preview {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: linear-gradient(162.52deg, #36FDDE -33.13%, #F4FDD0 39.28%, #F7EFC2 68.59%, #FFCEA1 104.14%);
    }

  }
</style>
