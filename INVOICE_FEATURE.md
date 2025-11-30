# Invoice Generation Feature

## Overview
The invoice generation feature allows customers to download a professional PDF invoice for their orders. The invoice is **only available after the admin confirms the order**, ensuring accuracy and official documentation.

---

## ✨ Features

### 1. **Conditional Access**
- ✅ Invoice download is **enabled** only when order status = `"confirmed"`
- ❌ Button is **disabled** (grayed out) for all other statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `rejected`
- 💡 Hover tooltip explains: *"Invoice available after order confirmation"*

### 2. **Comprehensive Invoice Content**

#### Header Section
- 🏢 **Company Name**: USA FURNITURES (styled in primary color)
- 📄 **Document Title**: INVOICE (centered)
- 📅 **Invoice Details**:
  - Invoice # (first 8 characters of order ID)
  - Invoice Date
  - Order Status

#### Customer Information
- 👤 Customer Name
- 📧 Email Address
- 📞 Phone Number (if provided)
- 🏠 Shipping Address (if provided)

#### Payment Details
- 💳 **Payment Plan**: Full / Half / Custom (Other)
- 💵 **Total Amount**: Full order total
- ✅ **Amount Paid**: What customer has paid (green color)
- ⚠️ **Remaining Balance**: What customer still owes (red color, if any)
- 💰 **Payment Method**: Venmo, Cash App, Zelle, etc.

#### Additional Information
- 📝 **Notes**: Any special instructions or comments
- ✔️ **Confirmation Stamp**: "CONFIRMED" watermark (45° angle, green transparent)

#### Footer
- 💌 Thank you message
- 📞 Support contact: support@usafurnitures.com

---

## 🎨 Visual Design

### Color Scheme
- **Primary (Header)**: RGB(79, 70, 229) - Indigo
- **Success (Amount Paid)**: RGB(34, 197, 94) - Green
- **Warning (Balance Due)**: RGB(239, 68, 68) - Red
- **Muted Text**: RGB(100, 100, 100) - Gray
- **Watermark**: Green with 20% opacity

### Layout
- **Page Size**: A4 (standard)
- **Margins**: 20px all sides
- **Font**: Helvetica (normal & bold variants)
- **Line Separators**: Light gray dividers between sections

---

## 🔧 Technical Implementation

### Component: `Invoice.tsx`

**Location**: `components/Invoice.tsx`

**Dependencies**:
```bash
npm install jspdf
```

**Props**:
```typescript
interface InvoiceProps {
  order: {
    id: string;
    created_at: string;
    total?: number;
    total_price?: number;
    payment_method: string;
    payment_option?: string; // 'full' | 'half' | 'other'
    amount_paid?: number;
    remaining_balance?: number;
    status?: string;
    payment_status?: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address?: any;
    notes?: string;
    items?: any;
  };
}
```

**Key Logic**:
```typescript
const isConfirmed = (order.status || order.payment_status || 'pending').toLowerCase() === 'confirmed';

// Button is enabled only when isConfirmed = true
<button disabled={!isConfirmed}>
  Download Invoice
</button>
```

---

## 📍 Integration Points

### 1. User Orders Page (`app/user/orders/page.tsx`)

**Display Locations**:

#### A. Order Card View
```tsx
{orders.map((order) => (
  <div className="order-card">
    {/* ... order details ... */}
    <button>View Details</button>
    
    {/* ✅ Invoice button appears here */}
    <Invoice order={order} />
  </div>
))}
```

#### B. Order Details Modal
```tsx
<Modal>
  {/* ... order details ... */}
  
  <div className="button-group">
    {/* ✅ Invoice button also in modal */}
    <Invoice order={selectedOrder} />
    <button>Close</button>
  </div>
</Modal>
```

---

## 🎯 User Experience Flow

### Scenario 1: Order Not Yet Confirmed
1. User navigates to "My Orders"
2. Sees their order with status: `PENDING` (yellow badge)
3. "Download Invoice" button is **grayed out** and disabled
4. Hover shows: *"Invoice available after order confirmation"*
5. User cannot download invoice yet ❌

### Scenario 2: Order Confirmed by Admin
1. Admin changes order status to `CONFIRMED` (green badge)
2. User refreshes "My Orders" page
3. "Download Invoice" button is now **green and enabled** ✅
4. User clicks button
5. PDF invoice automatically downloads: `invoice-ABC12345.pdf`
6. Invoice includes "CONFIRMED" watermark

### Scenario 3: Partial Payment Orders
1. Customer selected "Half Payment" option
2. Order shows:
   - Total: $500.00
   - Amount Paid: $250.00 (green)
   - Remaining Balance: $250.00 (red, with warning)
3. After admin confirms, invoice shows all payment details
4. Customer can download invoice showing partial payment status

---

## 🔐 Security & Validation

