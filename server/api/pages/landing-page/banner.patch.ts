import { getLandingPageId } from './landingPageID.get'
import type { BannerSectionType } from '~/types/landing-page'

export default defineEventHandler(async (event) => {
  const bannerReqBody = await readBody<BannerSectionType>(event)

  const landingPageId = await getLandingPageId()

  const { error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      banner_title: bannerReqBody.banner_title,
      banner_title_desc: bannerReqBody.banner_title_desc,
      banner_button: bannerReqBody.banner_button,
      banner_image: bannerReqBody.banner_image,
    })
    .match({ id: landingPageId })

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { success: true, status: 201 }
})
