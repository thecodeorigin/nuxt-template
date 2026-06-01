export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      {
        id: 'settings-self-host',
        label: 'Self-hosting',
        to: '/settings/self-host',
        section: 'settings',
        priority: 90,
        ability: ['selfhost:read', 'selfhost:manage'],
      },
    ],
  })
})
