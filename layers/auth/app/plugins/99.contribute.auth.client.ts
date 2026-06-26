export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'home', label: 'Home', icon: 'i-lucide-house', to: '/dashboard', section: 'main', priority: 0 },
    ],
  })
})
