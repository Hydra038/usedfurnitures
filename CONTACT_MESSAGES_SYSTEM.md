# Contact Messages Management System

## Overview
A complete system for managing customer contact messages with admin interface for viewing, responding to, and organizing messages.

---

## Features

### 1. **Customer Contact Form** (`/contact`)
- Name, email, and message fields
- Saves messages directly to database
- Confirmation message on successful submission
- Error handling with user feedback
- Loading state during submission

### 2. **Admin Messages Dashboard** (`/admin/messages`)
- View all contact messages
- Filter by status (All, Unread, Read, Replied, Archived)
- Unread message counter
- Real-time status updates
- Message detail view
- Admin notes functionality
- Message deletion

### 3. **Message Statuses**
- **Unread** (blue badge) - New messages not yet viewed
- **Read** (gray badge) - Messages that have been opened
- **Replied** (green badge) - Messages that have been responded to
- **Archived** (yellow badge) - Completed or old messages

---

## Database Schema

### Table: `contact_messages`
```sql
- id: BIGSERIAL PRIMARY KEY
- name: VARCHAR(255) NOT NULL
- email: VARCHAR(255) NOT NULL
- message: TEXT NOT NULL
- status: VARCHAR(50) DEFAULT 'unread'
  - CHECK: status IN ('unread', 'read', 'replied', 'archived')
- admin_notes: TEXT (private notes for admin use)
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### Security Policies (RLS)
- **INSERT**: Public - Anyone can submit messages
- **SELECT**: Authenticated only - Only admin can view
- **UPDATE**: Authenticated only - Only admin can update
- **DELETE**: Authenticated only - Only admin can delete

---

## How to Use (Admin)

### Accessing Messages
1. Log in to admin panel at `/admin/login`
2. Click **Menu** dropdown in top-right
3. Select **Contact Messages**
4. Or navigate directly to `/admin/messages`

### Viewing Messages
1. Messages are displayed in chronological order (newest first)
2. Unread messages are highlighted with blue badge
3. Click any message card to view full details
4. Message automatically marks as "read" when clicked

### Managing Messages

#### Update Status
1. Select a message
2. Click one of the status buttons:
   - **Mark Read** - Message has been viewed
   - **Mark Replied** - You've responded to customer
   - **Archive** - Message is resolved/completed
   - **Mark Unread** - Reset to unread status

#### Add Admin Notes
1. Select a message
2. Scroll to "Admin Notes" section
3. Type your private notes
4. Click **Save Notes**
5. Notes are only visible to admin users

#### Delete Message
1. Select a message
2. Scroll to bottom
3. Click **Delete Message** (red button)
4. Confirm deletion

### Filtering Messages
Use the filter buttons at the top:
- **All** - Show all messages
- **Unread** - New messages only
- **Read** - Viewed messages
- **Replied** - Responded messages
- **Archived** - Completed messages

---

## Responding to Customers

### Email Response
1. Click the customer's email address in message details
2. Your default email client opens with "To" field filled
3. Compose your response
4. Send email
5. Return to admin panel
6. Mark message as "Replied"

### Direct Contact
- Phone number is displayed if provided
- Can call or text customer directly
- Mark message accordingly after contact

---

## Workflow Example

### Typical Message Handling Flow:
1. **Customer submits message** → Status: Unread (blue)
2. **Admin opens message** → Auto-changes to: Read (gray)
3. **Admin responds via email** → Manually mark as: Replied (green)
4. **Issue resolved** → Mark as: Archived (yellow)

---

## Message Information Displayed

### In List View:
- Customer name
- Email address
- Message preview (first 2 lines)
- Status badge with icon
- Date and time received

### In Detail View:
- Full customer name
- Email (clickable to compose)
- Complete message text
- Received date/time
- Current status
- Admin notes (if any)

---

## Migration Required

To use this feature, run the migration:
```bash
# The migration is already created at:
supabase/migrations/20240101000006_create_contact_messages.sql
```

If using Supabase:
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of migration file
3. Run the SQL
4. Verify table created successfully

---

## Technical Details

### Components
- **Frontend Form**: `app/contact/page.tsx`
- **Admin Dashboard**: `app/admin/messages/page.tsx`
- **Admin Layout**: Updated with Messages link
- **Database Migration**: `20240101000006_create_contact_messages.sql`

### Dependencies
- `@supabase/auth-helpers-nextjs` - Database connection
- `lucide-react` - Icons
- Tailwind CSS - Styling

### Icons Used
- Mail - Unread status
- MailOpen - Read status
- Check - Replied status
- Archive - Archived status
- Trash2 - Delete action
- Clock - Timestamp indicator

---

## Security Features

1. **Row Level Security (RLS)** enabled
2. Only authenticated users can view messages
3. Public can only INSERT (submit) messages
4. Admin notes are database-level private
5. No customer data exposed in public API

---

## Best Practices

### For Admin Users:
1. Check messages daily
2. Respond within 24 hours
3. Use admin notes to track follow-ups
4. Archive old messages regularly
5. Delete spam/test messages promptly

### Status Usage Guide:
- **Unread**: Leave as-is until you read it
- **Read**: Message opened but not yet responded
- **Replied**: You've sent a response
- **Archived**: Conversation complete, no action needed

---

## Troubleshooting

### Messages not appearing?
- Check filter selection (try "All")
- Verify migration was run successfully
- Check RLS policies in Supabase dashboard

### Can't update status?
- Ensure you're logged in as admin
- Check authentication token is valid
- Verify RLS policies allow UPDATE

### Form submission fails?
- Check Supabase connection
- Verify table exists
- Check INSERT policy is enabled for public

---

## Future Enhancements (Optional)

Potential improvements you could add:
- Email notifications when new messages arrive
- Reply directly from admin panel (email integration)
- Message search functionality
- Bulk actions (mark multiple as read, etc.)
- Customer message history (multiple messages from same email)
- Priority/urgency levels
- Assignment to specific admin users
- Response templates

---

## Contact Form Location

Customers can access the contact form at:
- **URL**: `yourdomain.com/contact`
- Also linked in:
  - Footer (Contact link)
  - Navbar (Contact)
  - Product pages (if issues arise)

---

## Summary

This complete contact management system allows you to:
✅ Receive customer messages in database
✅ View and organize messages by status
✅ Add private admin notes
✅ Track message lifecycle
✅ Respond to customers efficiently
✅ Maintain secure message handling

The system is production-ready and fully functional!
