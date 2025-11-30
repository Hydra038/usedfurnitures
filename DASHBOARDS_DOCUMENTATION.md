# Admin & User Dashboards Documentation

## Overview
This document describes the admin and user dashboard features implemented in the FurnitureStore application.

---

## User Authentication

### Login System
- **Location**: `/login`
- **Features**:
  - Email/password authentication via Supabase Auth
  - Login/Logout buttons dynamically shown in navbar based on auth state
  - Session persistence across page reloads
  - Automatic redirect after login

### Navbar Integration
- Shows "Login" button when user is not logged in
- Shows "Logout" button when user is logged in
- Works on both desktop and mobile views

---

## Admin Dashboard

### Main Dashboard (`/admin`)
- **Overview Statistics**:
  - Total products count
  - Total orders count
  - Pending orders count
  - Total revenue
- **Quick Navigation**: Links to Products, Orders, Users, and Payment Methods

### Product Management (`/admin/products`)
- **View Products**: Table view with image, title, price, condition, and stock
- **Add Product**: Link to create new product
- **Edit Product**: Edit existing product details
- **Delete Product**: Remove product with confirmation
- **Features**:
  - Connected to Supabase `products` table
  - Real-time updates after CRUD operations
  - Image preview in product list

### Order Management (`/admin/orders`)
- **View Orders**: Table with date, customer info, total, payment method, and status
- **Order Details**: Modal view with full order information
- **Payment Approval**: Confirm or reject pending payments
- **Payment Proof**: View uploaded payment proof images
- **Status Badges**: Color-coded status indicators (pending/confirmed/rejected)

### User Management (`/admin/users`)
- **View Users**: List of registered users with email and registration date
- **User Details**: Last login information
- **Features**:
  - Fetches users from Supabase Auth
  - Fallback to profiles table if available
  - View user activity

### Payment Methods (`/admin/payments`)
- **Manage Payment Methods**: Enable/disable payment options
- **Current Methods**:
  - Bank Transfer
  - Cash on Pickup
  - Mobile Money
- **Add New Method**: Button to add additional payment options

---

## User Dashboard

### Main Dashboard (`/user`)
- **Quick Navigation**: Links to My Orders and Edit Profile
- **User-friendly overview** of account features

### My Orders (`/user/orders`)
- **View Order History**: All orders placed by logged-in user
- **Order Details**:
  - Order ID
  - Order date
  - Total amount
  - Payment method
  - Payment status with color-coded badges
  - Payment proof (if uploaded)
- **Empty State**: Message when no orders exist
- **Authentication Check**: Prompts login if not authenticated

### Edit Profile (`/user/profile`)
- **Profile Information**:
  - Email (read-only)
  - Full Name
  - Phone Number
  - Address
  - City
  - State
  - ZIP Code
- **Features**:
  - Auto-save to Supabase `profiles` table
  - Form validation
  - Loading states
  - Authentication check

---

## Database Requirements

### Tables Used
1. **products** - Product catalog
2. **orders** - Customer orders
3. **profiles** - User profile information (optional, needs to be created)

### Profiles Table Schema (if not exists)
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## Security Considerations

### Admin Routes
- Currently, admin routes (`/admin/*`) are **not protected**
- **Recommended**: Add middleware to check admin role before allowing access
- **Implementation**:
  1. Add `is_admin` field to profiles table
  2. Create middleware in `middleware.ts`
  3. Check user role before rendering admin pages

### User Routes
- User dashboard routes check authentication
- Display appropriate message if not logged in
- Users can only view their own data (filtered by email)

---

## Next Steps

### Recommended Enhancements
1. **Admin Authentication**:
   - Add admin role checking
   - Protect admin routes with middleware
   - Create admin user management in Supabase

2. **Order Tracking**:
   - Add order status (processing, shipped, delivered)
   - Email notifications for status changes
   - Tracking number integration

3. **Payment Methods**:
   - Connect to actual payment provider database
   - Add payment method configuration form
   - Store payment details securely

4. **User Profile**:
   - Email verification
   - Password reset functionality
   - Profile picture upload

5. **Analytics**:
   - Sales reports
   - Popular products
   - Customer analytics
   - Revenue trends

---

## Usage Instructions

### For Admin:
1. Log in with admin credentials
2. Navigate to `/admin` to see dashboard
3. Manage products, orders, users, and payment methods from respective sections
4. Approve/reject orders from the Orders page

### For Users:
1. Register or log in via `/login`
2. Navigate to `/user` to access dashboard
3. View order history at `/user/orders`
4. Update profile information at `/user/profile`

---

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React useState/useEffect

---

Last Updated: November 29, 2025
