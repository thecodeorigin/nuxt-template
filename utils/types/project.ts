import type { ParsedSubtitle } from '../srt'

export enum AIModel {
  FASTED = 'tiny',
  BALANCE = 'medium',
  MOST_ACCURATE = 'large-v3',
}

export interface Subtitle extends ParsedSubtitle {
  selected?: boolean
  speaker?: string
}
