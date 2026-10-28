'use client'

import { useRef, useState } from 'react'

import { getMessages } from '@/lib/messages'

const galleryBackgrounds = [
  'linear-gradient(135deg, #293848, #8396a4)',
  'linear-gradient(135deg, #34443d, #9aa78e)',
  'linear-gradient(135deg, #3c3031, #a68d88)',
]

export function MediaGallery({ modelName, locale }: { modelName: string; locale: string }) {
  const messages = getMessages(locale)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const images = galleryBackgrounds.map((background, index) => ({
    background,
    alt: `${modelName} – ${locale === 'de-de' ? 'synthetische Galerieansicht' : 'synthetic gallery view'} ${index + 1}`,
  }))

  function moveGallery(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + images.length) % images.length)
  }

  return <>
    <div aria-label={messages.vehicle.gallery} className="gallery-grid">
      {images.map((image, index) => <button
        aria-label={`${image.alt} – ${locale === 'de-de' ? 'Vollbild öffnen' : 'Open full screen'}`}
        className="gallery-image"
        key={image.alt}
        onClick={() => { setActiveIndex(index); dialogRef.current?.showModal() }}
        style={{ background: image.background }}
        type="button"
      ><span className="visually-hidden">{image.alt}</span><span className="vehicle-silhouette" aria-hidden="true" /></button>)}
    </div>
    <dialog aria-label={messages.vehicle.gallery} className="gallery-dialog" onClick={(event) => {
      if (event.target === dialogRef.current) dialogRef.current?.close()
    }} onKeyDown={(event) => {
      if (event.key === 'ArrowRight') moveGallery(1)
      if (event.key === 'ArrowLeft') moveGallery(-1)
    }} onTouchEnd={(event) => {
      if (touchStart === null) return
      const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart
      if (Math.abs(delta) > 40) moveGallery(delta < 0 ? 1 : -1)
      setTouchStart(null)
    }} onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} ref={dialogRef}>
      <button aria-label={messages.common.close} className="gallery-close" onClick={() => dialogRef.current?.close()} type="button">×</button>
      <button aria-label={locale === 'de-de' ? 'Vorheriges Bild' : 'Previous image'} className="gallery-previous" onClick={() => moveGallery(-1)} type="button">←</button>
      <div aria-label={images[activeIndex]?.alt} className="gallery-full-image" role="img" style={{ background: images[activeIndex]?.background }}>
        <span className="vehicle-silhouette" aria-hidden="true" />
      </div>
      <button aria-label={locale === 'de-de' ? 'Nächstes Bild' : 'Next image'} className="gallery-next" onClick={() => moveGallery(1)} type="button">→</button>
      <p>{images[activeIndex]?.alt} · {activeIndex + 1}/{images.length}</p>
    </dialog>
  </>
}
