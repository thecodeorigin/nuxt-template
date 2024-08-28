import { Packer } from 'docx'
import { createPdf, templatePdfFromSubtitle } from './pdf'
import { createDocx, templateDocxFromSubtitle } from './docx'
import { formatTime } from './time'
import type { Subtitle } from './types/project'

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

export function downloadSRT(subtitle: Subtitle[], filename?: string) {
  const srt = subtitle.map(
    (item, index) =>
      [
        item.id || index,
        `${formatTime(item.start)} --> ${formatTime(item.end)}`,
        `${item?.text?.trim()}\n`,
      ].join('\n'),
  ).join('\n')

  const blob = new Blob([srt], { type: 'text/plain' })

  downloadBlob(blob, `${filename || new Date().toISOString()}.srt`)
}

export function downloadPdf(subtitle: Subtitle[], filename?: string) {
  const pdf = createPdf(templatePdfFromSubtitle(subtitle, filename))

  pdf.getBlob((blob: any) => {
    downloadBlob(blob, `${filename || new Date().toISOString()}.pdf`)
  })
}

export function downloadDocx(subtitle: Subtitle[], filename?: string) {
  const docx = createDocx(templateDocxFromSubtitle(subtitle, filename))

  Packer.toBlob(docx).then((blob: any) => {
    downloadBlob(blob, `${filename || new Date().toISOString()}.docx`)
  })
};
