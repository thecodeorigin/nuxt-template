export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'settings-billing', label: 'Billing', to: '/settings/billing', section: 'settings', priority: 10, ability: 'billing:read' },
    ],
  })
})
