import type { Project } from '@nuxthub/db/schema'
import type { InjectionKey } from 'vue'

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
