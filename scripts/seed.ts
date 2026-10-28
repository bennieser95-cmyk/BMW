import { leadRepository } from '../src/infrastructure/db/lead.repository'

if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
  throw new Error('Synthetic seeds are prohibited in production')
}

async function seed(): Promise<void> {
  await leadRepository.create({
    kind: 'contact',
    firstName: 'Synthetic',
    lastName: 'Example',
    email: 'synthetic@example.invalid',
    consentAt: new Date(),
    createdAt: new Date(),
  })
}

void seed().catch(() => {
  process.stderr.write('Synthetic seed failed. Check database configuration.\n')
  process.exitCode = 1
})
