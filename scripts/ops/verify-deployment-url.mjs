const rawUrl = process.env.BASE_URL
const projectSlug = process.env.VERCEL_PROJECT_SLUG
const stagingHost = process.env.STAGING_HOST
const projectId = process.env.VERCEL_PROJECT_ID
const teamId = process.env.VERCEL_ORG_ID
const vercelToken = process.env.VERCEL_READ_TOKEN

if (!rawUrl || !projectSlug || !projectId || !teamId || !vercelToken) {
  throw new Error(
    'BASE_URL, VERCEL_PROJECT_SLUG, VERCEL_PROJECT_ID, VERCEL_ORG_ID, and VERCEL_READ_TOKEN are required.',
  )
}

const url = new URL(rawUrl)
const allowedVercelHost =
  url.hostname.startsWith(`${projectSlug}-`) && url.hostname.endsWith('.vercel.app')
const allowedStagingHost = stagingHost && url.hostname === stagingHost

if (
  url.protocol !== 'https:' ||
  url.username ||
  url.password ||
  url.port ||
  (!allowedVercelHost && !allowedStagingHost)
) {
  throw new Error(`Deployment URL is not an approved HTTPS host: ${url.origin}`)
}

const deploymentResponse = await fetch(
  `https://api.vercel.com/v13/deployments/${encodeURIComponent(url.hostname)}?teamId=${encodeURIComponent(teamId)}`,
  {
    headers: { authorization: `Bearer ${vercelToken}` },
    signal: AbortSignal.timeout(10_000),
  },
)

if (!deploymentResponse.ok) {
  throw new Error(
    `Could not verify deployment ownership with Vercel (HTTP ${deploymentResponse.status}).`,
  )
}

const deployment = await deploymentResponse.json()
const deploymentHosts = [deployment.url, ...(deployment.alias ?? [])]
if (deployment.projectId !== projectId || !deploymentHosts.includes(url.hostname)) {
  throw new Error('Deployment URL does not belong to the configured Vercel project.')
}

process.stdout.write(`Validated deployment host: ${url.hostname}\n`)
