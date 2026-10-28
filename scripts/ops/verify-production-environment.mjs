const token = process.env.GH_TOKEN
const repository = process.env.GITHUB_REPOSITORY

if (!token || !repository) {
  throw new Error('GH_TOKEN and GITHUB_REPOSITORY are required.')
}

async function getGitHubJson(path) {
  const response = await fetch(`https://api.github.com/repos/${repository}/${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
    },
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new Error(`GitHub protection rules could not be verified (HTTP ${response.status}).`)
  }
  return response.json()
}

const environment = await getGitHubJson('environments/production')
const hasRequiredReviewers = environment.protection_rules?.some(
  (rule) =>
    rule.type === 'required_reviewers' &&
    Array.isArray(rule.reviewers) &&
    rule.reviewers.length > 0 &&
    rule.prevent_self_review === true,
)

if (
  !hasRequiredReviewers ||
  environment.deployment_branch_policy?.custom_branch_policies !== true
) {
  throw new Error(
    'Production must require reviewers, block self-review, and use custom deployment tag policies.',
  )
}

const { branch_policies: branchPolicies } = await getGitHubJson(
  'environments/production/deployment-branch-policies',
)
const hasReleaseTagPolicy = branchPolicies?.some(
  (policy) => policy.type === 'tag' && policy.name === 'v*',
)

if (!hasReleaseTagPolicy) {
  throw new Error('Production must allow release tags matching v*.')
}

process.stdout.write('Production environment protections are configured.\n')
