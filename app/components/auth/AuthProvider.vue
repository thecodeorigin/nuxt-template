<script setup lang="ts">
import { useTheme } from 'vuetify'

defineEmits<{
  (e: 'signin', provider: string): void
}>()

const { global } = useTheme()

const authProviders = [
  {
    icon: 'bxl-facebook',
    color: '#497CE2',
    colorInDark: '#497CE2',
    provider: 'facebook',
    label: 'Facebook',
  },
  {
    icon: 'bxl-github',
    color: '#272727',
    colorInDark: '#fff',
    provider: 'github',
    label: 'Github',
  },
  {
    icon: 'bxl-google',
    color: '#db4437',
    colorInDark: '#db4437',
    provider: 'google',
    label: 'Google',
  },
]
</script>

<template>
  <div class="d-flex justify-center flex-wrap gap-2">
    <VBtn
      v-for="link in authProviders"
      :key="link.icon"
      :color="global.name.value === 'dark' ? link.colorInDark : link.color"
      @click="$emit('signin', link.provider)"
    >
      <VIcon :icon="link.icon" class="mr-2" />
      {{ link.label }}
    </VBtn>
  </div>
</template>
