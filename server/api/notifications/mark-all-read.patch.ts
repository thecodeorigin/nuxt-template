import type { Tables } from '@/server/types/supabase'

type Notification = Tables<'sys_notifications'>

export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true, detail: true })
  const notification = await readBody<Notification>(event)
  const { data, error } = await supabaseAdmin.from('sys_notifications')
    .update(notification)
    .eq('user_id', session.user.id)
    .is('read_at', null)

  if (error) {
    setResponseStatus(event, 400, error.message)
  }
  else {
    setResponseStatus(event, 200)
  }

  return { data }
})
