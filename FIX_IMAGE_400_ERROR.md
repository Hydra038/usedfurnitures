# Fix: 400 Error for Missing Images

## 🔴 The Error

```
⨯ upstream image response failed for https://ymxfzvegppcikyjyedzi.supabase.co/storage/v1/object/public/product-images/1764583065300.png 400
```

## 🎯 Root Cause

The database has a reference to `1764583065300.png` but the file doesn't exist in Supabase storage.

**Why this happens:**
1. Upload failed but database entry was created
2. File was manually deleted from storage
3. Wrong bucket (looking in product-images instead of payment-proofs)

---

## ✅ Fixes Applied

### **1. Updated `getImageUrl()` Function** ✓
**File**: `lib/utils/imageUrl.ts`

**Changes:**
- Added `bucket` parameter to specify correct storage bucket
- Auto-detects bucket (payment-proofs vs product-images)
- Returns placeholder for missing images
- Better error handling

**Usage:**
```tsx
// For product images
getImageUrl(imagePath)

// For payment proofs
getImageUrl(paymentProofPath, 'payment-proofs')
```

### **2. Updated Next.js Config** ✓
**File**: `next.config.js`

**Changes:**
- Added `unoptimized: true` in development to skip optimization errors
- Added SVG support for placeholders
- Better error handling for remote images

### **3. Placeholder Image** ✓
**File**: `public/placeholder-furniture.jpg`

Already exists - will be shown when image is missing.

---

## 🛠️ Additional Fixes Needed

### **Fix Admin Orders Page**

Update the admin orders page to use correct bucket:

**File**: `app/admin/orders/page.tsx`

Find this line:
```tsx
<Image
  src={getImageUrl(order.payment_proof_url)}
  alt="Payment Proof"
  fill
  className="object-contain"
/>
```

Change to:
```tsx
<Image
  src={getImageUrl(order.payment_proof_url, 'payment-proofs')}
  alt="Payment Proof"
  fill
  className="object-contain"
  onError={(e) => {
    e.currentTarget.src = '/placeholder-furniture.jpg';
  }}
/>
```

---

## 🔍 How to Find the Problem Product/Order

Run this SQL in Supabase to find the broken reference:

```sql
-- Check products with missing images
SELECT id, title, images 
FROM products 
WHERE '1764583065300.png' = ANY(images);

-- Check orders with missing payment proof
SELECT id, customer_name, payment_proof_url 
FROM orders 
WHERE payment_proof_url = '1764583065300.png';
```

---

## 🧹 Cleanup Options

### **Option A: Delete the Broken Record**
If the product/order is not important:

```sql
-- Delete product
DELETE FROM products WHERE '1764583065300.png' = ANY(images);

-- Or delete order
DELETE FROM orders WHERE payment_proof_url = '1764583065300.png';
```

### **Option B: Replace with Placeholder**
Keep the record but use placeholder:

```sql
-- For products (update array)
UPDATE products 
SET images = array_replace(images, '1764583065300.png', NULL)
WHERE '1764583065300.png' = ANY(images);

-- For orders
UPDATE orders 
SET payment_proof_url = NULL 
WHERE payment_proof_url = '1764583065300.png';
```

### **Option C: Re-upload the Image**
If you have the original file:

1. Go to Supabase Dashboard → Storage
2. Navigate to the correct bucket (product-images or payment-proofs)
3. Upload the file with name: `1764583065300.png`

---

## 🚀 Prevention: Better Upload Handling

### **Add Upload Validation**

**File**: `app/checkout/page.tsx` (or wherever upload happens)

```tsx
// Before upload
if (paymentProof) {
  // Validate file size
  if (paymentProof.size > 10 * 1024 * 1024) {
    alert('File too large. Maximum size is 10MB');
    return;
  }
  
  // Validate file type
  if (!paymentProof.type.startsWith('image/')) {
    alert('Please upload an image file');
    return;
  }
  
  try {
    const fileExt = paymentProof.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, paymentProof);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Failed to upload payment proof. Please try again.');
      return; // Don't continue if upload fails
    }
    
    paymentProofUrl = uploadData.path;
    
  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload payment proof. Please try again.');
    return;
  }
}
```

### **Add Verification After Upload**

```tsx
// After upload, verify file exists
if (paymentProofUrl) {
  const { data: fileData } = await supabase.storage
    .from('payment-proofs')
    .list('', {
      search: fileName
    });
  
  if (!fileData || fileData.length === 0) {
    throw new Error('File upload verification failed');
  }
}
```

---

## 🧪 Testing the Fix

### **Test 1: View Page with Broken Image**
1. Navigate to page with error
2. Should show placeholder instead of error
3. No 400 errors in console

### **Test 2: Upload New Payment Proof**
1. Go to checkout
2. Upload a new image
3. Complete order
4. Verify image shows in admin dashboard

### **Test 3: View Admin Orders**
1. Go to admin orders
2. Open order with payment proof
3. Image should display or show placeholder
4. Download should work

---

## 📋 Quick Checklist

- [x] Updated `getImageUrl()` function
- [x] Updated `next.config.js`
- [x] Placeholder image exists
- [ ] Update admin orders page to use correct bucket
- [ ] Find and fix broken database records
- [ ] Add upload validation
- [ ] Add error handling to Image components
- [ ] Test on production

---

## 🔗 Related Files

- `lib/utils/imageUrl.ts` - Image URL helper
- `next.config.js` - Next.js configuration
- `app/admin/orders/page.tsx` - Admin orders display
- `app/checkout/page.tsx` - Payment proof upload
- `PAYMENT_PROOF_FLOW.md` - Complete upload documentation

---

## 💡 Summary

**The Fix:**
1. ✅ Better error handling in `getImageUrl()`
2. ✅ Correct bucket detection (payment-proofs vs product-images)
3. ✅ Fallback to placeholder for missing images
4. ✅ Development mode skips image optimization errors

**Next Steps:**
1. Find and clean up broken database records
2. Add better upload validation
3. Test thoroughly on production

**The error won't crash your app anymore!** 🎉

---

**Last Updated**: December 1, 2025
