# Google Cloud Integration for Community Publishing

I founded Unbound Maker Community to work with women, young people and
cross-disciplinary creators on AI, smart hardware and robotics. Research,
workshops and project mentoring also generated material worth sharing beyond
an individual event. I built the publishing infrastructure to support that work.

The architecture uses Firebase Hosting for static delivery, Cloud Run for
container execution and Firestore for durable data. Cloud Build and Artifact
Registry support image delivery; IAM and Secret Manager define identity and
configuration boundaries. This public package isolates the generic integration
layer from the community application.

[中文项目叙述](PROJECT_CONTEXT.zh-CN.md) | [Integration guide](TECHNICAL_GUIDE.md)

## Integration Boundaries

```text
Operator-owned static content -> Firebase Hosting
                                  -> optional rewrite -> operator-owned Cloud Run service
Operator-owned application -> generic Firestore document adapter -> Firestore

Application source -> Cloud Build identity -> Artifact Registry image
Deployer -> Cloud Run runtime identity -> ADC/IAM -> Firestore
Secret Manager -> deployment-time secret injection -> application environment
```

Static content, the HTTP service and business data models are supplied by the
integrating application. The repository does not bundle those application layers.

## Static Delivery and Container Execution

The [Hosting template](../config/firebase.template.json) separates revalidated
HTML from one-hour asset caching. An optional `/services/**` rewrite connects to
an operator-selected Cloud Run service and uses non-cacheable responses.

This keeps content delivery separate from backend execution. Asset filenames are
not content-hashed by the template, so changing cache policy or asset versioning
remains an application decision. The supplied `site/` path and service name must
be replaced/configured in the integrating project before deployment.

## Generic Firestore Document Operations

The [document adapter](../modules/firestore-documents.js) accepts a caller-selected
collection and document key. It exposes reads and a transaction-based
`createOnce` operation: the first write creates the document; subsequent calls
return the existing value without overwriting it.

This generalizes a storage reliability concern without exporting a business
schema. It is first-write behavior for a chosen key, not exactly-once delivery
or validation that two caller payloads mean the same thing. Access authorization
and the contents of a document remain the integrating application's responsibility.

The [runtime configuration module](../modules/runtime-config.js) reads only
explicit cloud opt-in, project and collection. The SDK is loaded only when a
cloud adapter is intentionally created; importing the module does not initialize
a client. Runtime credentials use ADC rather than a downloaded key in source.

## Build Identity and Runtime Identity

The [build template](../config/cloudbuild.template.yaml) builds an operator-owned
application and pushes an Artifact Registry image using a dedicated build identity.
It does not deploy the service or read application secrets. The
[container reference](../config/Dockerfile) requires the application's
own package files, lockfile and entry point, and runs as a non-root user.

The deployer needs permission to deploy and act as the runtime account. The
runtime account needs only its application's data/secret access. The Cloud Run
platform service agent handles same-project image pulls; it is not the runtime
or build identity. The guide shows Secret Manager deployment injection without
publishing credential values.

## Community Context and Public Scope

The companion Strategic Signal Scanner supports the earlier research stage.
I review technical material, select topics and prepare content for publication.
The projects connect through this research and editorial work.

These modules adapt integration patterns from the original project. They are
reference components rather than a copy of the deployed application. The
[technical guide](TECHNICAL_GUIDE.md) describes how an operator supplies the missing
application layers and configures Google Cloud resources.

[Rights](../RIGHTS.md) and [third-party notices](../THIRD_PARTY_NOTICES.md) apply.
