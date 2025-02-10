import type { ParsedContent } from '@nuxt/content'
import type { Avatar, Badge, Link } from '#ui/types'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'

export interface User {
  id: number
  name: string
  email: string
  avatar?: Avatar
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: Avatar
}

export interface Notification {
  id: string
  created_at: string
  title: string
  message: string
  read_at?: string | null
  user_id: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface BlogPost extends ParsedContent {
  title: string
  description: string
  date: string
  image?: HTMLImageElement
  badge?: Badge
  authors?: ({
    name: string
    description?: string
    avatar: Avatar
  } & Link)[]
}
