import { maxBy } from 'lodash-es'

export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })
  const { url } = await readBody(event)

  const response = await $fetch<any>('https://dl.senlyzer.com', {
    method: 'POST',
    body: {
      url,
    },
  })

  let videoUrl = ''
  let videoMimetype = ''
  let audioUrl = ''
  let audioMimetype = ''

  if (response.formats) {
    function saveVideoFormat(video: any) {
      if (video?.video_ext) {
        switch (video.video_ext) {
          case 'mp4':
            videoUrl = video.url
            videoMimetype = 'video/mp4'
            break
          case 'webm':
            videoUrl = video.url
            videoMimetype = 'video/webm'
            break
        }
      }
    }

    function saveAudioFormat(audio: any) {
      if (audio?.audio_ext) {
        switch (audio.audio_ext) {
          case 'mp3':
            audioUrl = audio.url
            audioMimetype = 'audio/mp3'
            break
          case 'webm':
            audioUrl = audio.url
            audioMimetype = 'audio/webm'
            break
        }
      }
    }

    function getBestVideoFormat() {
      const video = maxBy(
        response.formats.filter((f: any) => f.protocol.includes('http') && f.video_ext),
        (f: any) => f.height,
      )

      saveVideoFormat(video)
    }

    function getBestAudioFormat() {
      const audio = maxBy(
        response.formats.filter((f: any) => f.protocol.includes('http') && f.audio_ext),
        (f: any) => f.abr,
      )

      saveAudioFormat(audio)
    }

    function getBestVideoFormatWithAudio() {
      const video = maxBy(
        response.formats.filter((f: any) => f.protocol.includes('http') && f.video_ext && f.audio_channels),
        (f: any) => f.height,
      )

      saveVideoFormat(video)
    }

    getBestVideoFormat()
    getBestAudioFormat()

    if (videoUrl && !audioUrl)
      getBestVideoFormatWithAudio()
  }

  return {
    title: response.title as string,
    videoUrl,
    videoMimetype,
    audioUrl,
    audioMimetype,
    thumbnail: response.thumbnail as string,
    duration: response.duration as number,
  }
})
