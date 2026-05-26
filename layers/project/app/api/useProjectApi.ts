import type { Project, ProjectMember, ProjectProduct } from '#layers/project/server/db/schema'
import type { AddProjectMember, AddProjectProduct, CreateProject, UpdateProject } from '#layers/project/shared/schemas/project'

export interface ProjectMemberDetail {
  user_id: string
  role: 'owner' | 'member' | 'viewer'
  added_at: Date | null
  name: string | null
  username: string | null
  avatar: string | null
}

export interface ProjectDetail extends Project {
  members: ProjectMemberDetail[]
  products: ProjectProduct[]
}

export function useProjectApi() {
  function fetchProjects() {
    return $http<Project[]>('/api/projects')
  }

  function fetchProject(id: string) {
    return $http<ProjectDetail>(`/api/projects/${id}`)
  }

  function createProject(body: CreateProject) {
    return $http<Project>('/api/projects', { method: 'POST', body })
  }

  function updateProject(id: string, body: UpdateProject) {
    return $http<Project>(`/api/projects/${id}`, { method: 'PATCH', body })
  }

  function deleteProject(id: string) {
    return $http<{ success: boolean }>(`/api/projects/${id}`, { method: 'DELETE' })
  }

  function addProduct(projectId: string, body: AddProjectProduct) {
    return $http<ProjectProduct>(`/api/projects/${projectId}/products`, { method: 'POST', body })
  }

  function removeProduct(projectId: string, productId: string) {
    return $http<{ success: boolean }>(`/api/projects/${projectId}/products/${productId}`, { method: 'DELETE' })
  }

  function addMember(projectId: string, body: AddProjectMember) {
    return $http<ProjectMember>(`/api/projects/${projectId}/members`, { method: 'POST', body })
  }

  function removeMember(projectId: string, userId: string) {
    return $http<{ success: boolean }>(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' })
  }

  return { fetchProjects, fetchProject, createProject, updateProject, deleteProject, addProduct, removeProduct, addMember, removeMember }
}
