'use client'

import { useEffect, useState } from 'react'

export interface SubnavItem {
  id: string
  label: string
}

export function StickySubnav({ items }: { items: SubnavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const itemIds = items.map(({ id }) => id).join(',')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0]
        if (visibleEntry) setActiveId(visibleEntry.target.id)
      },
      { rootMargin: '-20% 0px -65% 0px' },
    )
    itemIds
      .split(',')
      .filter(Boolean)
      .forEach((id) => {
        const section = document.getElementById(id)
        if (section) observer.observe(section)
      })
    return () => observer.disconnect()
  }, [itemIds])

  return (
    <nav aria-label="Seitennavigation" className="filter-bar">
      {items.map(({ id, label }) => (
        <a aria-current={activeId === id ? 'location' : undefined} href={`#${id}`} key={id}>
          {label}
        </a>
      ))}
    </nav>
  )
}
