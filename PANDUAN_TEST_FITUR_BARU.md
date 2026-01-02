# Panduan Testing Fitur Tiket Eksternal dan QR Code

## Quick Start Testing

### 1. Test Halaman Tiket Eksternal (Public)

**URL:** `http://localhost:3000/tiket-eksternal`

**Test Cases:**
```
✅ Form Loading
- Halaman terbuka tanpa error
- Form fields tampil lengkap
- Toggle identitas pribadi/anonim berfungsi

✅ Form Submission
- Isi semua field required
- Test dengan identitas pribadi
- Test dengan identitas anonim
- Upload file attachment
- Submit dan cek response

✅ QR Code Integration
- Akses via `/tiket-eksternal/QR12345678` (ganti dengan QR code yang ada)
- Form pre-filled dengan unit info
- Submit berhasil dengan QR tracking
```

### 2. Test QR Code Management (Admin)

**URL:** `http://localhost:3000/tickets/qr-management`

**Test Cases:**
```
✅ QR Code List
- Login sebagai admin
- Buka halaman QR management
- List QR codes tampil dengan analytics
- Search dan filter berfungsi

✅ Generate QR Code
- Klik "Generate QR Code Baru"
- Pilih unit dan isi nama
- Generate berhasil
- QR code muncul di list

✅ QR Code Actions
- Print QR code
- Copy link QR code
- Toggle status aktif/tidak aktif
- View analytics detail
```

### 3. Test AI Escalation Management (Admin)

**URL:** `http://localhost:3000/tickets/ai-escalation`

**Test Cases:**
```
✅ Dashboard Stats
- Statistics cards tampil dengan data
- Workflow diagram tampil
- AI configuration panel berfungsi

✅ Escalation Rules
- List rules tampil dengan status
- Search dan filter berfungsi
- Rule details tampil lengkap

✅ Rule Management
- Create new escalation rule
- Edit existing rule
- Toggle rule status
- Delete rule (dengan validasi)
```

## Database Verification

### Check Sample Data
```sql
-- Cek QR codes
SELECT * FROM qr_codes WHERE is_active = true;

-- Cek external tickets
SELECT * FROM external_tickets ORDER BY created_at DESC;

-- Cek escalation rules
SELECT * FROM ai_escalation_rules WHERE is_active = true;

-- Cek analytics
SELECT * FROM qr_code_analytics ORDER BY scan_date DESC;
```

### Test Data Creation
```sql
-- Insert test QR code
INSERT INTO qr_codes (unit_id, code, token, name, description, is_active) 
VALUES (
    (SELECT id FROM units WHERE is_active = true LIMIT 1),
    'TEST12345',
    'test-token-12345',
    'Test QR Code',
    'QR Code untuk testing',
    true
);
```

## API Testing dengan Curl

### 1. Create External Ticket (Public)
```bash
curl -X POST http://localhost:5000/api/external-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "unit_id": "unit-id-here",
    "reporter_identity_type": "personal",
    "reporter_name": "Test User",
    "reporter_email": "test@email.com",
    "service_type": "complaint",
    "title": "Test Complaint",
    "description": "This is a test complaint"
  }'
```

### 2. Get QR Code (Public)
```bash
curl http://localhost:5000/api/qr-codes/scan/TEST12345
```

### 3. Get External Tickets (Admin - need token)
```bash
curl -X GET http://localhost:5000/api/external-tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Escalation Stats (Admin)
```bash
curl -X GET http://localhost:5000/api/ai-escalation/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Testing Checklist

### Responsive Design
```
✅ Desktop (1920x1080)
- Layout proper
- All elements visible
- Navigation working

✅ Tablet (768x1024)
- Mobile menu working
- Forms responsive
- Tables scrollable

✅ Mobile (375x667)
- Touch-friendly
- Forms usable
- Navigation accessible
```

### Browser Compatibility
```
✅ Chrome (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
✅ Edge (Latest)
```

### Performance Testing
```
✅ Page Load Speed
- Initial load < 3 seconds
- Navigation smooth
- No console errors

✅ File Upload
- Files upload successfully
- Progress indication
- Error handling

✅ Real-time Updates
- WebSocket connections
- Live notifications
- Data refresh
```

## Error Handling Testing

### Form Validation
```
✅ Required Fields
- Empty required fields show error
- Invalid email format rejected
- File size limits enforced

✅ Server Errors
- Network errors handled gracefully
- Server 500 errors show user-friendly message
- Timeout errors handled

✅ Authentication
- Expired tokens redirect to login
- Unauthorized access blocked
- Role-based access enforced
```

### File Upload Errors
```
✅ File Type Validation
- Only JPG, PNG, PDF allowed
- Other types rejected with message

✅ File Size Validation
- Files > 5MB rejected
- Clear error message shown

✅ Upload Failures
- Network errors handled
- Server errors handled
- Retry mechanism available
```

## Integration Testing

### QR Code to Ticket Flow
```
1. Generate QR code for unit
2. Access QR URL
3. Submit ticket via QR form
4. Verify ticket created with QR reference
5. Check analytics updated
6. Verify usage count incremented
```

### AI Escalation Flow
```
1. Create escalation rule
2. Submit ticket matching rule criteria
3. Verify auto-escalation triggered
4. Check escalation log created
5. Verify ticket status updated
6. Check rule statistics updated
```

### End-to-End User Journey
```
1. Public user scans QR code
2. Fills and submits complaint form
3. Admin receives notification
4. Admin reviews ticket in dashboard
5. AI escalation triggers if criteria met
6. Assigned user gets notification
7. User responds to ticket
8. Status updated and tracked
```

## Performance Benchmarks

### Expected Response Times
```
- Page loads: < 2 seconds
- API calls: < 500ms
- File uploads: < 5 seconds (for 5MB)
- Database queries: < 100ms
- QR code generation: < 1 second
```

### Concurrent Users
```
- 100 concurrent form submissions
- 50 concurrent admin users
- 1000 QR code scans per hour
- Real-time updates for 200 users
```

## Troubleshooting Common Issues

### Frontend Issues
```
❌ "Module not found" errors
✅ Run: npm install

❌ "Cannot read property" errors
✅ Check TypeScript types and interfaces

❌ Styling issues
✅ Verify Tailwind CSS classes and responsive design
```

### Backend Issues
```
❌ "Cannot connect to database"
✅ Check Supabase connection and environment variables

❌ "File upload failed"
✅ Check uploads directory permissions and disk space

❌ "Authentication failed"
✅ Verify JWT token and middleware configuration
```

### Database Issues
```
❌ "Table does not exist"
✅ Run migration: npm run migrate

❌ "Foreign key constraint"
✅ Check related table data exists

❌ "Permission denied"
✅ Verify RLS policies and user permissions
```

## Success Criteria

### Functional Requirements
```
✅ All forms submit successfully
✅ QR codes generate and scan properly
✅ Escalation rules execute correctly
✅ File uploads work reliably
✅ Analytics track accurately
✅ Authentication and authorization work
✅ Real-time updates function
✅ Mobile responsive design works
```

### Non-Functional Requirements
```
✅ Performance meets benchmarks
✅ Security measures implemented
✅ Error handling comprehensive
✅ User experience intuitive
✅ Code quality maintainable
✅ Documentation complete
```

Gunakan checklist ini untuk memastikan semua fitur berfungsi dengan baik sebelum deployment ke production.