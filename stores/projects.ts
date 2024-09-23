import type { InferSelectModel } from 'drizzle-orm'
import type { projectTable } from '@/server/db/schemas/project.schema.js'

type Project = InferSelectModel<typeof projectTable>
interface ResponseProject {
  data: Project[]
  total: number
}
export const useProjectStore = defineStore('project', () => {
  async function updateProject(id: string, payload: Partial<Project>) {
    return $api<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  function deleteProject(listIdProjects: string[]) {
    return $api<Project>(`/projects`, {
      method: 'DELETE',
      body: { listIdProjects },
    })
  }

  function fetchProject(id: string) {
    return $api<Project>(`/projects/${id}`, {
      method: 'GET',
    })
  }
  async function fetchProjects(query: Partial<ParsedFilterQuery>) {
    return $api<ResponseProject>('/projects', {
      query,
    })
  }

  function createProject(payload: Partial<Project>) {
    return $api<Project>('/projects', {
      method: 'POST',
      body: payload,
    })
  }

  return {
    updateProject,
    deleteProject,
    fetchProject,
    fetchProjects,
    createProject,
  }
})
