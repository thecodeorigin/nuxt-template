import type { InferSelectModel } from 'drizzle-orm'
import type { projectTable } from '@/server/db/schemas/project.schema.js'

type Project = InferSelectModel<typeof projectTable>

export interface PostSenlyzerDownloadableResponse {
  title: string
  videoUrl: string
  videoMimetype: string
  audioUrl: string
  audioMimetype: string
  thumbnail: string
  duration: number
}

export interface SenlyzerRecord {
  link: string
  language?: string
  diarization?: boolean
  xid: string
}

export interface SenlyzerPayload {
  records: SenlyzerRecord[]
  model?: string
  project: Project
  webhook?: string
}

export interface SenlyzerDownloadablePayload {
  url: string
}

export interface PostSenlyzerResponse {
  inserted: number
  id: string
}
