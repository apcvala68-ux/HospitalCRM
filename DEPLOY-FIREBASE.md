# Deploy to Firebase Hosting

## Prerequisites
1. Google account
2. Firebase CLI installed (already done: `npm install -g firebase-tools`)

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Enter project name: `royale-hospital-crm` (or your choice)
4. Disable Google Analytics (not needed)
5. Click **Create project**

## Step 2: Login to Firebase
```bash
firebase login
```

## Step 3: Update Project ID
Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID:
```json
{
  "projects": {
    "default": "royale-hospital-crm"
  }
}
```

You can find your project ID in Firebase Console → Project Settings → General → Project ID.

## Step 4: Configure Backend URL
Edit `client/.env.production` and set your backend server URL:
```
VITE_API_URL=https://your-backend-server.com/api
```

If your backend is on the same domain (e.g., Express serves both API and static files), leave it as `/api`.

## Step 5: Build & Deploy
```bash
npm run deploy
```

This will:
1. Build the React app (`npm run build:client`)
2. Deploy `client/dist` to Firebase Hosting

## Step 6: Verify
After deployment, Firebase will show your hosting URL:
```
Hosting URL: https://royale-hospital-crm.web.app
```

## CI/CD (GitHub Actions)
For automated deploys on push:

1. Generate a Firebase token:
```bash
firebase login:ci
```

2. Add the token as a GitHub secret: `FIREBASE_TOKEN`

3. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm install --prefix client
      - run: npm run deploy:ci
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Important Notes
- Firebase Hosting serves **static files only** — your Express backend must be deployed separately (Railway, Render, AWS, etc.)
- CORS must be configured on your backend to allow requests from `https://your-project.web.app`
- For production, set `VITE_API_URL` to your backend's public URL
- Firebase free tier includes 10GB storage, 360MB/day transfer — sufficient for most hospital CRMs
