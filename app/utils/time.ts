export function formatTime(time: number): string {
  const hours = Math.floor(time / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0')
  const seconds = Math.floor(time % 60).toString().padStart(2, '0')
  const milliseconds = Math.floor((time % 1) * 1000).toString().padStart(3, '0')
  return `${hours}:${minutes}:${seconds},${milliseconds}`
}

export function convertToSeconds(time: string) {
  const parts = time.split(':')
  const hours = Number.parseInt(parts[0], 10)
  const minutes = Number.parseInt(parts[1], 10)
  const secondsAndFraction = Number.parseFloat(parts[2])

  return hours * 3600 + minutes * 60 + secondsAndFraction
}
