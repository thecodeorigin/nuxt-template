import ProjectInviteField from '#layers/project/app/components/Project/ProjectInviteField.vue'

export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'projects', label: 'Projects', icon: 'i-lucide-folder-kanban', to: '/projects', section: 'main', priority: 10 },
    ],
    invitationFields: [
      { id: 'project-invite-field', component: ProjectInviteField },
    ],
  })
})
