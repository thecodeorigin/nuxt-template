import { useStorage } from '@vueuse/core'
import { useTheme } from 'vuetify'
import { useConfigStore } from '@base/@core/stores/config'
import { namespaceConfig } from '@base/@layouts/stores/config'

function _syncAppRtl() {
  const configStore = useConfigStore()

  const { locale, localeProperties } = useI18n({ useScope: 'global' })

  // watch and change lang attribute of html on language change
  watch(
    locale,
    (val) => {
      // Update lang attribute of html tag
      if (typeof document !== 'undefined')
        document.documentElement.setAttribute('lang', val as string)

      configStore.isAppRTL = localeProperties.value.dir === 'rtl'
    },
    { immediate: true },
  )
}

function _handleSkinChanges() {
  const { themes } = useTheme()
  const configStore = useConfigStore()

  // Create skin default color so that we can revert back to original (default skin) color when switch to default skin from bordered skin
  Object.values(themes.value).forEach((t) => {
    t.colors['skin-default-background'] = t.colors.background
    t.colors['skin-default-surface'] = t.colors.surface
  })

  watch(
    () => configStore.skin,
    (val) => {
      Object.values(themes.value).forEach((t) => {
        t.colors.background = t.colors[`skin-${val}-background`]!
        t.colors.surface = t.colors[`skin-${val}-surface`]!
      })
    },
    { immediate: true },
  )
}

/*
    ℹ️ Set current theme's surface color in localStorage

    Why? Because when initial loader is shown (before vue is ready) we need to what's the current theme's surface color.
    We will use color stored in localStorage to set the initial loader's background color.

    With this we will be able to show correct background color for the initial loader even before vue identify the current theme.
  */
function _syncInitialLoaderTheme() {
  const vuetifyTheme = useTheme()

  watch(
    () => useConfigStore().theme,
    () => {
      // ℹ️ We are not using theme.current.colors.surface because watcher is independent and when this watcher is ran `theme` computed is not updated
      useStorage<string | null>(namespaceConfig('initial-loader-bg'), null).value = vuetifyTheme.current.value.colors.surface
      useStorage<string | null>(namespaceConfig('initial-loader-color'), null).value = vuetifyTheme.current.value.colors.primary
    },
    { immediate: true },
  )
}

function initCore() {
  _syncInitialLoaderTheme()
  _handleSkinChanges()

  _syncAppRtl()
}

export default initCore
