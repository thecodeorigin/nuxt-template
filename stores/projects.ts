export const useProjectStore = defineStore('project', () => {
  async function updateProject(id: string, project: any) {
    await useApi(`/projects/${id}`, {
      method: 'PATCH',
      body: project,
    })
  }

  async function deleteProject(id: string) {
    await useApi(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async function getProject(id: string) {
    try {
      return await useApi(`/projects/${id}`)
    }
    catch (error) {
      console.error(error)
    }
  }

  return {
    updateProject,
    deleteProject,
    getProject,
  }
})
