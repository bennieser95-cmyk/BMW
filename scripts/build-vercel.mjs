import { execFileSync } from 'node:child_process'

const isProduction = process.env.VERCEL_ENV === 'production'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

if (!isProduction) {
  execFileSync(npm, ['run', 'db:migrate'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

execFileSync(npm, ['run', 'build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
