export interface Dealer {
  id: string
  name: string
  city: string
  postalCode: string
  address: string
  geo: { lat: number; lon: number }
  services: string[]
}
