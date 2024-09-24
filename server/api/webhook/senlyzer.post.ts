import { readSRT } from '@utils/srt'
import { ProjectStatus } from '@utils/types/project'
import { useProjectCrud } from '@/server/composables/useProjectCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event)
    const query = getQuery(event)
    const payload = await readBody(event)
    const projectId = query.projectId as string
    const data = payload.data[0]
    let subtitle = [] as typeof data.subtitle
    if (data.srt) {
      const response = await fetch(data.srt).then(res => res.text())
      subtitle = readSRT(response)
    }

    const body = {
      source_url: data.link,
      source_title: data.title,
      summarize: data.summarize,
      subtitle,
      status: ProjectStatus.SUCCEEDED,
    }
    const { updateProjectById } = useProjectCrud({})
    await updateProjectById(projectId, body)

    setResponseStatus(event, 200)

    return { message: 'Webhook received from senlyzer! ' }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
