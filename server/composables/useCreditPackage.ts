export function useCreditPackage() {
  function getCreditPackages() {
    return db.query.creditPackageTable.findMany({
      orderBy(schema, { asc }) {
        return [
          asc(schema.position),
        ]
      },
    })
  }

  function getCreditPackageByProductId(productId: string) {
    return db.query.creditPackageTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.id, productId)
      },
      columns: {
        id: true,
        price: true,
        amount: true,
      },
    })
  }

  return {
    getCreditPackages,
    getCreditPackageByProductId,
  }
}
