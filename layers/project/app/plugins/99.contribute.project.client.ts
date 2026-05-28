export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'projects', label: 'Projects', icon: 'i-lucide-folder-kanban', to: '/projects', section: 'main', priority: 10 },
    ],
  })
})
