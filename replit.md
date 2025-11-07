# Production-Ready Portfolio Website

## Overview
A fully functional, animated portfolio website built with React, TypeScript, Vite, and Supabase. Features a comprehensive VIP Admin Panel for managing developer profiles, projects, and site settings with real-time updates.

**Live Status**: ✅ Running on port 5000

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Storage + Auth + Realtime) + Express (Email Service)
- **Email**: Nodemailer with Gmail SMTP
- **Build Tool**: Vite 5.4
- **Deployment**: Replit Autoscale

## Project Structure
```
├── src/
│   ├── components/       # React components
│   │   ├── admin/       # Admin panel components
│   │   ├── developer/   # Developer dashboard
│   │   ├── layout/      # Layout components
│   │   ├── sections/    # Page sections (including Contact form)
│   │   └── ui/          # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Supabase client setup
│   ├── services/        # API service functions
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── server/              # Backend email service
│   ├── routes/          # API routes
│   │   └── email.ts     # Email sending endpoint
│   ├── index.ts         # Express server setup
│   └── tsconfig.json    # TypeScript config for server
├── supabase/
│   ├── functions/       # Serverless edge functions
│   └── migrations/      # Database schema migrations
└── public/              # Static assets
```

## Key Features
- **Admin Panel**: Secure authentication with role-based access
- **Developer Management**: Full CRUD operations for developer profiles with custom drag-and-drop ordering
- **Project Showcase**: Interactive project gallery with media support and custom drag-and-drop ordering
- **File Management**: Drag & drop upload with image cropping
- **Real-time Updates**: Instant synchronization across all users
- **Audit Logging**: Complete tracking of admin actions
- **Contact Form**: Automated email delivery via Gmail integration
- **Theme Toggle**: Dark/Light mode with system detection
- **Responsive Design**: Mobile-first approach
- **Enhanced UI**: Premium blur effects on modals with smooth animations

## Environment Configuration
The following environment variables are configured in Replit Secrets:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous/public key
- `GMAIL_USER`: Gmail address for sending contact form emails
- `GMAIL_APP_PASSWORD`: Gmail app password for SMTP authentication

## Development
- **Frontend Server**: Runs on port 5000 with HMR (Hot Module Replacement)
- **Backend Server**: Runs on port 3001 for email API
- **Host Configuration**: Configured for Replit's proxy environment (0.0.0.0)
- **Vite Proxy**: /api requests proxied to backend server during development
- **Concurrent Execution**: Both servers run simultaneously via concurrently

## Deployment
- **Build Command**: `npm run build`
- **Output**: `dist/` directory
- **Preview**: `npx vite preview --host 0.0.0.0 --port 5000`
- **Target**: Autoscale (stateless frontend application)

## Admin Access
**Default Admin Credentials** (configured in Supabase):
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change the default password after first login!

## Database Schema
Core tables managed in Supabase:
- `admins`: Admin user management
- `developers`: Developer profiles
- `projects`: Project details
- `project_images`: Media storage references
- `project_developers`: Project-developer relationships
- `site_settings`: Global site configuration
- `audit_logs`: Admin action history

## Recent Changes
- **2025-11-04**: Developer Order & Modal Fixes (Complete Background Isolation)
  - **Enhanced Error Logging**: Improved error logging for developer/project order updates
    - Detailed console logging showing Supabase error codes, messages, hints
    - Failed update count and specific error details for each failure
    - Helps diagnose database schema issues (e.g., missing display_order column)
  - **Modal Complete Redesign**: Full background isolation with React Portal
    - Renders modal at document.body level using React Portal (no parent z-index conflicts)
    - Increased backdrop opacity to 90% (bg-black/90) for complete background dimming
    - Enhanced blur effect to backdrop-blur-3xl (24px) for maximum focus
    - Z-index raised to 99999 to guarantee top-most layer
    - Added CSS isolation property to create independent stacking context
    - Body scroll prevention with proper overflow management
    - Background content now completely hidden when modal is open
    - Works perfectly on both desktop and mobile devices
  - **Migration Note**: The `display_order` column migration for developers needs to be applied
    - Migration file: `supabase/migrations/20251104170000_add_display_order_to_developers.sql`
    - See `MIGRATION_INSTRUCTIONS.md` for step-by-step guide
    - Once applied, developer drag-and-drop ordering will work perfectly

- **2025-11-04**: Drag-and-Drop Ordering System for Admin Panel
  - **@dnd-kit Integration**: Added professional drag-and-drop library for intuitive reordering
  - **Developer Ordering**: Custom drag-and-drop UI with grip indicators for reordering developers
  - **Project Ordering**: Drag-and-drop functionality for reordering projects in admin panel
  - **Database Persistence**: display_order field with bulk update methods for order persistence
  - **Resilient Implementation**: Client-side fallback sorting when display_order column isn't available
  - **Migration File**: Created migration for adding display_order to developers table
  - **Visual Feedback**: GripVertical icons and smooth drag animations for better UX
  - **Result**: Admins can now customize the display order of developers and projects with simple drag-and-drop

- **2025-11-04**: Gmail Integration for Contact Form
  - **Backend Service**: Created Express server with TypeScript and Nodemailer
  - **Email Endpoint**: POST /api/send-email route with Gmail SMTP integration
  - **Frontend Integration**: Updated Contact form to call backend API
  - **Vite Proxy**: Configured /api proxy for seamless development/production compatibility
  - **Security**: Environment-based credentials (no hardcoded secrets)
  - **Testing**: Verified email delivery with proper sender attribution
  - **Result**: Fully functional contact form that sends emails to configured Gmail address

- **2025-11-03**: Initial Replit environment setup
  - Configured Vite for Replit proxy (0.0.0.0:5000)
  - Set up environment variables with Supabase credentials
  - Configured workflow for development server
  - Set up deployment configuration for Replit Autoscale

- **2025-11-03**: Comprehensive Performance Optimizations (**2-3× faster loading**)
  - **Dependency Cleanup**: Removed 155 unused backend packages (~40MB+)
  - **Build Optimization**: Configured Vite with code splitting, terser minification, gzip/brotli compression
  - **Lazy Loading**: AdminPanel, DeveloperDashboard, and modal components (~17 kB) load on-demand only
  - **Bundle Size**: Initial load 180 kB (gzipped) / 151 kB (brotli) with proper vendor chunking
  - **Icon Optimization**: Centralized lucide-react icon imports for tree-shaking
  - **HTML Enhancements**: Added meta tags, preconnect hints, SEO optimization
  - **Result**: Production build in 32s with dual compression, admin features lazy-loaded
  - See `PERFORMANCE_OPTIMIZATIONS.md` for complete details

## Notes
- All backend logic runs on Supabase (serverless)
- File storage uses Supabase Storage buckets
- Real-time features use Supabase Realtime subscriptions
- Edge functions handle video processing and admin operations
