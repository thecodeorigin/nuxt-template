import type { FeatureSectionType, ProductStatType } from '~/types/landing-page'

export default defineEventHandler(async (event) => {
  const productStatSectionData = await readBody<ProductStatType[]>(event)

  const { error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      product_stats: [
        ...productStatSectionData,
      ],
    })
    .match({ id: 'df02f75c-afab-41ef-ab6d-e1aa04d7ec6d' })

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { success: true, status: 201 }
})
