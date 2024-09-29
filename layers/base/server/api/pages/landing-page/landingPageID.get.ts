export async function getLandingPageId() {
  const { data: landingPageData, error: landingPageError } = await supabaseAdmin
    .from('sys_landing_page')
    .select('id')
    .limit(1)

  if (landingPageError || !landingPageData || landingPageData.length === 0) {
    throw new Error('Landing page not found or an error occurred')
  }
  return landingPageData[0].id
}
