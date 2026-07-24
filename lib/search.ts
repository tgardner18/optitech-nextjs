export type SearchResult = {
  id: string
  title: string
  url: string
  type: 'Blog' | 'Page' | 'Event' | 'Location' | 'Practitioner'
  topic?: string
  published?: string
  excerpt?: string
  imageUrl?: string
  /** Event-only fields — present when type === 'Event'. */
  eventType?: string
  startDate?: string
  endDate?: string
  locationType?: string
  locationLabel?: string
  /** Location-only fields — present when type === 'Location'. */
  address?: string
  locationBadge?: string
  /** Practitioner-only fields — present when type === 'Practitioner'. */
  credentials?: string
  practitionerTitle?: string
  /** Opaque URL returned by Content Graph for click-through hit tracking. Fire
   *  a GET request to this URL when the user navigates to the result. */
  _track?: string | null
}
