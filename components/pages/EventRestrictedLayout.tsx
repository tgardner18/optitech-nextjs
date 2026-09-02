'use client'

import { useState, useEffect } from 'react'

interface Props {
  isRestricted:   boolean
  initialSidebar: boolean
  children:       React.ReactNode
  sidebar:        React.ReactNode
}

export default function EventRestrictedLayout({
  isRestricted,
  initialSidebar,
  children,
  sidebar,
}: Props) {
  const [showSidebar, setShowSidebar] = useState(initialSidebar)

  useEffect(() => {
    if (!isRestricted) return
    const onIn  = () => setShowSidebar(true)
    const onOut = () => setShowSidebar(false)
    window.addEventListener('aba-member-signed-in',  onIn)
    window.addEventListener('aba-member-signed-out', onOut)
    return () => {
      window.removeEventListener('aba-member-signed-in',  onIn)
      window.removeEventListener('aba-member-signed-out', onOut)
    }
  }, [isRestricted])

  return (
    <div className={`grid grid-cols-1 gap-xl items-start ${showSidebar ? 'lg:grid-cols-[65fr_35fr]' : ''}`}>
      <div className="order-2 lg:order-1 min-w-0">
        {children}
      </div>
      {showSidebar && (
        <aside className="order-1 lg:order-2 lg:sticky lg:top-24 min-w-0">
          {sidebar}
        </aside>
      )}
    </div>
  )
}
