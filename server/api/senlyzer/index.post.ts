import { useProjectCrud } from '@/server/composables/useProjectCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const user_id = session.user!.id!
    const payload = await readBody(event)
    const project = payload.project

    const response = await $fetch<{ id: string }>('https://www.senlyzer.com/api/senlyzer-batch', {
      method: 'POST',
      body: {
        records: payload.records,
        model: payload.model,
        webhook: `${process.env.SENLYZER_WEBHOOK}?projectId=${project.id}`,
      },
      headers: {
        'x-api-key': process.env.SENLYZER_API_KEY || '',
      },
    })

    const batchId = response.id
    project.structure.resources.push({ type: 'batchId', value: batchId })
    const { updateProjectById } = useProjectCrud({ user_id })
    const updatedProject = await updateProjectById(project.id, { structure: project.structure })

    return updatedProject.data
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
