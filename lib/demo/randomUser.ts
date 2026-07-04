/**
 * Random-user profile shape (from randomuser.me), used by the Traffic
 * Simulator's BigQuery sync payloads.
 *
 * NOTE: the source project also had a `fetchRandomUser()` helper backed by an
 * `/api/random-user` proxy. The Traffic Simulator generates its visitors
 * inline, so that helper/route was intentionally not ported — this module is
 * type-only.
 */
export interface RandomUserProfile {
  gender: 'male' | 'female'
  name: { title: string; first: string; last: string }
  email: string
  phone: string
  cell: string
  picture: { large: string; medium: string; thumbnail: string }
  location: {
    street: { number: number; name: string }
    city: string
    state: string
    country: string
    postcode: string
  }
  dob: { date: string; age: number }
  login: { uuid: string; username: string }
}
