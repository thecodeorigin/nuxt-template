import type { Tables } from '@/server/types/supabase'

type Notification = Tables<'sys_notifications'>

export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

  const notification = await readBody<Notification>(event)

  const { data, error } = await supabaseAdmin.from('sys_notifications')
    .update(notification)
    .match({
      id: uuid,
      user_id: session.user!.id!,
    })
    .select()
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 200)

  return { data }
})
