# Supabase Authentication Setup Guide

## ⚠️ "Email address is invalid" Error - CRITICAL FIX

If you're getting `Email address "xxx@xxx.com" is invalid` error:

### Most Common Cause: Email Domain Blocklist

**Supabase may block certain email domains or temporary email providers.**

### Solution 1: Check Supabase Email Provider Settings

1. Go to Supabase Dashboard
2. Navigate to: **Authentication → Providers → Email**
3. Scroll down to **"Email provider restrictions"** section
4. Check if there are any blocked domains
5. If you see domain restrictions, either:
   - Remove the restriction
   - Use an email from an allowed domain (Gmail, Outlook, etc.)

### Solution 2: Disable Email Domain Validation (Development Only)

1. Go to: **Authentication → Settings**
2. Look for **"Email domain validation"** or **"Email blocklist"**
3. Disable or remove restrictions
4. Save changes

### Solution 3: Use Major Email Provider

Try signing up with:
- ✅ Gmail (xxxxx@gmail.com)
- ✅ Outlook (xxxxx@outlook.com)  
- ✅ Yahoo (xxxxx@yahoo.com)
- ✅ ProtonMail (xxxxx@proton.me)

❌ Avoid:
- Temporary/disposable email services
- Less common domain extensions
- Domains that might be flagged as spam

### Solution 4: Check Supabase Email Verification Service

1. Go to **Authentication → Settings → Email Auth**
2. Ensure the email service is properly configured
3. Check if there are rate limits or restrictions

---

## Common 400 Bad Request Error - Troubleshooting

If you're getting a 400 error during signup, here are the most common causes and solutions:

### 1. Email Confirmation Settings

**Problem:** Supabase might require email confirmation by default.

**Solution:** Go to your Supabase Dashboard:
1. Navigate to: **Authentication → Providers → Email**
2. Look for **"Enable email confirmations"** setting
3. You have two options:
   - **Disable it** (for development): Turn off "Confirm email"
   - **Keep it enabled** (recommended for production): Users will need to confirm their email before logging in

### 2. Signup Rate Limiting

**Problem:** Supabase has rate limits on authentication endpoints.

**Solution:** 
- Wait a few minutes before trying again
- Clear your browser cache and cookies
- Try with a different email address

### 3. Password Policy

**Problem:** Your password doesn't meet Supabase requirements.

**Solution:** Ensure password is:
- At least 6 characters long
- Contains no leading or trailing whitespace

### 4. Email Already Exists

**Problem:** The email address is already registered.

**Solution:**
- Try logging in instead
- Use the "Forgot Password" feature
- Try a different email address

### 5. Supabase Project Configuration

**Problem:** Authentication is not properly configured in your Supabase project.

**Solution:**
1. Go to **Authentication → Settings** in Supabase Dashboard
2. Verify **Site URL** matches your local development URL: `http://localhost:3000`
3. Add to **Redirect URLs**:
   - `http://localhost:3000/login`
   - `http://localhost:3000/reset-password`
   - `http://localhost:3000`

### 6. Check Browser Console

Look for the detailed error message in the browser console. It will show something like:

```
{
  message: "User already registered",
  status: 400
}
```

## Recommended Supabase Settings for Development

### Authentication → Settings

```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/**
```

### Authentication → Providers → Email

```
☐ Confirm email (disable for development)
☐ Secure email change (optional)
☑ Enable sign ups
```

### Authentication → Email Templates

You can customize the confirmation and reset password email templates here.

## Testing the Fix

1. **Clear browser data**: 
   - Chrome: Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear cookies and cached data

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

3. **Try signing up with a new email**

4. **Check your email** (if confirmation is enabled)

## Database Setup

Make sure you've run the SQL scripts in Supabase SQL Editor:

1. Run `supabase/fix_profiles_table.sql` to create/fix the profiles table
2. Or run `supabase/setup_profiles_table.sql` for a fresh setup

## Still Having Issues?

Check these:

1. **Supabase Service Status**: https://status.supabase.com/
2. **Network Tab** in browser DevTools to see the actual error response
3. **Supabase Logs** in your dashboard under **Logs → Auth**
4. **Environment Variables**: Verify `.env.local` has correct Supabase keys

## Quick Fix for Development

The easiest way to get started quickly:

1. **Disable Email Confirmation** in Supabase Dashboard
2. **Add localhost to Redirect URLs**
3. **Clear browser cache**
4. **Restart dev server**
5. **Try again**

---

## Success! 🎉

Once configured correctly, you should see:
- Signup success modal with celebration animation
- Auto-redirect to login tab
- Ability to login immediately (if confirmation disabled)
- Or email confirmation prompt (if enabled)
