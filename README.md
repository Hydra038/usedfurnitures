# 🏪 P2P Marketplace System - Full-Stack E-commerce Platform

A production-ready Next.js 14 peer-to-peer marketplace with admin dashboard, alternative payment methods, and Supabase backend.

## 🌟 Features

### Customer Features
- 🏠 **Browse Listings** - Shop items on the peer-to-peer marketplace with category filtering
- 🛒 **Shopping Cart** - Add/remove items, adjust quantities
- 💳 **Alternative Payments** - Venmo, Cash App, Zelle, Chime, PayPal, Apple Pay
- 📸 **Payment Proof** - Upload payment screenshots or enter transaction IDs
- 📦 **Order Tracking** - View order status and confirmation
- 📱 **Responsive Design** - Mobile-friendly interface
- 💬 **Contact Form** - Request custom items or ask questions

### Admin Features
- 🔐 **Secure Authentication** - Email/password login via Supabase
- 📊 **Dashboard** - View products, orders, revenue stats
- ➕ **Product Management** - Create, edit, delete marketplace listings
- 🖼️ **Image Upload** - Multiple images per product via Supabase Storage
- 📋 **Order Management** - Review orders, view payment proofs, confirm/reject
- 🔄 **Real-time Updates** - Instant database sync

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **State Management:** Zustand
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📁 Project Structure

```
p2p-marketplace-system/
├── app/
│   ├── layout.tsx                 # Root layout with navbar/footer
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   ├── shop/
│   │   ├── page.tsx              # Shop page with filters
│   │   └── [id]/page.tsx         # Product detail page
│   ├── cart/page.tsx             # Shopping cart
│   ├── checkout/page.tsx         # Checkout with payment
│   ├── confirmation/page.tsx     # Order confirmation
│   ├── contact/page.tsx          # Contact form
│   └── admin/
│       ├── layout.tsx            # Admin layout with auth
│       ├── login/page.tsx        # Admin login
│       ├── page.tsx              # Dashboard
│       ├── products/
│       │   ├── page.tsx          # Product list
│       │   └── new/page.tsx      # Create product
│       └── orders/page.tsx       # Order management
├── components/
│   ├── Navbar.tsx                # Main navigation
│   ├── Footer.tsx                # Site footer
│   ├── ProductCard.tsx           # Product display card
│   └── ProductGrid.tsx           # Products grid with loading
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── database.types.ts         # Database types
│   └── store/
│       └── cartStore.ts          # Cart state management
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone & Install

```bash
cd p2p-marketplace-system
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Execute in SQL editor

3. Create an admin user:
   - Go to **Authentication** → **Users**
   - Click "Add User" → "Create New User"
   - Enter email and password
   - Save credentials for admin login

### 3. Environment Variables

Create `.env.local` file in the root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Payment Info
NEXT_PUBLIC_VENMO_USERNAME=@YourVenmo
NEXT_PUBLIC_CASHAPP_TAG=$YourCashApp
NEXT_PUBLIC_CHIME_EMAIL=your@chime.com
NEXT_PUBLIC_ZELLE_EMAIL=your@zelle.com
NEXT_PUBLIC_PAYPAL_EMAIL=your@paypal.com

# Email (Optional - for future notifications)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=orders@p2pmarketplace.com
```

**Getting Supabase Credentials:**
- Go to your Supabase project → **Settings** → **API**
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Usage Guide

### For Customers

1. **Browse Products**
   - Visit `/shop` to see all marketplace listings
   - Filter by category
   - Click product for details

2. **Make Purchase**
   - Add items to cart
   - Go to `/cart` to review
   - Proceed to checkout
   - Fill shipping info
   - Select payment method
   - Upload payment screenshot or enter transaction ID
   - Submit order

3. **Order Confirmation**
   - Receive order ID and confirmation
   - Email sent to provided address
   - Admin reviews payment proof

### For Admin

1. **Login**
   - Visit `/admin/login`
   - Use credentials created in Supabase Auth

2. **Manage Products**
   - Navigate to "Products"
   - Click "Add Product" for new listing
   - Upload images, set price, condition, dimensions
   - Edit or delete existing products

3. **Manage Orders**
   - Navigate to "Orders"
   - View all customer orders
   - Click eye icon to view details
   - See payment proof screenshot
   - Confirm or reject payment

## 💾 Database Schema

### Products Table
```sql
- id: UUID (primary key)
- title: TEXT
- description: TEXT
- price: DECIMAL
- condition: 'A+' | 'A' | 'B'
- dimensions: TEXT
- category: TEXT
- stock: INTEGER
- shipping_cost: DECIMAL
- pickup_location: TEXT (optional)
- images: TEXT[] (array of URLs)
- created_at: TIMESTAMP
```

### Orders Table
```sql
- id: UUID (primary key)
- customer_name: TEXT
- customer_email: TEXT
- customer_phone: TEXT
- total_price: DECIMAL
- shipping_address: JSONB
- payment_method: TEXT
- payment_status: 'pending' | 'confirmed' | 'rejected'
- payment_proof_url: TEXT (image URL)
- transaction_reference: TEXT
- notes: TEXT
- created_at: TIMESTAMP
```

### Order Items Table
```sql
- id: UUID (primary key)
- order_id: UUID (foreign key)
- product_id: UUID (foreign key)
- quantity: INTEGER
- price_at_purchase: DECIMAL
- product_title: TEXT
```

## 🎨 Customization

### Update Branding
- Edit `app/layout.tsx` - Change site title and description
- Edit `components/Navbar.tsx` - Update logo text
- Edit `tailwind.config.ts` - Modify color scheme

### Add Payment Methods
- Update `app/checkout/page.tsx` - Add to `PAYMENT_METHODS` array
- Add environment variables for new payment info

### Email Notifications
Integrate Resend or another email service:
```typescript
// Example with Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL,
  to: order.customer_email,
  subject: 'Order Confirmation',
  html: `<p>Your order #${order.id} has been received!</p>`
});
```

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   
3. Configure Environment Variables:
   - Add all variables from `.env.local`
   - Click "Deploy"

4. Custom Domain (Optional):
   - Go to project settings
   - Add custom domain
   - Update DNS records

### Post-Deployment
- Test all features in production
- Create admin user in Supabase if not done
- Upload sample products
- Test checkout flow

## 📚 Key Features Explained

### Alternative Payment Flow
Instead of Stripe:
1. Customer selects payment method (Venmo, Cash App, etc.)
2. Customer makes payment outside the app
3. Customer uploads screenshot or enters transaction ID
4. Order created with "pending" status
5. Admin reviews payment proof
6. Admin confirms/rejects order

### Image Handling
- Products: Stored in `product-images` bucket (public)
- Payment Proofs: Stored in `payment-proofs` bucket (private, admin-only)

### Security
- Row-Level Security (RLS) enabled on all tables
- Public can view products, create orders
- Only authenticated users (admin) can manage products/orders
- Admin routes protected by Supabase Auth

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Troubleshooting

### Images not showing
- Check Supabase Storage buckets exist
- Verify bucket policies allow public access for `product-images`
- Check image URLs in database

### Admin login fails
- Verify user created in Supabase Auth
- Check email/password correct
- Ensure RLS policies allow authenticated access

### Orders not saving
- Check Supabase connection
- Verify environment variables set
- Check browser console for errors

## 📧 Support

For questions or issues:
- Open GitHub issue
- Contact: support@p2pmarketplace.com

---

Built with ❤️ using Next.js 14 and Supabase
