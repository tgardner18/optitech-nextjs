export type SearchResult = {
  id: string
  title: string
  url: string
  type: 'Blog' | 'Page'
  topic?: string
  published?: string
  excerpt?: string
}
