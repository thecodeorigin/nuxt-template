import type { InjectionKey } from 'vue'
import type { Project } from '#layers/project/server/db/schema'

export interface ProjectsContext {
  projects: Ref<Project[]>
  fetchProjects: () => Promise<void>
  createProject: (body: import('#layers/project/shared/schemas/project').CreateProject) => Promise<Project>
  updateProject: (id: string, body: import('#layers/project/shared/schemas/project').UpdateProject) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
}

export const projectsKey: InjectionKey<ProjectsContext> = Symbol('projects')

export function useProjects(): ProjectsContext {
  const ctx = inject(projectsKey)
  if (!ctx)
    throw new Error('useProjects() must be called inside a component that provides projectsKey')
  return ctx
}
