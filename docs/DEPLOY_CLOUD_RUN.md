# Deploying PrIM to Cloud Run

PrIM is a **backend-less static SPA** (React 19 + Vite + Tailwind). `vite build`
emits static assets to `dist/`, which are served by an **nginx** container on
Cloud Run. There is no server process, database, or runtime secret.

Deploys are keyless: GitHub Actions authenticates to GCP via **Workload
Identity Federation (WIF)** — no long-lived service-account keys.

- CI (`.github/workflows/ci.yml`) runs on PRs: `npm run lint` (tsc) + `vite build`.
- Deploy (`.github/workflows/deploy-cloud-run.yml`) runs on push to `main`:
  builds the Dockerfile via Cloud Build and deploys to Cloud Run.

> **No secrets.** PrIM does not read any runtime secret. `GEMINI_API_KEY` /
> `APP_URL` in `.env.example` are vestigial from the AI Studio template and are
> not referenced in the source. Even if used, Vite's `define` bakes values into
> the **public** client bundle, so never put a real secret there — it would be
> visible to every visitor. There is therefore no Secret Manager setup and no
> `--set-secrets` in the workflow.

---

## One-time GCP setup

These commands assume the same GCP project used for design-studio
(`design-studio-498915`). Substitute your own project ID if different.

### 1. Enable APIs (skip any already enabled)

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  --project=design-studio-498915
```

> Secret Manager is **not** needed for PrIM.

### 2. WIF pool (reuse if it already exists)

design-studio already has a `github` pool. Reuse it.

### 3. WIF provider — broaden so PrIM can use it

The existing provider is locked to a single repo
(`assertion.repository=='campecho/designStudio'`) and will reject PrIM.
Broaden it to the whole account (per-repo access is still gated by the SA
binding in step 5):

```bash
gcloud iam workload-identity-pools providers update-oidc github \
  --location=global --workload-identity-pool=github \
  --attribute-condition="assertion.repository_owner=='campecho'"
```

(Alternatively, create a second provider scoped to PrIM only.)

### 4. Deploy service account

A dedicated least-privilege SA for PrIM (reusing `gh-deployer` also works):

```bash
gcloud iam service-accounts create prim-deployer \
  --project=design-studio-498915 \
  --display-name="GitHub Actions PrIM deployer"

SA="prim-deployer@design-studio-498915.iam.gserviceaccount.com"
for ROLE in roles/run.admin roles/cloudbuild.builds.editor \
  roles/artifactregistry.admin roles/storage.admin \
  roles/iam.serviceAccountUser ; do
  gcloud projects add-iam-policy-binding design-studio-498915 \
    --member="serviceAccount:$SA" --role="$ROLE"
done
```

> No `roles/secretmanager.secretAccessor` and no runtime-SA secret grant —
> PrIM has no runtime secrets.

### 5. Bind PrIM's repo to the deploy SA

> **Casing matters.** The OIDC `assertion.repository` uses GitHub's canonical
> stored casing. Confirm the exact casing on the GitHub repo's Settings page
> and use it **verbatim** below (shown here as `campecho/PrIM`).

```bash
PN=$(gcloud projects describe design-studio-498915 --format='value(projectNumber)')
SA="prim-deployer@design-studio-498915.iam.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding "$SA" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PN}/locations/global/workloadIdentityPools/github/attribute.repository/campecho/PrIM"
```

---

## GitHub repository Variables

Repo → **Settings → Secrets and variables → Actions → Variables**:

| Variable           | Value                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`   | `design-studio-498915`                                                                     |
| `GCP_REGION`       | `us-central1`                                                                              |
| `CLOUD_RUN_SERVICE`| `prim`                                                                                     |
| `GCP_DEPLOY_SA`    | `prim-deployer@design-studio-498915.iam.gserviceaccount.com`                               |
| `GCP_WIF_PROVIDER` | `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github`   |

Replace `PROJECT_NUMBER` with the output of
`gcloud projects describe design-studio-498915 --format='value(projectNumber)'`.
If you broadened the existing provider (step 3), this value is identical to
design-studio's.

---

## First deploy & verify

1. Open a PR with these files → confirm **CI** passes (lint + build).
2. Merge to `main` → the **Deploy to Cloud Run** workflow fires.
3. On success, the service URL is printed in the "Show service URL" step (and
   visible in the Cloud Run console).

If the deploy fails, check in this order:

1. **WIF condition rejecting the repo** — provider still locked to one repo
   (step 3), or repo-name casing in the SA binding (step 5).
2. **Missing deploy-SA role** — `--source` deploys need
   `cloudbuild.builds.editor`, `storage.admin`, `artifactregistry.admin`,
   `run.admin`, and `iam.serviceAccountUser` (step 4).

## Local container test

```bash
docker build -t prim .
docker run --rm -p 8080:8080 prim   # http://localhost:8080
```
