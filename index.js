require('dotenv').config()
const fs = require('fs')
const { Octokit } = require('@octokit/rest')
const { retry } = require('@octokit/plugin-retry')
const { throttling } = require('@octokit/plugin-throttling')
const _Octokit = Octokit.plugin(retry, throttling)

const query = `query($org: String!, $cursor: String){
  organization(login: $org) {
    repositories(first: 100, after: $cursor) {
      nodes {
        name
        url
        vulnerabilityAlerts(first: 100) {
          nodes {
            createdAt
            dismissReason
            dismissedAt
            dismisser {
              login
            }
            securityAdvisory {
              description
              ghsaId
              cvss {
                score
              }
              severity
              summary  
            }
            vulnerableManifestPath
            vulnerableManifestFilename
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`

const repoQuery = `query fetchRepoAlerts ($org: String!, $repo:String!, $cursor: String!) {
  repository(owner: $org, name: $repo) {
    vulnerabilityAlerts(first: 100, after: $cursor) {
      nodes {
        createdAt
        dismissReason
        dismissedAt
        dismisser {
          login
        }
        securityAdvisory {
          description
          ghsaId
          cvss {
            score
          }
          severity
          summary  
        }
        vulnerableManifestPath
        vulnerableManifestFilename
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`

async function createClient (token) {
  return new _Octokit({
    auth: token,
    request: {
      retries: 100
    },
    throttle: {
      onRateLimit: (retryAfter, options, octokit) => {
        octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`)
        if (options.request.retryCount === 0) {
          octokit.log.info(`Retrying after ${retryAfter} seconds!`)
          return true
        }
      },
      onAbuseLimit: (retryAfter, options, octokit) => {
        if (options.request.retryCount === 0) {
          octokit.log.warn(`Abuse detected for request ${options.method} ${options.url}`)
          octokit.log.info(`Retrying after ${retryAfter} seconds!`)
          return true
        }
      }
    }
  })
}

async function retrieveAlerts (token, org) {
  let cursor = null
  let pageIndex = 1
  let hasNextPage = true
  const vulnerableRepos = []
  const client = await createClient(token)
  while (hasNextPage) {
    const response = await client.graphql(query, {
      org: org,
      cursor: cursor
    })
    for (const repo of response.organization.repositories.nodes) {
      vulnerableRepos.push(repo)
      if (repo.vulnerabilityAlerts.pageInfo.hasNextPage) {
        console.log(`Found > 100 vulnerabilities, fetching all vulnerabilities: ${repo.name}`)
        const repoAlerts = await retrieveAllAlerts(client, org, repo.name, repo.vulnerabilityAlerts.pageInfo.endCursor)  
        vulnerableRepos.push(repoAlerts)
        }
      }
      cursor = response.organization.repositories.pageInfo.endCursor
      hasNextPage = response.organization.repositories.pageInfo.hasNextPage  
    }
  await fs.writeFileSync('dependabot-alerts.json', JSON.stringify(vulnerableRepos, null, 2))
}

async function retrieveAllAlerts (client, org, repo, endCursor) {
  let hasNextPage = true
  let cursor = endCursor
  const alerts = []
  let pageIndex = 1
  while (hasNextPage) {
    console.log(`Scanning repo page: ${pageIndex++}`)
    const response = await client.graphql(repoQuery, {
      org: org,
      repo: repo,
      cursor: cursor
    })
    alerts.push(response.repository)
    cursor = response.repository.vulnerabilityAlerts.pageInfo.endCursor
    hasNextPage = response.repository.vulnerabilityAlerts.pageInfo.hasNextPage
  }
  return alerts
}

(async function main () {
  const GH_TOKEN = process.env.GH_TOKEN
  const GH_ORG = process.env.GH_ORG
  const GH_REPO = process.env.GH_REPO

  if (!GH_REPO) {
    await retrieveAlerts(GH_TOKEN, GH_ORG)
  }
  else {
    const client = await createClient(GH_TOKEN)
    const alerts = await retrieveAllAlerts(client, GH_ORG, GH_REPO, "Y3Vyc29yOnYyOpHOBXNPbQ==")
    await fs.writeFileSync(`${GH_REPO}-dependabot-alerts.json`, JSON.stringify(alerts, null, 2))
  }
})()
