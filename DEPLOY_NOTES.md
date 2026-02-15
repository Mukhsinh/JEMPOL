# Fix for 404 Errors on Direct Links (QR Codes)

## Issue
Users were experiencing a 404 Not Found error when accessing direct links like `/form/eksternal` or `/form/internal`, especially via QR codes.

## Cause
The Vercel configuration (`vercel.json`) was missing a "catch-all" rewrite rule for Single Page Applications (SPA). By default, Vercel tries to find a file or directory matching the URL. When it doesn't find `form/eksternal` (because it's a client-side route), it returns a 404.

## Solution
We updated `vercel.json` to include a standard SPA rewrite rule:

```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

This tells Vercel to serve `index.html` for **all** routes that don't match a specific file or API endpoint. This allows React Router to handle the routing on the client side, correctly displaying the form.

## Verification
- Verified `vercel.json` configuration is correct for SPA.
- Verified `npm run vercel-build` succeeds locally.
- Verified `qrCodeService.ts` generates the correct URL format (`/form/eksternal?qr=...`).
- Verified `DirectExternalTicketForm.tsx` correctly parses URL parameters (`unit_id`, `qr`, etc.).

## Action Required
To apply this fix, you simply need to **deploy** the latest changes to Vercel.

```bash
git add vercel.json
git commit -m "Fix Vercel SPA routing for deep links"
git push
```
