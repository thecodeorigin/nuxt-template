import type { FeatureSectionType } from '~/types/landing-page'

export default defineEventHandler(async (event) => {
  const featureReqData = await readBody<FeatureSectionType>(event)

  const { error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      feature_title: featureReqData.feature_title,
      feature_title_desc: featureReqData.feature_title_desc,
      feature_data: featureReqData.feature_data,
    })
    .match({ id: 'df02f75c-afab-41ef-ab6d-e1aa04d7ec6d' })

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { success: true, status: 201 }
})