### Access Control
- ✅ Only authenticated users can access `/user/orders`
- ✅ Users only see their own orders (filtered by `user_id` or `customer_email`)
- ✅ Invoice component runs client-side (no server exposure)
- ✅ jsPDF generates PDF locally in browser

### Status Validation
```typescript
// Status must be exactly "confirmed" (case-insensitive)
const validStatuses = ['confirmed'];
const isEnabled = validStatuses.includes(order.status.toLowerCase());
```

---

## 📊 Database Requirements

### Required Columns in `orders` Table
```sql
-- Core fields
id UUID PRIMARY KEY
created_at TIMESTAMP
customer_name TEXT
customer_email TEXT
customer_phone TEXT (optional)
shipping_address JSONB/TEXT (optional)
notes TEXT (optional)
status TEXT -- Must include 'confirmed' state

-- Payment fields (from migration 004)
payment_method TEXT
payment_option TEXT -- 'full', 'half', 'other'
amount_paid DECIMAL(10, 2)
remaining_balance DECIMAL(10, 2)
total DECIMAL(10, 2)
```

---

## 🚀 How to Use

### For Customers:
1. Place an order through checkout
2. Go to **My Orders** (`/user/orders`)
3. Wait for admin to confirm order
4. Once status = `CONFIRMED`, click **"Download Invoice"** button
5. PDF invoice automatically downloads to your device
6. Use invoice for record-keeping, accounting, or proof of purchase

### For Admins:
1. Go to **Admin Dashboard** → **Orders**
2. Review pending orders
3. Change order status to **"Confirmed"** when payment verified
4. Customer can now download invoice
5. Invoice includes admin-confirmed stamp

---

## 🎨 Button States

### Enabled (Order Confirmed)
```
[Download Icon] Download Invoice
- Background: Green (#22C55E)
- Text: White
- Cursor: Pointer
- Shadow: Drop shadow
- Hover: Darker green with larger shadow
```

### Disabled (Order Not Confirmed)
```
[Download Icon] Download Invoice
- Background: Gray (#D1D5DB)
- Text: Gray (#6B7280)
- Cursor: Not-allowed
- Shadow: None
- Hover: No effect + tooltip
```

---

## 📦 File Output

### Filename Format
```
invoice-ABC12345.pdf
```
Where `ABC12345` = First 8 characters of order ID (uppercase)

### Example Filenames
- `invoice-A3B7C2D1.pdf`
- `invoice-9F8E7D6C.pdf`
- `invoice-1234ABCD.pdf`

---

## 🐛 Troubleshooting

### Issue: Button Always Disabled
**Cause**: Order status not set to "confirmed"
**Solution**: Admin must update order status to "confirmed" in admin panel

### Issue: PDF Not Downloading
**Cause**: jsPDF library not installed
**Solution**: Run `npm install jspdf`

### Issue: Invoice Missing Payment Details
**Cause**: Order placed before migration 004
**Solution**: Run migration `004_add_payment_options.sql` in Supabase

### Issue: Can't See Invoice Button
**Cause**: Component not imported
**Solution**: Add `import Invoice from "@/components/Invoice"` to orders page

---

## 🔄 Future Enhancements

### Potential Features:
- 📧 **Email Invoice**: Send PDF directly to customer email
- 🖨️ **Print View**: Optimized print layout
- 📎 **Attach Items**: List ordered products with images
- 🌐 **Multi-language**: Support for different languages
- 🎨 **Custom Branding**: Upload company logo
- 📊 **Invoice History**: Track all downloaded invoices
- 💾 **Save to Cloud**: Store invoices in customer account
- 🔗 **Shareable Link**: Generate public invoice link

---

## ✅ Checklist for Setup

- [ ] Run migration `004_add_payment_options.sql` in Supabase
- [ ] Run migration `005_create_payment_methods_table.sql` in Supabase
- [ ] Install jsPDF: `npm install jspdf`
- [ ] Create `components/Invoice.tsx` component
- [ ] Import `Invoice` component in `app/user/orders/page.tsx`
- [ ] Update Order interface to include payment fields
- [ ] Test with order in "pending" status (button disabled)
- [ ] Test with order in "confirmed" status (button enabled)
- [ ] Verify PDF downloads correctly
- [ ] Verify invoice content is accurate

---

## 📝 Summary

The invoice feature provides customers with professional, downloadable PDF invoices that are only available after admin confirmation. This ensures accuracy, prevents premature documentation, and provides a complete record of the transaction including payment plan details, amounts paid, and remaining balances.

**Key Benefits**:
- ✅ Professional documentation
- ✅ Prevents premature invoice generation
- ✅ Shows payment plan details
- ✅ Tracks partial payments
- ✅ No server-side processing required
- ✅ Instant PDF generation in browser
- ✅ Mobile-friendly download
