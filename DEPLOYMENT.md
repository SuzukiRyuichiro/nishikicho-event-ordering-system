# Firebase GitHub Actions Deployment Setup

This guide explains how to set up automated deployment to Firebase App Hosting using GitHub Actions.

## Prerequisites

1. GitHub repository set up
2. Firebase project: `nishikicho-event-app`
3. Firebase App Hosting configured

## Setup Instructions

### 1. Create Firebase Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `nishikicho-event-app`
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Fill in the details:
   - **Service account name**: `github-actions-deploy`
   - **Description**: `Service account for GitHub Actions deployment`
6. Click **Create and Continue**
7. Grant the following roles:
   - **Firebase Admin**
   - **Cloud Build Editor** (for App Hosting)
   - **Storage Admin** (for App Hosting source uploads)
8. Click **Continue** and then **Done**

### 2. Generate Service Account Key

1. In the Service Accounts list, find your new service account
2. Click on the service account name
3. Go to the **Keys** tab
4. Click **Add Key** > **Create new key**
5. Select **JSON** format
6. Click **Create** - this will download a JSON file

### 3. Add GitHub Repository Secret

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Copy and paste the entire contents of the downloaded JSON file

### 4. Configure Repository Settings (Optional)

For additional security, you can restrict deployments:

1. Go to **Settings** > **Environments**
2. Create a new environment called `production`
3. Add protection rules:
   - **Required reviewers**: Add team members who should approve deployments
   - **Restrict pushes to protected branches**: Enable if desired

## How It Works

The GitHub Action workflow (`.github/workflows/deploy.yml`) will:

1. **On every push to master**:
   - Run type checking (`npm run typecheck`)
   - Build the project (`npm run build`)
   - Deploy to Firebase App Hosting

2. **On pull requests to master**:
   - Run type checking and build (but no deployment)

## Manual Deployment (Backup)

If you need to deploy manually, you can still use:

```bash
npm run typecheck
firebase deploy --only apphosting
```

## Monitoring Deployments

1. **GitHub**: Check the **Actions** tab to see deployment status
2. **Firebase Console**: Go to App Hosting to see deployed versions
3. **Logs**: Check the Firebase Console for runtime logs

## Troubleshooting

### Common Issues

1. **Service Account Permissions**: Ensure the service account has all required roles
2. **Project ID**: Verify the project ID matches in the workflow file
3. **Secret Format**: Make sure the entire JSON file content is copied to the GitHub secret

### Deployment Logs

Check the GitHub Actions logs for detailed error messages. The workflow includes:
- Dependencies installation
- Type checking
- Build process
- Firebase authentication
- Deployment execution

## Security Notes

- The service account key is stored securely in GitHub Secrets
- The key is only accessible during workflow execution
- Consider rotating the service account key periodically
- Monitor service account usage in Google Cloud Console