<script setup lang="ts">
import type { ThemeSwitcherTheme } from '@base/@layouts/types'

const themes: ThemeSwitcherTheme[] = [
  {
    name: 'system',
    icon: 'ri-macbook-line',
  },
  {
    name: 'light',
    icon: 'ri-sun-line',
    data: 'button-active-light-theme',
  },
  {
    name: 'dark',
    icon: 'ri-moon-clear-line',
    data: 'button-active-dark-theme',
  },
]
</script>

<template>
  <ThemeSwitcher :themes="themes" />
</template>
