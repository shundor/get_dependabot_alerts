# Get Dependabot Alerts

This repo contains sample Node.js code for pulling all Dependabot alerts for a GitHub Organization or Repo using Octokit.

## Installation

1. Rename env to .env. Set the following environment variables:  
GH_TOKEN=(Your [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token))  
GH_ORG=(Your GitHub organization name)

If you are only interested in Dependabot alerts for a single GitHub repository, also set the following environment variable:  
GH_REPO=(Your repo)

2. Install dependencies:
```
npm install
```
3. Run the script:
```
npm start
```

## Output
* `dependabot-alerts.json` gets generated with all the Dependabot alerts for the GitHub Organization. 
* If GH_REPO gets specified, `REPONAME-dependabot-alerts.json` gets generated with all the Dependabot alerts for the GitHub repo.

Sample output:
```json
[
  {
    "name": "InsecureApp",
    "url": "https://github.com/fakeorg/InsecureApp",
    "vulnerabilityAlerts": {
      "nodes": [
        {
          "createdAt": "2022-04-05T16:17:20Z",
          "dismissReason": "No bandwidth to fix this",
          "dismissedAt": "2022-04-13T15:59:14Z",
          "dismisser": {
            "login": "abirismyname"
          },
          "securityAdvisory": {
            "description": "Affected versions of `minimist` are vulnerable to prototype pollution. Arguments are not properly sanitized, allowing an attacker to modify the prototype of `Object`, causing the addition or modification of an existing property that will exist on all objects.  \nParsing the argument `--__proto__.y=Polluted` adds a `y` property with value `Polluted` to all objects. The argument `--__proto__=Polluted` raises and uncaught error and crashes the application.  \nThis is exploitable if attackers have control over the arguments being passed to `minimist`.\n\n\n\n## Recommendation\n\nUpgrade to versions 0.2.1, 1.2.3 or later.",
            "ghsaId": "GHSA-vh95-rmgr-6w4m",
            "cvss": {
              "score": 5.6
            },
            "severity": "MODERATE",
            "summary": "Prototype Pollution in minimist"
          },
          "vulnerableManifestPath": "package-lock.json",
          "vulnerableManifestFilename": "package-lock.json"
        },
        {
          "createdAt": "2022-02-10T20:58:10Z",
          "dismissReason": null,
          "dismissedAt": null,
          "dismisser": null,
          "securityAdvisory": {
            "description": "A prototype pollution vulnerability affects all versions of package pathval under 1.1.1.",
            "ghsaId": "GHSA-g6ww-v8xp-vmwg",
            "cvss": {
              "score": 7.2
            },
            "severity": "HIGH",
            "summary": "Prototype pollution in pathval"
          },
          "vulnerableManifestPath": "package-lock.json",
          "vulnerableManifestFilename": "package-lock.json"
        },
        {
          "createdAt": "2022-04-11T13:34:05Z",
          "dismissReason": null,
          "dismissedAt": null,
          "dismisser": null,
          "securityAdvisory": {
            "description": "Minimist <=1.2.5 is vulnerable to Prototype Pollution via file index.js, function setKey() (lines 69-95).",
            "ghsaId": "GHSA-xvch-5gv4-984h",
            "cvss": {
              "score": 9.8
            },
            "severity": "CRITICAL",
            "summary": "Prototype Pollution in minimist"
          },
          "vulnerableManifestPath": "package-lock.json",
          "vulnerableManifestFilename": "package-lock.json"
        }
      ],
      "pageInfo": {
        "endCursor": "Y3Vyc29yOnYyOpHOg72uXw==",
        "hasNextPage": false
      }
    }
  },
  ...
  ]
  ```

## Credits

* Thanks to [Vulnerability Auditor](https://github.com/lindluni/warden-vulnerability-auditor) example and inspiration