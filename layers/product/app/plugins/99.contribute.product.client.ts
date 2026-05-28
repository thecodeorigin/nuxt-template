export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'products', label: 'Products', icon: 'i-lucide-package', to: '/products', section: 'main', priority: 5, ability: ['product:manage', 'product:write'] },
    ],
  })
})
