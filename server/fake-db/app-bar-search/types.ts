export interface SearchItem {
  url: object
  icon: string
  title: string
}

export interface SearchResults {
  title: string
  category: string
  children: SearchItem[]
}
