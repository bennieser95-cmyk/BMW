export interface MediaImage {
  type: 'image'
  src: string
  /** Empty string marks the image as decorative. */
  alt: string
  width: number
  height: number
}

/** Royalty-free CSS gradient surface (tokens --gradient-media-1..4) used until real assets exist. */
export interface MediaPlaceholder {
  type: 'placeholder'
  variant: 1 | 2 | 3 | 4
  alt: string
}

export interface MediaVideo {
  type: 'video'
  src: string
  /** Shown until the video may load (after LCP) and when motion is reduced. */
  poster: MediaImage | MediaPlaceholder
}

export type StillMedia = MediaImage | MediaPlaceholder
export type HeroMedia = StillMedia | MediaVideo
