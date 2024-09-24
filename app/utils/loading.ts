export function loading() {
  const layoutStore = useLayoutStore()

  layoutStore.showLoading()

  function hide() {
    layoutStore.hideLoading()
  }

  return {
    /**
     * Alias for `hideLoading`
     */
    hide,
    hideLoading: hide,
  }
}
