<p align="center">
  <img src="https://www.groqtales.xyz/groq_tales_logo.png" alt="GroqTales Logo" width="150" />
</p>

# Setting Up WalletConnect for GroqTales

This document provides guidance on how to properly set up WalletConnect for your GroqTales
application.

## Getting a WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign in or create a new account
3. Create a new project named "GroqTales"
4. Copy your Project ID

## Adding the Project ID to Your Environment

Create a `.env.local` file in the root of your project and add your Project ID:

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

Replace `YOUR_PROJECT_ID_HERE` with the Project ID you copied from WalletConnect Cloud.

## Important Notes

- The 'DEMO_PROJECT_ID' provided in the code is a placeholder and will not work for production.
- In development, you may see a warning about the projectId being undefined or invalid.
- For production deployment, make sure to set the environment variable properly in your hosting
  platform.

## Environment Variables in Next.js

If you're using Cloudflare Pages to deploy your application:

1. Go to your Cloudflare Pages project dashboard
2. Navigate to **Settings → Environment variables**
3. Add `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` as the key and your Project ID as the value
4. Redeploy your application

For other hosting providers, refer to their documentation on how to set environment variables.
