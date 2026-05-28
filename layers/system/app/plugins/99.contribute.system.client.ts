export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      {
        id: 'system-admin',
        label: 'System Administration',
        icon: 'i-lucide-shield-check',
        section: 'sub',
        priority: 0,
        type: 'trigger',
        defaultOpen: true,
        ability: 'system:manage',
        children: [
          { id: 'system-notifications', label: 'Notifications', to: '/system/notifications', section: 'sub', priority: 0 },
          { id: 'system-tickets', label: 'Tickets', to: '/system/tickets', section: 'sub', priority: 10, ability: 'support:manage' },
        ],
      },
    ],
  })
})
