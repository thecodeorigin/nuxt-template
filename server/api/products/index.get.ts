export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event)

    const { getProducts } = useProduct()

    const products = await getProducts()

    return { data: products }
  }
  catch (error: any) {
    console.error('[Products API] Error fetching products:', error)

    throw parseError(error)
  }
})
