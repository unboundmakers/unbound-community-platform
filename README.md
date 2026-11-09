# Unbound Community Google Cloud Integrations

Generic Google Cloud modules and configuration references from the Unbound
Maker Community publishing project.

I built the community's publishing infrastructure alongside research, workshops
and project mentoring. The underlying engineering work connects static delivery,
container execution, durable storage and runtime identity. This repository
exposes that integration layer without the community application.

[Project context in Chinese](docs/PROJECT_CONTEXT.zh-CN.md) |
[Google Cloud case study](docs/GOOGLE_CLOUD_CASE_STUDY.md) |
[Technical guide](docs/TECHNICAL_GUIDE.md) | [中文说明](README.zh-CN.md)

## Included

| Module | Scope |
| --- | --- |
| `modules/firestore-documents.js` | Generic document reads and transaction-based create-once writes |
| `modules/runtime-config.js` | Explicit project/collection configuration and cloud opt-in |
| `config/firebase.template.json` | Hosting cache headers and an optional Cloud Run rewrite |
| `config/cloudbuild.template.yaml` | Container build, Artifact Registry image output and dedicated build identity |
| `config/Dockerfile` | Non-root Node container reference for an operator-owned application |
| `docs/` | Architecture, ADC/IAM, runtime secret injection and integration instructions |

The document adapter has no event schema, reaction handling, aggregation or HTTP
routes. The package contains no dashboard, browser client, website content or
running application. Static content and service implementation are supplied by
the integrating application.

## Inspect Locally

Node.js 22+ can inspect module syntax without installing a provider SDK or
contacting Google Cloud:

```sh
npm run check
```

Importing a module does not initialize a cloud client. Creating the Firestore
adapter requires explicit `enabled: true`, a project and collection. Real use
requires the Firestore dependency and authorized ADC. See the
[integration guide](docs/TECHNICAL_GUIDE.md).

## Configuration References

The Hosting template expects operator-owned static files in `site/` and an
operator-supplied Cloud Run service. The image-build template is submitted
against an existing application source directory. The container reference
expects that application to provide its package files, lockfile and entry point.
These templates are not commands to deploy a bundled application from this repo.

Build, deployer, platform service agent and runtime identities have different
permissions. Secret Manager injection is configured by deployment; credentials
and secret values do not belong in source or returned configuration.

## Rights

Source visibility grants no new reuse license. Original contributions reserve
all rights, and commercial use requires prior written authorization. See
[RIGHTS.md](RIGHTS.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
