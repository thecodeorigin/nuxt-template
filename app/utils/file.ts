export function isVideoFile(file: File) {
  return file.type.includes('video')
}

export function isSubtitleFile(file: File) {
  return file.name.endsWith('.srt')
}

export function isAudioFile(file: File) {
  return file.type.includes('audio')
}

/**
 *
 * @returns return video or audio duration in seconds
 */
export function getFileDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (!isVideoFile(file) && !isAudioFile(file)) {
      resolve(0)
    }
    else {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        resolve(video.duration)
      }
      video.src = URL.createObjectURL(file)
    }
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

export async function uploadToS3(file: File, filename: string) {
  const { uploadUrl, assetUrl } = await useApiS3().getSignedUrl(filename)

  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
  })

  return assetUrl
}
