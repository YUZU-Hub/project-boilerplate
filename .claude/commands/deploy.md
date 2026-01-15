# Manual Deployment

Trigger deployments manually via GitHub Actions.

## Deploy Web

Go to GitHub Actions and run "Deploy Web" workflow, or:

```bash
gh workflow run deploy-web.yml
```

## Deploy API

The API auto-deploys via Coolify when changes are pushed to `api/`.

To trigger manually via GitHub Actions:
```bash
gh workflow run deploy-api.yml
```

Note: This only notifies - actual deployment happens through Coolify's git integration.

## Check Deployment Status

### Web
```bash
gh run list --workflow=deploy-web.yml --limit=5
```

### API (Coolify)
Check your Coolify dashboard for deployment status and logs.
