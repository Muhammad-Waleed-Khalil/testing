# Deploying to Vercel

This guide provides instructions for deploying the MOCPULSE application to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Clerk](https://clerk.dev) account with your application set up
- Your Firebase project configured

## Deployment Steps

### 1. Set up Environment Variables in Vercel

When deploying to Vercel, you need to add the following environment variables in your Vercel project settings:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 2. Configure Clerk for Vercel Deployment

1. Log in to your [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your application
3. Go to **Settings** > **Domains**
4. Add your Vercel deployment URL (e.g., `your-app.vercel.app`) to the allowed domains
5. Also add any custom domains you plan to use

### 3. Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account
3. Click **Add New** > **Project**
4. Import your Git repository
5. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add your environment variables (from step 1)
7. Click **Deploy**

### 4. Troubleshooting Common Issues

#### Clerk Authentication Issues

If you encounter authentication issues with Clerk:

1. Verify that your `VITE_CLERK_PUBLISHABLE_KEY` is correct
2. Ensure your Vercel deployment URL is added to Clerk's allowed domains
3. Check that the Clerk provider is properly wrapped with the ErrorBoundary component

#### Face-API.js and MediaPipe Issues

If face detection or pose estimation isn't working:

1. Check browser console for errors
2. Verify that the models are loading correctly from the `/models` directory
3. Ensure the user has granted camera permissions

#### General Deployment Issues

1. Check Vercel build logs for any errors
2. Verify all environment variables are set correctly
3. Make sure the `vercel.json` file is in the root directory

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)