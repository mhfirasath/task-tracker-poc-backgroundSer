---
name: full-deployment
description: Validate, commit, push, build a Podman image and deploy the task-tracker UI to Cloud Run (frontend-ui). Use when the user asks to ship, release or deploy the frontend.
---

# Full deployment: task-tracker-ui

Run from the repo root. Stop and report on any failure; do not skip a failing step.

## Fixed settings

- GCP project: `backend-api-512807`
- gcloud account: `mfirasath33@gmail.com` (pass `--account` on every gcloud call)
- Region: `asia-south1`
- Artifact Registry repo: `frontend-ui`
- Image: `asia-south1-docker.pkg.dev/backend-api-512807/frontend-ui/frontend-ui`
- Cloud Run service: `frontend-ui`
- Backend URL: `https://task-tracker-api-265125450659.asia-south1.run.app`

## Confirmation rule

Ask the user for confirmation before each of: `git push`, `podman push`, and any `gcloud` command that creates or changes resources (`run deploy`, `artifacts repositories create`). Read-only gcloud calls need no confirmation. One "go" covers only the steps listed in the question that was asked.

## Steps

1. **Review changes**: `git status --short` and `git diff --stat`; summarise modified and new files.
2. **Dependencies**: `npm ls --depth=0`; run `npm install` only if it reports missing or invalid packages.
3. **Lint**: `npm run lint` (oxlint).
4. **Type check and build**: `npm run build` (runs `tsc -b && vite build`). Fix issues if possible and re-run. Record the `dist/` file sizes.
5. **Commit**: write a conventional commit message (`feat(scope): ...`, `fix:`, `build:` etc.) and `git add -A && git commit`. End the message with the Co-Authored-By line from the session's attribution reminder.
6. **Push** (confirm first): `git push origin main`. If git cannot prompt for credentials, tell the user to push from their own terminal.
7. **Build image**: `SHA=$(git rev-parse --short HEAD)`, then
   `podman build --build-arg VITE_API_BASE_URL=<backend URL> -t <image>:latest -t <image>:$SHA .`
   The API URL is baked in at build time, so the build arg is required.
8. **Verify image**: `podman images <image>` shows both `latest` and `$SHA`.
9. **Push image** (confirm first): log in with
   `gcloud auth print-access-token --account <account> | podman login -u oauth2accesstoken --password-stdin asia-south1-docker.pkg.dev`,
   then `podman push` both tags. A login error can appear even when the push works; verify with
   `gcloud artifacts docker images list <registry>/backend-api-512807/frontend-ui --include-tags`.
10. **Deploy** (confirm first):
    `gcloud run deploy frontend-ui --image <image>:$SHA --region asia-south1 --port 80 --allow-unauthenticated --project backend-api-512807 --account <account>`
11. **Verify**: request the service URL and expect HTTP 200.

## Environment notes

- On this Windows machine, run `gcloud` from PowerShell. From Bash it fails with "Python was not found".
- nginx in the image listens on port 80, so `--port 80` is required on Cloud Run.
- The backend must allow the deployed frontend origin in its CORS settings; remind the user after a first deploy.

## Report

Finish with a deployment report: modified files, commit hash, build output, image name, image tags, Cloud Run revision and service URL, and anything not completed (for example a failed push).
