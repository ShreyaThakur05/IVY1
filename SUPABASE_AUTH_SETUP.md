# Supabase Authentication Setup

## 1. Enable Authentication Providers

Go to your Supabase Dashboard:
https://supabase.com/dashboard/project/jrryysindrlnfcmpwutx/auth/providers

### Enable Email Authentication:
1. Click on "Email" provider
2. Enable "Enable email confirmations" (optional)
3. Save

### Enable OAuth Providers (Optional):
1. Click on "Google" provider
2. Enable it and add your Google OAuth credentials
3. Click on "GitHub" provider  
4. Enable it and add your GitHub OAuth credentials

## 2. Configure Site URL

Go to: https://supabase.com/dashboard/project/jrryysindrlnfcmpwutx/auth/url-configuration

Set:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

## 3. Test Authentication

1. Restart your Next.js app: `npm run dev`
2. Try signing up with a new email
3. Try signing in with existing credentials

## 4. Check RLS Policies

Make sure you ran the SQL script to create proper RLS policies for the profiles, sessions, and messages tables.

## Common Issues:

### "Failed to fetch" error:
- Check if Supabase URL and keys are correct in .env.local
- Verify internet connection
- Check if Supabase project is active

### "Invalid login credentials":
- Make sure user exists (sign up first)
- Check email/password are correct
- Verify email if confirmation is enabled

### Auto-logout issues:
- Check session persistence in browser
- Verify RLS policies are not blocking user access