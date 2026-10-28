import { ModelCard } from '@/components/model-card'
import type { Vehicle } from '@/domain/vehicle/vehicle.types'

export function ModelCarousel({ models, locale }: { models: Vehicle[]; locale: string }) {
  return (
    <div aria-label="Modellkarussell" className="model-carousel">
      {models.slice(0, 8).map((vehicle) => (
        <ModelCard key={vehicle.id} locale={locale} vehicle={vehicle} />
      ))}
    </div>
  )
}
