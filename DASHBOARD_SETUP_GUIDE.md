# Quick Setup Guide for Admin & User Dashboards

## Prerequisites
- Supabase project set up
- Environment variables configured
- Next.js app running

## Setup Steps

### 1. Database Setup
Run the following SQL script in your Supabase SQL Editor:

```bash
# Location: supabase/setup_profiles_table.sql
```

This will:
- Create the `profiles` table
- Set up Row Level Security (RLS) policies
- Create automatic profile creation trigger

### 2. Test User Authentication
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Register a test user or use existing credentials

### 3. Access User Dashboard
Once logged in:
- Click "Dashboard" in the navbar
- Or navigate directly to `/user`
- Explore:
  - `/user/orders` - View your orders
  - `/user/profile` - Edit your profile

### 4. Access Admin Dashboard
For admin access:
1. Navigate to `/admin`
2. Explore:
   - `/admin/products` - Manage products
   - `/admin/orders` - View and approve orders
   - `/admin/users` - View registered users
   - `/admin/payments` - Manage payment methods

**Note**: Admin routes are currently NOT protected. See security recommendations below.

## Features Available

### For Users:
✅ Login/Logout functionality
✅ View order history with status tracking
✅ Edit profile and address information
✅ Dashboard link in navbar (when logged in)

### For Admins:
✅ Product CRUD operations
✅ Order management with approval workflow
✅ User list view
✅ Payment method management
✅ Dashboard with statistics

## Security Recommendations

### Protect Admin Routes
Add this middleware to protect admin routes:

**File**: `middleware.ts` (create in root directory)
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    // Check if user is admin (you need to add is_admin field to profiles)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
}
```

### Add Admin Field to Profiles
Run this SQL in Supabase:
```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Make a user admin
UPDATE profiles SET is_admin = TRUE WHERE email = 'admin@example.com';
```

## Testing Checklist

- [ ] User can register and login
- [ ] Login/Logout buttons show correctly in navbar
- [ ] User can view their orders
- [ ] User can edit their profile
- [ ] Admin can view all products
- [ ] Admin can add/edit/delete products
- [ ] Admin can view and approve orders
- [ ] Admin can view user list
- [ ] Admin can enable/disable payment methods

## Troubleshooting

### Issue: "Cannot read properties of null"
- **Cause**: User not logged in
- **Solution**: Ensure user authentication is working, check Supabase connection

### Issue: Orders not showing in user dashboard
- **Cause**: Orders table doesn't have customer_email field
- **Solution**: Ensure orders are created with customer_email matching the logged-in user's email

### Issue: Profile won't save
- **Cause**: Profiles table doesn't exist or RLS policies not set
- **Solution**: Run the `setup_profiles_table.sql` script

### Issue: Admin pages accessible to everyone
- **Cause**: No middleware protection
- **Solution**: Implement the middleware code shown above

## Next Steps

1. **Add Email Verification**: Enable in Supabase Auth settings
2. **Add Password Reset**: Implement forgot password flow
3. **Add Admin Role Management**: Create UI for assigning admin roles
4. **Add Order Status Tracking**: Implement shipping status updates
5. **Add Email Notifications**: Send emails for order updates

## Support

For issues or questions, refer to:
- Main documentation: `DASHBOARDS_DOCUMENTATION.md`
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs

---

Last Updated: November 29, 2025
