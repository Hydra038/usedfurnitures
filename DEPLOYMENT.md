# 🚀 Deployment Checklist

## Pre-Deployment

### ✅ Local Testing
- [ ] All pages load without errors
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Checkout flow completes
- [ ] Admin login works
- [ ] Product CRUD operations work
- [ ] Order management works
- [ ] Images upload successfully

### ✅ Environment Variables
- [ ] All required vars in `.env.local`
- [ ] Payment info updated with real details
- [ ] Supabase URL and keys are correct

### ✅ Database
- [ ] SQL migration executed successfully
- [ ] Admin user created
- [ ] Test products added
- [ ] RLS policies active

## Deployment to Vercel

### Step 1: Prepare Repository
```bash
# Initialize git if not done
git init

# Add all files
git add .

# Commit
git commit -m "Initial furniture store deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/furniture-store.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **./** (default)
   - Build Command: **npm run build** (default)
   - Output Directory: **.next** (default)

### Step 3: Environment Variables
Add these in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_VENMO_USERNAME=@YourVenmo
NEXT_PUBLIC_CASHAPP_TAG=$YourCashApp
NEXT_PUBLIC_CHIME_EMAIL=your@chime.com
NEXT_PUBLIC_ZELLE_EMAIL=your@zelle.com
NEXT_PUBLIC_PAYPAL_EMAIL=your@paypal.com
```

Optional (for email notifications):
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=orders@furniturestore.com
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Visit your deployment URL

## Post-Deployment

### ✅ Production Testing
- [ ] Visit homepage loads
- [ ] Shop page displays products
- [ ] Product detail pages work
- [ ] Cart functions properly
- [ ] Checkout flow completes
- [ ] Order confirmation shows
- [ ] Admin login works
- [ ] Can create/edit products
- [ ] Can manage orders

### ✅ Performance
- [ ] Images load quickly
- [ ] Pages are responsive
- [ ] Mobile layout works
- [ ] No console errors

### ✅ Security
- [ ] Admin routes require login
- [ ] Payment proofs are private
- [ ] RLS policies enforced
- [ ] No sensitive data exposed

## Custom Domain (Optional)

### Add Custom Domain
1. In Vercel project → Settings → Domains
2. Add your domain: `yourstore.com`
3. Update DNS records:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate auto-generated

## Monitoring

### Setup Vercel Analytics (Free)
1. Vercel dashboard → Analytics tab
2. Enable Analytics
3. Track:
   - Page views
   - Unique visitors
   - Performance metrics

### Supabase Monitoring
1. Supabase dashboard → Reports
2. Monitor:
   - Database size
   - API requests
   - Storage usage

## Backup Strategy

### Database Backups
Supabase automatically backs up daily. To manual backup:
1. Go to Supabase → Database → Backups
2. Click "Download backup"

### Code Backups
- GitHub repository (already backed up)
- Keep local copy synced

## Updates & Maintenance

### Updating Content
- Login to `/admin`
- Add/edit products as needed
- Review orders regularly

### Code Updates
```bash
# Make changes locally
git add .
git commit -m "Update: description"
git push

# Vercel auto-deploys on push
```

### Dependencies
```bash
# Check for updates quarterly
npm outdated

# Update
npm update

# Test locally, then deploy
```

## Scaling Considerations

### When to upgrade Supabase:
- **Free tier limits:**
  - 500MB database
  - 1GB storage
  - 50,000 monthly active users

### When traffic grows:
- Enable Vercel Pro for better performance
- Upgrade Supabase to Pro ($25/month)
- Consider CDN for images

## Support Contacts

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **Next.js Docs:** https://nextjs.org/docs

## Emergency Rollback

If deployment breaks:
1. Vercel dashboard → Deployments
2. Find last working deployment
3. Click "⋯" → "Promote to Production"

## Success Metrics

Track these KPIs:
- [ ] Orders per week
- [ ] Average order value
- [ ] Conversion rate (visitors → buyers)
- [ ] Page load times
- [ ] Admin response time to orders

---

## 🎉 Launch Checklist

Final checks before going live:

- [ ] Test complete purchase flow
- [ ] Verify all payment methods shown
- [ ] Check mobile responsiveness
- [ ] Test on multiple browsers
- [ ] Verify admin can manage orders
- [ ] Check email notifications work (if enabled)
- [ ] Update contact info throughout site
- [ ] Add real products with quality images
- [ ] Set accurate shipping costs
- [ ] Write clear return/refund policy
- [ ] Add terms of service page
- [ ] Privacy policy page
- [ ] FAQ section

**You're ready to launch! 🚀**
