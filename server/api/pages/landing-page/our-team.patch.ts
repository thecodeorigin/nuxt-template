import { getLandingPageId } from './landingPageID.get'
import type { Tables } from '@/server/types/supabase'

type Team = Tables<'sys_landing_page'>

export default defineEventHandler(async (event) => {
  const customerReqBody = await readBody<Partial<Team>>(event)

  const landingPageId = await getLandingPageId()

  const { error } = await supabaseAdmin.from('sys_landing_page')
    .update({
      our_team_data: customerReqBody.our_team_data,
      our_team_title: customerReqBody.our_team_title,
      our_team_desc: customerReqBody.our_team_desc,
    })
    .match({
      id: landingPageId,
    })

  if (error) {
    setResponseStatus(event, 400, error.message)
    return { error: error?.message }
  }
  else {
    setResponseStatus(event, 201)
  }

  return { success: true }
})
