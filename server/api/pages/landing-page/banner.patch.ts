import type { BannerSectionType } from '~/types/landing-page'

export default defineEventHandler(async (event) => {
  const bannerReqBody = await readBody<BannerSectionType>(event)

  const { error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      banner_title: bannerReqBody.banner_title,
      banner_title_desc: bannerReqBody.banner_title_desc,
      banner_button: bannerReqBody.banner_button,
      banner_img: bannerReqBody.banner_img,
    })
    .match({ id: 'df02f75c-afab-41ef-ab6d-e1aa04d7ec6d' })

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { success: true, status: 201 }
})
