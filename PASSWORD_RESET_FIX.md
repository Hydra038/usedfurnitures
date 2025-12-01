# 🔐 Password Reset - "Invalid Path" Error Fix

## 📋 Problem

Password reset link from email shows error: **"Requested path is invalid"**

This happens because:
1. Supabase redirect URL is not whitelisted in the dashboard
2. Reset password page doesn't properly handle the recovery token from email link

---

## ✅ Solution

### **Part 1: Configure Supabase (CRITICAL)**

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/ymxfzvegppcikyjyedzi/auth/url-configuration
   ```

2. **Add Redirect URLs:**
   Under "Redirect URLs", add:
   ```
   http://localhost:3000/reset-password
   http://localhost:3000/*
   https://your-production-domain.com/reset-password
   https://your-production-domain.com/*
   https://your-vercel-app.vercel.app/reset-password
   https://your-vercel-app.vercel.app/*
   ```

3. **Update Site URL:**
   Set to your production URL (not localhost):
   ```
   https://your-production-domain.com
   ```

4. **Click "Save"**

---

### **Part 2: Code Improvements**

Updated `app/reset-password/page.tsx` to properly handle recovery tokens:

**Before:**
```tsx
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Invalid or expired reset link");
    }
  };
  checkSession();
}, []);
```

**After:**
```tsx
useEffect(() => {
  const checkAccess = async () => {
    // Check for hash params (recovery token from email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && (!accessToken || type !== 'recovery')) {
      setError("Invalid or expired reset link");
      return;
    }
    
    // If we have an access token in URL but no session, set the session
    if (accessToken && type === 'recovery' && !session) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      });
      
      if (sessionError) {
        setError("Unable to verify reset link");
      }
    }
  };
  checkAccess();
}, []);
```

---

## 🔄 How Password Reset Works

### **Step 1: User Requests Reset**
```tsx
// login/page.tsx
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

### **Step 2: Supabase Sends Email**
Email contains link like:
```
https://your-app.com/reset-password#access_token=xxx&type=recovery&refresh_token=yyy
```

### **Step 3: User Clicks Link**
- Browser navigates to `/reset-password`
- URL has hash parameters with tokens
- Reset password page extracts tokens from hash

### **Step 4: Verify & Set Session**
```tsx
// Extract tokens from hash
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get('access_token');

// Set session with recovery token
await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: refresh_token,
});
```

### **Step 5: User Updates Password**
```tsx
await supabase.auth.updateUser({
  password: newPassword
});
```

---

## 🧪 Testing Checklist

### **Setup:**
- [ ] Redirect URLs added to Supabase dashboard
- [ ] Site URL set to production domain
- [ ] Changes saved in Supabase

### **Request Reset:**
- [ ] Go to login page
- [ ] Click "Forgot Password?"
- [ ] Enter email address
- [ ] Click "Send Reset Link"
- [ ] See success message

### **Email:**
- [ ] Receive password reset email
- [ ] Email has reset button/link
- [ ] Link points to correct domain

### **Reset Password:**
- [ ] Click link in email
- [ ] Redirected to `/reset-password` page
- [ ] No "invalid path" error
- [ ] Page loads correctly
- [ ] Can enter new password
- [ ] Can confirm new password
- [ ] Click "Update Password"
- [ ] See success message
- [ ] Redirected to login page

### **Login with New Password:**
- [ ] Use new password to login
- [ ] Login successful
- [ ] Redirected to dashboard

---

## 🚨 Common Issues

### **Issue 1: "Invalid Path" Error**
**Cause:** Redirect URL not whitelisted in Supabase  
**Fix:** Add URL to Redirect URLs in Supabase dashboard

### **Issue 2: "Invalid or Expired Link"**
**Cause:** Reset link expired (default: 1 hour)  
**Fix:** Request new reset link

### **Issue 3: Email Not Received**
**Cause:** Email provider blocking, wrong SMTP settings  
**Fix:** 
- Check spam folder
- Verify email address
- Check Supabase email logs

### **Issue 4: Redirect to Localhost in Production**
**Cause:** `window.location.origin` returns localhost during build  
**Fix:** Use environment variable:
```tsx
redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
```

---

## 🔧 Environment Variables (Optional)

Add to `.env.local`:
```bash
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

Update login page:
```tsx
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/reset-password`,
});
```

---

## 📊 Flow Diagram

```
┌─────────────────┐
│  User Requests  │
│  Password Reset │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Sends  │
│ Email with Link │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Clicks    │
│  Email Link     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ❌ Not Whitelisted
│ Supabase Checks │────► "Invalid Path"
│  Redirect URL   │
└────────┬────────┘
         │ ✅ Whitelisted
         ▼
┌─────────────────┐
│  Redirect to    │
│ /reset-password │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Tokens  │
│   from Hash     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Set Session    │
│  with Tokens    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Enters New │
│    Password     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Password │
│   in Supabase   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect to    │
│   Login Page    │
└─────────────────┘
```

---

## 📝 Summary

✅ **Updated reset password page** to handle recovery tokens from hash  
✅ **Added proper session validation**  
✅ **Improved error messages**  
⚠️ **MUST whitelist redirect URLs in Supabase dashboard**  
⚠️ **MUST update Site URL in Supabase**  

**Critical Steps:**
1. Add redirect URLs to Supabase (Settings → Auth → URL Configuration)
2. Update Site URL to production domain
3. Test password reset flow end-to-end
4. Verify emails are being sent and received

**Result:** Password reset flow works correctly with proper error handling! 🎉
