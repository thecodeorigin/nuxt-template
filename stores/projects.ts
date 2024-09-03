import type { Tables } from '@/server/types/supabase'

type Project = Tables<'projects'>
export const useProjectStore = defineStore('project', () => {
  async function updateProject(id: string, payload: Partial<Project>) {
    return $api<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  function deleteProject(id: string) {
    return $api<Project>(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  function fetchProject(id: string) {
    return $api<Project>(`/projects/${id}`, {
      method: 'GET',
    })
  }

  return {
    updateProject,
    deleteProject,
    fetchProject,
  }
})
