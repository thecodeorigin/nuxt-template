export const genId = <T extends { id: number | string }>(array: T[]) => {
  const { length } = array

  let lastIndex = 0

  if (length)
    lastIndex = Number(array[length - 1]?.id) + 1

  return lastIndex || (length + 1)
}
