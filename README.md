# QRMatic - Personal QR Code Generator

A Next.js application for generating, managing, and tracking QR codes with Supabase backend.

## Features

- 🔐 **Authentication** - Supabase Auth with email/password (pre-approved users only)
- 📊 **Analytics** - Track scans with charts and device breakdown
- 🎯 **QR Types** - Static and dynamic QR codes
- 📱 **Responsive** - Mobile-friendly design
- 🔗 **Short URLs** - Clean redirect URLs with analytics tracking

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Backend**: Supabase (Auth + Database)
- **QR Generation**: `qrcode` npm package
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: CSS Modules

## Project Structure

```
/app
  /login/page.js              # Supabase login page
  /dashboard/page.js          # List of user's QR codes
  /dashboard/new/page.js      # Form to generate QR code
  /dashboard/qr/[id]/page.js  # Show analytics for one QR code
  /r/[short_code]/page.js     # Redirect handler
/components
  Navbar.js                   # Navigation component
  QRForm.js                   # QR code creation form
  QRTable.js                  # QR codes list table
  AnalyticsChart.js           # Charts for analytics
/lib
  supabaseClient.js           # Supabase client setup
  auth.js                     # Authentication utilities
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Go to Supabase SQL Editor
2. Run the SQL schema from `supabase-schema.sql`
3. This creates the required tables with Row Level Security

### 4. Authentication Setup

1. In Supabase Dashboard → Authentication → Settings
2. **Disable** "Enable email confirmations"
3. **Disable** "Enable sign ups" (pre-approved users only)
4. Add users manually in Authentication → Users

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Database Schema

### `qrcodes` table
- `id` - UUID primary key
- `user_id` - FK to auth.users
- `type` - 'static' or 'dynamic'
- `short_code` - unique short identifier
- `target_url` - destination URL
- `created_at`, `updated_at` - timestamps

### `scan_logs` table
- `id` - UUID primary key
- `qrcode_id` - FK to qrcodes
- `scanned_at` - scan timestamp
- `ip_address` - optional IP tracking
- `user_agent` - optional device info

## Key Features

### Authentication
- Only pre-approved users can log in
- Protected dashboard routes with middleware
- Automatic redirect to login for unauthenticated users

### QR Code Generation
- Static QR codes (URL cannot be changed)
- Dynamic QR codes (URL can be updated later)
- Automatic short code generation
- PNG download functionality

### Analytics Dashboard
- Total scan counts
- 30-day scan history charts
- Device type breakdown
- Recent scan logs with IP/timestamp

### URL Redirection
- Clean URLs: `/r/[short_code]`
- Automatic scan logging
- IP and user agent tracking

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Security Features

- Row Level Security (RLS) policies
- User isolation (users can only see their own QR codes)
- Public scan logging for analytics
- CSRF protection via Supabase Auth
- Input validation and sanitization

## Deployment

1. Deploy to Vercel, Netlify, or your preferred platform
2. Set environment variables in deployment settings
3. Ensure Supabase is configured for production domain

## License

MIT License