import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const environmentFile = '.vercel/.env.production.local'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

if (!existsSync(environmentFile)) {
  throw new Error(
    `Missing ${environmentFile}; run "vercel pull --yes --environment=production" first.`,
  )
}

process.loadEnvFile(environmentFile)

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED was not provided by the production Vercel environment.')
}

execFileSync(npm, ['run', 'db:migrate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
