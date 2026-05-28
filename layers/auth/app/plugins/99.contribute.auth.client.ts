export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'home', label: 'Home', icon: 'i-lucide-house', to: '/dashboard', section: 'main', priority: 0 },
      { id: 'settings-general', label: 'General', to: '/settings', section: 'settings', priority: 0 },
      { id: 'settings-notifications', label: 'Notifications', to: '/settings/notifications', section: 'settings', priority: 30 },
      { id: 'settings-security', label: 'Security', to: '/settings/security', section: 'settings', priority: 40 },
    ],
  })
})
