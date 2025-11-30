# Admin Security Setup - Complete ✅

## Overview
Admin routes are now **secured** and only accessible by the admin user `usa@firewood.com`.

---

## What Was Configured

### 1. Middleware Protection (`middleware.ts`)
Created middleware that:
- ✅ Checks if user is logged in before accessing `/admin/*` routes
- ✅ Verifies user email is `usa@firewood.com`
- ✅ Redirects unauthorized users to home page
- ✅ Redirects non-logged-in users to login page
- ✅ Also protects `/user/*` routes (requires login)

### 2. Navbar Admin Link
Updated navbar to:
- ✅ Show "Admin" link only when logged in as `usa@firewood.com`
- ✅ Display in both desktop and mobile views
- ✅ Bold styling to highlight admin access

---

## How It Works

### For Admin User (`usa@firewood.com`)
1. Log in with admin credentials
2. "Admin" link appears in navbar
3. Can access all admin routes:
   - `/admin` - Dashboard
   - `/admin/products` - Product management
   - `/admin/orders` - Order management
   - `/admin/users` - User management
   - `/admin/payments` - Payment methods

### For Regular Users
1. Log in with regular credentials
2. Only see "Dashboard" link (not "Admin")
3. Attempting to access `/admin/*` redirects to home page
4. Can access user dashboard at `/user/*`

### For Non-Logged-In Users
1. No dashboard links visible
2. Attempting to access `/admin/*` or `/user/*` redirects to login page

---

## Testing the Security

### Test 1: Admin Access
```
1. Log in as usa@firewood.com
2. Click "Admin" link in navbar
3. ✅ Should access admin dashboard
4. Navigate to /admin/products
5. ✅ Should see product management
```

### Test 2: Regular User
```
1. Log in with a different email
2. ❌ "Admin" link should NOT appear
3. Navigate directly to /admin
4. ✅ Should redirect to home page
```

### Test 3: Not Logged In
```
1. Log out if logged in
2. Navigate directly to /admin
3. ✅ Should redirect to /login
```

---

## Admin Credentials

**Admin Email**: `usa@firewood.com`
**Password**: [Set in Supabase Auth]

To change admin email, update in two places:
1. `middleware.ts` - Line with `userEmail !== 'usa@firewood.com'`
2. `components/Navbar.tsx` - Line with `user.email === 'usa@firewood.com'`

---

## Adding More Admins (Future Enhancement)

### Option 1: Add to Middleware (Simple)
Update `middleware.ts`:
```typescript
const adminEmails = ['usa@firewood.com', 'admin2@example.com', 'admin3@example.com'];
if (!adminEmails.includes(userEmail)) {
  return NextResponse.redirect(new URL('/', req.url));
}
```

### Option 2: Use Database Field (Recommended)
1. Add `is_admin` field to profiles table:
```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
UPDATE profiles SET is_admin = TRUE WHERE email = 'usa@firewood.com';
```

2. Update middleware to check database:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', session.user.id)
  .single();

if (!profile?.is_admin) {
  return NextResponse.redirect(new URL('/', req.url));
}
```

3. Update Navbar:
```typescript
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  if (user) {
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setIsAdmin(data?.is_admin || false));
  }
}, [user]);

// In JSX:
{user && isAdmin && (
  <Link href="/admin">Admin</Link>
)}
```

---

## Security Best Practices

✅ **Implemented:**
- Middleware route protection
- Server-side authentication check
- Email-based admin verification
- Automatic redirects for unauthorized access

🔒 **Additional Recommendations:**
1. Enable email verification in Supabase
2. Implement 2FA for admin account
3. Use environment variables for admin emails
4. Add admin activity logging
5. Implement session timeout for sensitive routes

---

## Troubleshooting

### Issue: Admin link not showing
- **Check**: Logged in with correct email (`usa@firewood.com`)
- **Check**: Clear browser cache and refresh
- **Check**: Session is active (try logout/login)

### Issue: Redirecting even when logged in as admin
- **Check**: Email matches exactly (case-sensitive)
- **Check**: Middleware is running (restart dev server)
- **Check**: No typos in email comparison

### Issue: Can still access admin routes directly
- **Check**: `middleware.ts` file exists in root directory
- **Check**: Middleware matcher config is correct
- **Check**: Restart development server

---

## Files Modified

1. ✅ `middleware.ts` (created) - Route protection
2. ✅ `components/Navbar.tsx` - Admin link visibility
3. ✅ `ADMIN_SECURITY_SETUP.md` (this file) - Documentation

---

## Summary

🎉 **Admin routes are now secure!**

- Only `usa@firewood.com` can access admin dashboard
- Middleware prevents unauthorized access
- Visual indicators show admin status in navbar
- All security measures are in place

---

Last Updated: November 29, 2025
Admin User: usa@firewood.com
