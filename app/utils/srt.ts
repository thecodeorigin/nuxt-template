// @ts-expect-error
import parseSRT from 'parse-srt'

import { convertToSeconds } from '../../layers/base/app/utils/time'

export interface ParsedSubtitle {
  id?: number
  start: number
  end: number
  text: string
}

export function readSRT(srt: string) {
  const subtitle = parseSRT(srt) as ParsedSubtitle[]

  return subtitle.map((item) => {
    const startTime = new Date(Number(item.start) * 1000).toISOString().slice(11, 22)
    const endTime = new Date(Number(item.end) * 1000).toISOString().slice(11, 22)

    return {
      ...item,
      text: item.text.replace('<br />', '\n'),
      start: convertToSeconds(startTime),
      end: convertToSeconds(endTime),
    }
  })
}

export async function readSRTFile(file: File) {
  return new Promise<ParsedSubtitle[]>((resolve) => {
    const reader = new FileReader()

    reader.onload = function (e) {
      try {
        const text = e.target!.result
        const subtitle = readSRT(text as string)

        resolve(subtitle)
      }
      catch (error: any) {
        console.error(error)
        // BaseToast({
        //   title: $gettextLazy('Lỗi!') as any as string,
        //   message: $gettextLazy('Có lỗi xảy ra khi xử lý file .srt!') as any as string,
        //   type: 'error',
        // })

        resolve([])
      }
    }

    reader.readAsText(file)
  })
}
