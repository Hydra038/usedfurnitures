# 🚀 Quick Start Guide

## Step 1: Install Dependencies ✅
Already done! All packages installed.

## Step 2: Setup Supabase (5 minutes)

### 2.1 Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Enter project name: `furniture-store`
4. Set a database password (save it!)
5. Select region closest to you
6. Click "Create new project" (wait ~2 minutes)

### 2.2 Run Database Migration
1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open `supabase/migrations/001_initial_schema.sql` from this project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **RUN** button
7. You should see "Success. No rows returned"

### 2.3 Create Admin User
1. Go to **Authentication** → **Users** (left sidebar)
2. Click "Add User" → "Create new user"
3. Enter email: `admin@example.com` (or your email)
4. Enter password: (choose a strong password)
5. Click "Create User"
6. **Save these credentials!** You'll need them to login.

### 2.4 Get API Keys
1. Go to **Settings** → **API** (left sidebar)
2. Copy **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy **anon public** key (long string)
4. Keep this tab open for next step

## Step 3: Configure Environment Variables

1. In your project root, create `.env.local`:
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and update:

```env
# Paste from Supabase Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Update with YOUR payment info
NEXT_PUBLIC_VENMO_USERNAME=@YourVenmoHandle
NEXT_PUBLIC_CASHAPP_TAG=$YourCashAppTag
NEXT_PUBLIC_CHIME_EMAIL=your@chime.com
NEXT_PUBLIC_ZELLE_EMAIL=your@zelle.com
NEXT_PUBLIC_PAYPAL_EMAIL=your@paypal.com
```

## Step 4: Run the App!

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 5: Test Everything

### Test Customer Flow:
1. Visit http://localhost:3000
2. Go to "Shop" (empty at first - that's normal!)
3. Test cart and checkout (once products exist)

### Test Admin Flow:
1. Visit http://localhost:3000/admin/login
2. Login with the admin credentials you created in Step 2.3
3. You should see the admin dashboard!

### Add Your First Product:
1. In admin dashboard, click "Products" → "Add Product"
2. Fill in details:
   - Title: "Modern Gray Sofa"
   - Description: "Beautiful 3-seater sofa in excellent condition"
   - Price: 450
   - Condition: A+
   - Dimensions: 84"W x 36"D x 32"H
   - Category: Sofas
   - Stock: 1
   - Shipping: 50
3. Upload an image (or skip for now)
4. Click "Create Product"
5. Go back to homepage - you should see your product!

## 🎉 You're Done!

Your furniture store is now running!

## Common Issues

### "Cannot connect to Supabase"
- ✅ Check `.env.local` has correct URL and key
- ✅ Restart dev server: `Ctrl+C` then `npm run dev`

### "Admin login fails"
- ✅ Verify you created user in Supabase Auth
- ✅ Check email/password are correct

### "Images not uploading"
- ✅ Make sure SQL migration ran successfully
- ✅ Check Supabase Storage has `product-images` bucket

## Next Steps

1. **Add more products** - Build your inventory
2. **Customize branding** - Edit colors, logo, text
3. **Test checkout** - Make a test order
4. **Deploy to Vercel** - See README.md for deployment guide

## Need Help?

- Check the full README.md for detailed docs
- Review Supabase dashboard for errors
- Check browser console (F12) for error messages

---

🪑 Happy selling!
