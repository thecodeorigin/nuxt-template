import type { Tables } from '@/server/types/supabase'

type Notification = Tables<'sys_notifications'>

export default defineEventHandler(async (event) => {
  const session = await setAuthOnlyRoute(event)
  const notification = await readBody<Notification>(event)
  const { data, error } = await supabaseAdmin.from('sys_notifications')
    .update(notification)
    .eq('user_id', session.user.id)
    .not('read_at', 'is', null)

  if (error) {
    setResponseStatus(event, 400, error.message)
  }
  else {
    setResponseStatus(event, 200)
  }

  return { data }
})
