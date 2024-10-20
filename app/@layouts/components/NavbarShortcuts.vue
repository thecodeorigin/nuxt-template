<script setup lang="ts">
import type { RouteRecordNormalized } from 'vue-router'

const router = useRouter()

const shortcutStore = useShortcutStore()

const shortCutsRoutes = computed(() => createRouteTree(shortcutStore.userShortcuts.map(shortcut => router.resolve(shortcut.route) as any as RouteRecordNormalized)))

function handleMenuChange(visible: boolean) {
  if (visible) {
    shortcutStore.getUserShortcuts()
  }
}

const route = useRoute()

function handleAddShortcut() {
  shortcutStore.postUserShortcut(route.path)
}
</script>

<template>
  <Shortcuts :shortcuts="shortCutsRoutes" @change="handleMenuChange" @add="handleAddShortcut" />
</template>
