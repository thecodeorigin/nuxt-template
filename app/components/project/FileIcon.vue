<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

type Variant = 'empty-directory' | 'directory' | 'file' | 'image'

interface FileIconProps extends /* @vue-ignore */ HTMLAttributes {
  variant: Variant
  type?: string
  src?: string
}

const { variant, type, src } = defineProps<FileIconProps>()

function getSVG(variant: string) {
  if (variant === 'empty-directory') {
    return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' width=\'786\' height=\'786\' viewBox=\'0 0 786 786\'%3E%3Cdefs%3E%3ClinearGradient id=\'linear-gradient\' x1=\'0.5\' x2=\'0.5\' y2=\'1\' gradientUnits=\'objectBoundingBox\'%3E%3Cstop offset=\'0\' stop-color=\'%238a97ac\'/%3E%3Cstop offset=\'1\' stop-color=\'%235d6c83\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id=\'Group_2\' data-name=\'Group 2\' transform=\'translate(-567 -93)\'%3E%3Crect id=\'Rectangle_4\' data-name=\'Rectangle 4\' width=\'418\' height=\'681\' rx=\'40\' transform=\'translate(896 109)\' fill=\'%2395a5b9\'/%3E%3Crect id=\'Rectangle_3\' data-name=\'Rectangle 3\' width=\'433\' height=\'681\' rx=\'40\' transform=\'translate(606 93)\' fill=\'%23a0aec0\'/%3E%3Crect id=\'Rectangle_2\' data-name=\'Rectangle 2\' width=\'786\' height=\'721\' rx=\'40\' transform=\'translate(567 158)\' fill=\'url(%23linear-gradient)\'/%3E%3C/g%3E%3C/svg%3E%0A")'
  }
  else if (variant === 'directory') {
    return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' width=\'786\' height=\'786\' viewBox=\'0 0 786 786\'%3E%3Cdefs%3E%3ClinearGradient id=\'linear-gradient\' x1=\'0.5\' x2=\'0.5\' y2=\'1\' gradientUnits=\'objectBoundingBox\'%3E%3Cstop offset=\'0\' stop-color=\'%238a97ac\'/%3E%3Cstop offset=\'1\' stop-color=\'%235d6c83\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id=\'Group_3\' data-name=\'Group 3\' transform=\'translate(-567 -93)\'%3E%3Crect id=\'Rectangle_4\' data-name=\'Rectangle 4\' width=\'418\' height=\'681\' rx=\'40\' transform=\'translate(896 109)\' fill=\'%2395a5b9\'/%3E%3Crect id=\'Rectangle_3\' data-name=\'Rectangle 3\' width=\'433\' height=\'681\' rx=\'40\' transform=\'translate(606 93)\' fill=\'%23a0aec0\'/%3E%3Crect id=\'Rectangle_2\' data-name=\'Rectangle 2\' width=\'742\' height=\'734\' rx=\'40\' transform=\'translate(590 145)\' fill=\'%23bec8d9\'/%3E%3Crect id=\'Rectangle_5\' data-name=\'Rectangle 5\' width=\'786\' height=\'692\' rx=\'40\' transform=\'translate(567 187)\' fill=\'url(%23linear-gradient)\'/%3E%3C/g%3E%3C/svg%3E%0A")'
  }
  else if (variant === 'file') {
    return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' width=\'628.027\' height=\'786.012\' viewBox=\'0 0 628.027 786.012\'%3E%3Cdefs%3E%3ClinearGradient id=\'linear-gradient\' x1=\'0.5\' x2=\'0.5\' y2=\'1\' gradientUnits=\'objectBoundingBox\'%3E%3Cstop offset=\'0\' stop-color=\'%238a97ac\'/%3E%3Cstop offset=\'1\' stop-color=\'%235d6c83\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id=\'Group_5\' data-name=\'Group 5\' transform=\'translate(-646 -92.988)\'%3E%3Cpath id=\'Union_2\' data-name=\'Union 2\' d=\'M40,786A40,40,0,0,1,0,746V40A40,40,0,0,1,40,0H501V103h29v24h98V746a40,40,0,0,1-40,40Z\' transform=\'translate(646 93)\' fill=\'url(%23linear-gradient)\'/%3E%3Cpath id=\'Intersection_2\' data-name=\'Intersection 2\' d=\'M.409,162.042l.058-109.9c31.605,29.739,125.37,125.377,125.37,125.377l-109.976.049A20.025,20.025,0,0,1,.409,162.042Z\' transform=\'translate(1147 42)\' fill=\'%23bec8d9\' stroke=\'%23bec8d9\' stroke-width=\'1\'/%3E%3C/g%3E%3C/svg%3E%0A")'
  }
}
</script>

<template>
  <div>
    <div
      :style="{
        backgroundImage: getSVG(variant),
      }"
      class="relative block bg-center bg-no-repeat bg-contain before:content-[''] before:pt-[100%] before:w-full before:block"
      style="height: 100%; background-size: contain; background-position: center;"
    >
      <div
        v-if="variant === 'file'"
        class="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center m-auto text-white"
      >
        {{ type }}
      </div>
      <div
        v-if="variant === 'image'"
        class="absolute top-0 left-0 w-full image-fit"
      >
        <img
          class="rounded-md"
          alt="Midone Tailwind HTML Admin Template"
          :src="src"
        >
      </div>
    </div>
  </div>
</template>
