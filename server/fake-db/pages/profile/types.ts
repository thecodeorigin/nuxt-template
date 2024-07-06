export interface ProfileChip {
  title: string
  color: string
}

export interface ProfileTabCommon {
  icon: string
  value: string
  property: string
}
export type ProfileTeams = ProfileTabCommon & { color: string }

export interface ProfileConnections {
  name: string
  avatar: string
  isFriend: boolean
  connections: string
}

export interface ProfileAvatarGroup {
  name: string
  avatar: string
}

export interface ProfileTeamsTech {
  title: string
  avatar: string
  members: number
  chipText: string
  ChipColor: string
}

export interface ConnectionsTab {
  name: string
  tasks: string
  avatar: string
  projects: string
  connections: string
  designation: string
  isConnected: boolean
  chips: ProfileChip[]
}

export interface ProfileTab {
  teams: ProfileTeams[]
  about: ProfileTabCommon[]
  contacts: ProfileTabCommon[]
  overview: ProfileTabCommon[]
  teamsTech: ProfileTeamsTech[]
  connections: ProfileConnections[]
}

export interface ProfileHeader {
  fullName: string
  coverImg: string
  location: string
  profileImg: string
  joiningDate: string
  designation: string
  designationIcon?: string
}

export interface ProjectTableRow {
  id: number
  date: string
  name: string
  leader: string
  status: number
  avatar?: string
  avatarGroup: string[]
  avatarColor?: string
}

export interface ProjectsTab {
  hours: string
  tasks: string
  title: string
  budget: string
  client: string
  avatar: string
  members: string
  daysLeft: number
  comments: number
  deadline: string
  startDate: string
  totalTask: number
  budgetSpent: string
  description: string
  chipColor: string
  completedTask: number
  avatarColor?: string
  avatarGroup: ProfileAvatarGroup[]
}

export interface TeamsTab {
  title: string
  avatar: string
  description: string
  extraMembers?: number
  chips: ProfileChip[]
  avatarGroup: ProfileAvatarGroup[]
}
