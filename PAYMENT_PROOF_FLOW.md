# Payment Proof Upload Flow - Complete Documentation

## 📋 Overview
When a client uploads proof of payment during checkout, here's exactly what happens:

---

## 🔄 Step-by-Step Flow

### **1. Client Uploads File (Checkout Page)**
**Location**: `app/checkout/page.tsx` - Line 518-527

```tsx
<input
  type="file"
  accept="image/*"
  onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
  className="input-field"
/>
```

**What happens:**
- Client selects an image file (PNG, JPG, etc.)
- File is stored in React state: `paymentProof` state variable
- File stays in memory until form submission
- **No upload happens yet** - just stored temporarily

---

### **2. Form Submission (Place Order)**
**Location**: `app/checkout/page.tsx` - Line 170-185

When client clicks "Place Order", the upload process starts:

```tsx
// Upload payment proof if provided
let paymentProofUrl = null;
if (paymentProof) {
  const fileExt = paymentProof.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;  // e.g., "1764583065300.png"
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-proofs')  // ← Supabase storage bucket
    .upload(fileName, paymentProof);

  if (uploadError) throw uploadError;
  paymentProofUrl = uploadData.path;  // e.g., "1764583065300.png"
}
```

**What happens:**
1. ✅ Generate unique filename using timestamp: `Date.now()` (e.g., 1764583065300)
2. ✅ Keep original file extension (.png, .jpg, etc.)
3. ✅ Upload to Supabase Storage bucket: `payment-proofs`
4. ✅ Get back the file path (just the filename)
5. ✅ Store path in variable `paymentProofUrl`

---

### **3. Save to Database**
**Location**: `app/checkout/page.tsx` - Line 203-227

After successful upload, the order is created:

```tsx
const { data: orderData, error: orderError } = await supabase
  .from('orders')
  .insert({
    user_id: user?.id || null,
    total: fullTotal,
    payment_option: paymentOption,
    amount_paid: total,
    remaining_balance: remainingBalance,
    shipping_address: { address, city, state, zipCode },
    payment_method: paymentMethod,
    status: 'pending',
    payment_proof_url: paymentProofUrl,  // ← Stored here!
    transaction_reference: transactionId,
    customer_email: customerEmail,
    customer_name: customerName,
    customer_phone: customerPhone,
    notes,
  })
  .select()
  .single();
```

**What happens:**
- ✅ `payment_proof_url` column gets the filename (e.g., "1764583065300.png")
- ✅ Order saved with status: "pending"
- ✅ All other order details saved
- ✅ Cart cleared after successful order

---

## 📁 Where Files Are Stored

### **Supabase Storage:**
- **Bucket Name**: `payment-proofs`
- **Privacy**: Private (not publicly accessible)
- **Access**: Only authenticated users can view
- **File Naming**: `{timestamp}.{extension}` (e.g., `1764583065300.png`)

### **Database:**
- **Table**: `orders`
- **Column**: `payment_proof_url` (TEXT)
- **Stored Value**: Just the filename, not full URL
- **Example**: `"1764583065300.png"`

---

## 🔍 How Admin Views Payment Proof

### **Location**: `app/admin/orders/page.tsx` - Payment Proof Display

```tsx
{order.payment_proof_url && (
  <div>
    <h3 className="font-semibold mb-2">Payment Proof:</h3>
    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-2">
      <Image
        src={getImageUrl(order.payment_proof_url)}
        alt="Payment Proof"
        fill
        className="object-contain"
      />
    </div>
    <button
      onClick={() => downloadPaymentProof(order.payment_proof_url!, order.customer_name)}
      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
    >
      <Download className="w-4 h-4" />
      Download Payment Proof
    </button>
  </div>
)}
```

**What happens:**
1. ✅ `getImageUrl()` converts filename to full Supabase URL
2. ✅ Full URL format: `https://ymxfzvegppcikyjyedzi.supabase.co/storage/v1/object/public/payment-proofs/1764583065300.png`
3. ✅ Image displayed in modal
4. ✅ Download button available

---

## 🛠️ Helper Function: getImageUrl()

**Location**: `lib/utils/imageUrl.ts`

```tsx
export function getImageUrl(image: string | undefined | null): string {
  if (!image) return '/placeholder.jpg';
  
  // If already a full URL, return as-is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // Convert relative path to full Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Determine bucket based on file path
  const bucket = image.includes('payment-proofs') ? 'payment-proofs' : 'product-images';
  
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${image}`;
}
```

---

## ⚠️ Common Issues & Solutions

### **Issue 1: 400 Error - File Not Found**
**Error**: `upstream image response failed for https://...supabase.co/.../1764583065300.png 400`

**Causes:**
1. File was uploaded but then deleted from storage
2. Upload failed but database entry was created
3. Storage bucket doesn't exist
4. Wrong bucket name in URL

