<script setup lang="ts">
import type { RouteRecordNormalized } from 'vue-router'
import type { NavItem } from '@base/@layouts/types'

const router = useRouter()
const { t } = useI18n()

const shortcutStore = useShortcutStore()
const shortCutsRoutes = computed(() => shortcutStore.userShortcuts.map((shortcut) => {
  return {
    item: shortcut,
    route: createRouteTree([router.resolve(shortcut.route) as any as RouteRecordNormalized])[0] as NavItem,
  }
}))

function handleMenuChange(visible: boolean) {
  if (visible) {
    shortcutStore.getUserShortcuts()
  }
}

const route = useRoute()

function handleAddShortcut() {
  shortcutStore.postUserShortcut(route.path)
}
async function handleDeleteShortcut(shortcutId: string) {
  try {
    await confirmation({
      title: t('Heads Up!'),
      body: t('Are you sure you want to delete this shortcut?'),
    })
    shortcutStore.deleteUserShortcut(shortcutId)
  }
  catch {}
}
</script>

<template>
  <Shortcuts :shortcuts="shortCutsRoutes" @change="handleMenuChange" @add="handleAddShortcut" @delete="handleDeleteShortcut" />
</template>
