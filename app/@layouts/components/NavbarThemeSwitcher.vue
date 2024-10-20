<script setup lang="ts">
import type { ThemeSwitcherTheme } from '@base/@layouts/types'

const { t } = useI18n()

const themes: ThemeSwitcherTheme[] = [
  {
    label: t('System'),
    value: 'system',
    icon: 'ri-macbook-line',
  },
  {
    label: t('Light'),
    value: 'light',
    icon: 'ri-sun-line',
    data: 'button-active-light-theme',
  },
  {
    label: t('Dark'),
    value: 'dark',
    icon: 'ri-moon-clear-line',
    data: 'button-active-dark-theme',
  },
]
</script>

<template>
  <ThemeSwitcher :themes="themes" />
</template>
