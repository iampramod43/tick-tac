# Clerk Authentication Setup Guide

This app uses Clerk for authentication. Follow these steps to set it up:

## 1. Create a Clerk Account

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up for a free account (or sign in if you already have one)
3. Create a new application

## 2. Get Your API Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## 3. Configure Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add your Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

## 4. Configure Clerk Application Settings

In your Clerk Dashboard:

1. Go to **Paths** in the sidebar
2. Set the following paths:
   - **Sign-in path**: `/auth/login`
   - **Sign-up path**: `/auth/register`
   - **After sign-in URL**: `/`
   - **After sign-up URL**: `/`

## 5. Optional: Configure Social Providers

In your Clerk Dashboard, you can enable social authentication providers:

1. Go to **User & Authentication** → **Social Connections**
2. Enable providers like Google, GitHub, etc.

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/auth/login` if not authenticated
4. Try signing up with a new account
5. After signing in, you should be redirected to the home page

## Features Included

✅ **Protected Routes**: All routes except `/auth/login` and `/auth/register` require authentication
✅ **User Profile**: UserButton component in Header and Sidebar for profile management
✅ **Automatic Redirects**: Users are redirected to login if not authenticated
✅ **Session Management**: Clerk handles all session management automatically

## Troubleshooting

- **"Missing publishableKey" error**: Make sure your `.env.local` file has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Redirect loops**: Check that your Clerk Dashboard paths match the routes in your app
- **CORS errors**: Ensure your Clerk application URL matches your development URL

For more information, visit the [Clerk Documentation](https://clerk.com/docs).

