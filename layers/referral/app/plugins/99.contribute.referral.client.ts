export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'referral', label: 'Referral', icon: 'i-lucide-gift', to: '/referral', section: 'main', priority: 20 },
    ],
  })
})
