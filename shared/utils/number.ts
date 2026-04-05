export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}
