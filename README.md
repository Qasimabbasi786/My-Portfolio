# Production-Ready Portfolio Website with VIP Admin Panel

A fully functional, animated portfolio website built for two developers (expandable to many) with a comprehensive VIP Admin Panel. All data is stored in Supabase with real-time updates, file management, and audit logging.

## 🚀 Features

### Frontend
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for engaging user interactions
- **Real-time Updates**: Instant reflection of admin changes
- **SEO Optimized**: Meta tags and Open Graph support
- **Dark/Light Theme**: User preference with system detection
- **Performance Optimized**: Lazy loading, image optimization

### VIP Admin Panel
- **Secure Authentication**: Role-based access (admin/super-admin)
- **Complete CRUD Operations**: Manage developers, projects, settings
- **File Management**: Drag & drop upload with image cropping
- **Video Processing**: Automatic thumbnail generation
- **Audit Logging**: Track all admin actions with detailed logs
- **Real-time Preview**: See changes instantly on the public site
- **Site Settings**: Customize colors, logo, contact info

### Database & Storage
- **Supabase Backend**: PostgreSQL with Row Level Security
- **File Storage**: Images and videos in organized buckets
- **Real-time Subscriptions**: Instant data synchronization
- **Audit Trail**: Complete history of all changes
- **Data Validation**: Server-side validation and sanitization

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Storage + Auth + Realtime)
- **File Processing**: Client-side cropping + Server-side video processing
- **State Management**: React Hooks + Context
- **Form Handling**: React Hook Form + Zod validation

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Modern web browser

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd portfolio-website
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   ```sql
   -- Copy and paste the contents of supabase/migrations/create_complete_schema.sql
   ```
3. Create storage buckets:
   - Go to Storage → Create bucket → "avatars" (public)
   - Create bucket → "projects" (public)
   - Create bucket → "assets" (public)

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy Edge Function (Optional)

For video processing, deploy the edge function:

```bash
# Install Supabase CLI first
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy edge function
supabase functions deploy video-processor
```

### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the website.

## 🔐 Admin Access

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

### Accessing Admin Panel
1. Visit the website
2. Click the "Admin" button in the header
3. Login with credentials
4. Start managing content

## 📊 Database Schema

### Core Tables
- **admins**: Admin user management with roles
- **developers**: Developer profiles and information
- **projects**: Project details and metadata
- **project_images**: File storage for project media
- **project_developers**: Many-to-many project-developer relationships
- **site_settings**: Global site configuration
- **audit_logs**: Complete audit trail of admin actions

### Security Features
- Row Level Security (RLS) enabled on all tables
- Password hashing with bcrypt
- Role-based access control
- IP address and user agent logging
- File type and size validation

## 🎨 Customization

### Site Settings
Access the admin panel → Settings tab to customize:
- Site title and description
- Hero section content
- Contact information
- Logo and branding
- Theme colors
- Default theme preference

### Adding Developers
1. Admin Panel → Developers tab
2. Click "Add Developer"
3. Fill in profile information
4. Upload profile picture (with cropping)
5. Add skills and social links

### Managing Projects
1. Admin Panel → Projects tab
2. Click "Add Project"
3. Add project details and technologies
4. Upload images and videos
5. Assign developers
6. Set featured status and display order

## 📁 File Management

### Supported File Types
- **Images**: JPG, PNG, WebP, GIF
- **Videos**: MP4, WebM, QuickTime

### File Processing
- **Images**: Client-side cropping before upload
- **Videos**: Automatic thumbnail generation
- **Storage**: Organized in buckets by type
- **Validation**: Size limits and type checking

### File Manager Features
- Browse all uploaded files
- Preview images and videos
- Copy public URLs
- Delete unused files
- Search and filter capabilities

## 🔍 Audit Logging

All admin actions are automatically logged with:
- Action type and timestamp
- Admin user information
- IP address and user agent
- Before/after values for updates
- File upload/delete operations

Access logs via Admin Panel → Audit Log tab.

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
# Set environment variables in Netlify dashboard
```

### Environment Variables for Production
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔧 Configuration

### Supabase Configuration
- Enable Row Level Security
- Configure storage buckets as public
- Set up edge functions for video processing
- Configure email templates (optional)

### Performance Optimization
- Enable Supabase CDN for file storage
- Configure caching headers
- Optimize images for web
- Enable gzip compression

## 🐛 Troubleshooting

### Common Issues

1. **Admin login fails**
   - Check if migration was run successfully
   - Verify admin user exists in database
   - Check password hashing

2. **File uploads fail**
   - Verify storage buckets exist and are public
   - Check file size limits
   - Ensure proper CORS configuration

3. **Real-time updates not working**
   - Check Supabase project settings
   - Verify RLS policies
   - Check browser console for errors

### Debug Mode
Set `VITE_DEBUG=true` in environment variables for detailed logging.

## 📚 API Reference

### Key Services

#### AuthService
- `login(credentials)`: Authenticate admin user
- `verifyAdmin(token)`: Verify admin token
- `createAdmin(data)`: Create new admin user

#### DevelopersService
- `getAllDevelopers()`: Fetch all developers
- `createDeveloper(data)`: Create new developer
- `updateDeveloper(id, data)`: Update developer
- `deleteDeveloper(id)`: Delete developer

#### ProjectsService
- `getAllProjects()`: Fetch all projects
- `createProject(data)`: Create new project
- `updateProject(id, data)`: Update project
- `deleteProject(id)`: Delete project

#### StorageService
- `uploadAvatar(file)`: Upload profile picture
- `uploadProjectImage(file)`: Upload project image
- `uploadProjectVideo(file)`: Upload project video
- `deleteFile(bucket, path)`: Delete file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Supabase documentation

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced SEO features
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Theme customization UI
- [ ] Bulk operations
- [ ] Export/import functionality
- [ ] Advanced file processing

---

Built with ❤️ by Muhammad Qasim & Azmat Mustafa