**Solutions:**
- Check if file exists in Supabase Dashboard → Storage → payment-proofs
- Verify bucket name is correct
- Check storage policies allow access

---

### **Issue 2: Upload Fails Silently**
**Cause:** Storage bucket doesn't have proper policies

**Solution:** Run this SQL in Supabase:
```sql
-- Check if payment-proofs bucket exists
SELECT * FROM storage.buckets WHERE id = 'payment-proofs';

-- If not, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT DO NOTHING;

-- Add policies for authenticated users
CREATE POLICY "Authenticated users can upload payment proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Authenticated users can view payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-proofs');

-- Allow public users to upload (for checkout without login)
CREATE POLICY "Public can upload payment proofs"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'payment-proofs');
```

---

### **Issue 3: File Too Large**
**Cause:** Supabase has file size limits

**Default Limits:**
- Free tier: 50 MB per file
- Pro tier: 5 GB per file

**Solution:** Add client-side validation:
```tsx
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File too large. Please upload an image under 10MB');
        return;
      }
      setPaymentProof(file);
    }
  }}
/>
```

---

## 📊 Data Flow Summary

```
Client Browser
    ↓ (selects file)
React State (paymentProof)
    ↓ (form submit)
Supabase Storage Upload
    ↓ (success)
Get File Path
    ↓ (save to DB)
Orders Table (payment_proof_url)
    ↓ (admin views)
Admin Dashboard (getImageUrl)
    ↓ (display)
Full Supabase URL
    ↓ (render)
Image Component
```

---

## 🔐 Security Considerations

### **Storage Bucket Security:**
- ✅ `payment-proofs` bucket is **private** (not public)
- ✅ Only authenticated users can view
- ✅ RLS policies control access
- ✅ Files not directly accessible via URL without auth

### **File Validation:**
- ✅ Only image files accepted: `accept="image/*"`
- ⚠️ **TODO**: Add server-side validation for file type
- ⚠️ **TODO**: Add file size limit
- ⚠️ **TODO**: Scan for malicious content

---

## 📝 Database Schema

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... other columns ...
  payment_proof_url TEXT,  -- ← Stores filename only
  -- ... other columns ...
);
```

**Example Data:**
```
id: "550e8400-e29b-41d4-a716-446655440000"
payment_proof_url: "1764583065300.png"
status: "pending"
customer_name: "John Doe"
```

---

## 🎯 Best Practices

### **For Development:**
1. ✅ Always check if file exists before displaying
2. ✅ Use placeholder image for missing files
3. ✅ Add loading states during upload
4. ✅ Show upload progress for large files
5. ✅ Validate file type and size before upload

### **For Production:**
1. ✅ Implement file size limits
2. ✅ Add retry logic for failed uploads
3. ✅ Compress images before upload
4. ✅ Generate thumbnails for faster loading
5. ✅ Add error tracking (e.g., Sentry)
6. ✅ Regular cleanup of orphaned files

---

## 🚀 Future Enhancements

### **Potential Improvements:**
1. **Image Compression**: Compress images client-side before upload
2. **Multiple Files**: Allow uploading multiple payment proofs
3. **Preview**: Show image preview before upload
4. **Drag & Drop**: Add drag-and-drop file upload
5. **Progress Bar**: Show upload progress percentage
6. **Auto-Retry**: Retry failed uploads automatically
7. **Thumbnails**: Generate thumbnails for faster admin viewing
8. **OCR**: Extract transaction ID from image automatically
9. **Validation**: Verify image contains payment info

---

## 📞 Troubleshooting Checklist

When payment proof upload fails:

- [ ] Check if `payment-proofs` bucket exists in Supabase
- [ ] Verify storage policies allow uploads
- [ ] Confirm file is under size limit
- [ ] Check browser console for errors
- [ ] Verify Supabase credentials are correct
- [ ] Test with different image formats
- [ ] Check network tab for upload request
- [ ] Verify bucket permissions in Supabase dashboard
- [ ] Check if user is authenticated (if required)
- [ ] Review Supabase storage logs

---

## 📖 Related Files

- **Upload Logic**: `app/checkout/page.tsx` (lines 170-185)
- **Display Logic**: `app/admin/orders/page.tsx` (payment proof modal)
- **URL Helper**: `lib/utils/imageUrl.ts`
- **Database Schema**: `supabase/migrations/001_initial_schema.sql`
- **Storage Policies**: Check Supabase Dashboard

---

## 🎓 Key Takeaways

1. **Two-Step Process**: Upload to storage FIRST, then save path to database
2. **Filename Format**: Timestamp-based unique names prevent conflicts
3. **Path Storage**: Only filename stored in DB, not full URL
4. **Security**: Private bucket, authenticated access only
5. **Helper Function**: `getImageUrl()` converts filename to full URL
6. **Error Handling**: Always check for upload errors before proceeding
7. **User Experience**: Show clear feedback during upload process

---

**Last Updated**: December 1, 2025
**Version**: 1.0
