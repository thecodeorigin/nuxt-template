<script setup lang="ts">
import { useTheme } from 'vuetify'

defineEmits<{
  (e: 'signin', provider: string): void
}>()

const { t } = useI18n()

const { global } = useTheme()

const authProviders = computed(() => [
  {
    icon: 'bxl-google',
    color: '#db4437',
    colorInDark: '#db4437',
    provider: 'google',
    label: t('Sign in with Google'),
  },
  {
    icon: 'bxl-facebook',
    color: '#497CE2',
    colorInDark: '#497CE2',
    provider: 'facebook',
    label: t('Sign in with Facebook'),
  },
  {
    icon: 'bxl-github',
    color: '#272727',
    colorInDark: '#fff',
    provider: 'github',
    label: t('Sign in with Github'),
  },
])
</script>

<template>
  <div v-for="link in authProviders" :key="link.icon" class="mb-2">
    <VBtn
      style="inline-size: 100%;"
      size="large"
      :color="global.name.value === 'dark' ? link.colorInDark : link.color"
      @click="$emit('signin', link.provider)"
    >
      <VIcon :icon="link.icon" class="mr-2" />
      {{ link.label }}
    </VBtn>
  </div>
</template>
