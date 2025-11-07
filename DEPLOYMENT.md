# Deployment Guide

This guide covers deploying your portfolio website to production with Supabase backend.

## 🚀 Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Supabase project created
- [ ] Database schema migrated
- [ ] Storage buckets created (avatars, projects, assets)
- [ ] Row Level Security policies enabled
- [ ] Edge functions deployed (optional)

### 2. Environment Variables
- [ ] Production environment variables configured
- [ ] API keys secured
- [ ] Database URLs updated

### 3. Security
- [ ] Default admin password changed
- [ ] RLS policies tested
- [ ] File upload limits configured
- [ ] CORS settings verified

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Build and Deploy
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel

# Follow the prompts to configure your project
```

#### Step 3: Configure Environment Variables
In your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

#### Step 4: Configure Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Option 2: Netlify

#### Step 1: Build the Project
```bash
npm run build
```

#### Step 2: Deploy to Netlify
1. Go to [Netlify](https://netlify.com)
2. Drag and drop the `dist` folder
3. Or connect your Git repository for automatic deployments

#### Step 3: Configure Environment Variables
In Netlify dashboard:
1. Go to Site Settings → Environment Variables
2. Add the same variables as above

#### Step 4: Configure Redirects
Create a `_redirects` file in the `public` folder:
```
/*    /index.html   200
```

### Option 3: Traditional Hosting

#### Step 1: Build the Project
```bash
npm run build
```

#### Step 2: Upload Files
Upload the contents of the `dist` folder to your web server.

#### Step 3: Configure Web Server
Ensure your web server serves `index.html` for all routes (SPA configuration).

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 🗄️ Supabase Configuration

### 1. Database Migration

Run the complete schema migration in your Supabase SQL editor:

```sql
-- Copy the entire contents of supabase/migrations/create_complete_schema.sql
-- and execute it in your Supabase project
```

### 2. Storage Buckets

Create the following storage buckets in Supabase:

1. **avatars** (Public bucket)
   - For developer profile pictures
   - Max file size: 5MB
   - Allowed types: image/*

2. **projects** (Public bucket)
   - For project images and videos
   - Max file size: 100MB
   - Allowed types: image/*, video/*

3. **assets** (Public bucket)
   - For site assets (logos, etc.)
   - Max file size: 10MB
   - Allowed types: image/*

### 3. Row Level Security Policies

Verify these RLS policies are enabled:

```sql
-- Developers: Public read, admin write
CREATE POLICY "Public read developers" ON developers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage developers" ON developers FOR ALL TO authenticated USING (is_admin());

-- Projects: Public read active, admin manage all
CREATE POLICY "Public read active projects" ON projects FOR SELECT TO anon, authenticated USING (status = 'active' OR is_admin());
CREATE POLICY "Admin manage projects" ON projects FOR ALL TO authenticated USING (is_admin());

-- Similar policies for other tables...
```

### 4. Edge Functions (Optional)

Deploy the video processing edge function:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-reference

# Deploy the edge function
supabase functions deploy video-processor
```

## 🔐 Security Configuration

### 1. Change Default Admin Password

**CRITICAL**: Change the default admin password immediately:

1. Login to admin panel with default credentials:
   - Username: `admin`
   - Password: `admin123`

2. Go to your Supabase SQL editor and run:
```sql
UPDATE admins 
SET password = crypt('your_new_secure_password', gen_salt('bf'))
WHERE username = 'admin';
```

### 2. Configure CORS

In your Supabase project settings:
1. Go to Settings → API
2. Add your domain to CORS origins
3. Include both www and non-www versions

### 3. File Upload Security

Configure file upload limits in your storage buckets:
- Maximum file size limits
- Allowed file types
- Rate limiting (if needed)

## 📊 Performance Optimization

### 1. Enable CDN

Supabase automatically provides CDN for storage files. Ensure you're using the public URLs for optimal performance.

### 2. Image Optimization

Consider implementing image optimization:
- WebP format support
- Responsive image sizes
- Lazy loading (already implemented)

### 3. Caching Headers

Configure appropriate caching headers for static assets:
```
Cache-Control: public, max-age=31536000, immutable
```

## 🔍 Monitoring and Analytics

### 1. Supabase Dashboard

Monitor your application through the Supabase dashboard:
- Database performance
- Storage usage
- API requests
- Error logs

### 2. Application Monitoring

Consider adding monitoring tools:
- Error tracking (Sentry)
- Performance monitoring
- User analytics

### 3. Audit Logs

The application includes built-in audit logging. Monitor admin actions through the admin panel.

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Redeploy after adding variables
   - Check variable names match exactly

2. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check RLS policies
   - Ensure migration was successful

3. **File Upload Failures**
   - Check storage bucket permissions
   - Verify CORS configuration
   - Check file size limits

4. **Admin Login Issues**
   - Verify admin user exists in database
   - Check password hashing
   - Ensure RLS policies allow admin access

### Debug Mode

Enable debug mode by setting:
```
VITE_DEBUG=true
```

This will provide detailed console logging for troubleshooting.

## 📋 Post-Deployment Tasks

### 1. Test All Features
- [ ] Public website loads correctly
- [ ] Admin panel login works
- [ ] File uploads function
- [ ] Real-time updates work
- [ ] All CRUD operations work
- [ ] Audit logging functions

### 2. Configure Backups
- [ ] Database backups enabled in Supabase
- [ ] Storage backups configured
- [ ] Regular backup testing

### 3. Set Up Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring enabled

### 4. Documentation
- [ ] Update README with production URLs
- [ ] Document any custom configurations
- [ ] Share admin credentials securely

## 🔄 Updates and Maintenance

### Updating the Application

1. **Code Updates**
   ```bash
   git pull origin main
   npm install
   npm run build
   # Deploy using your chosen method
   ```

2. **Database Updates**
   - Create new migration files
   - Test in development first
   - Apply to production database

3. **Dependency Updates**
   ```bash
   npm update
   npm audit fix
   ```

### Regular Maintenance

- Monitor storage usage
- Review audit logs
- Update dependencies
- Check for security updates
- Backup verification

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section
2. Review Supabase documentation
3. Check application logs
4. Create an issue in the repository

---

**Congratulations!** Your portfolio website is now live and ready for production use. 🎉