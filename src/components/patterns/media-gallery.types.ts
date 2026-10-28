import type { StillMedia } from '@/components/ui/media.types'

export interface GalleryItem {
  id: string
  media: StillMedia
  caption?: string
}
