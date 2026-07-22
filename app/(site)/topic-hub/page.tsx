import { Suspense } from 'react'
import TopicHubContent from './TopicHubContent'

export const metadata = { title: 'Topic Hub' }

export default function TopicHubPage() {
  return (
    <Suspense>
      <TopicHubContent />
    </Suspense>
  )
}
