# Production Deployment Guide

## Prerequisites
- Node.js 16+ (recommended: Node.js 18 or higher)
- npm or yarn package manager

## Step 1: Fix Dependencies
The project currently has React 19 which is incompatible with Blueprint.js v3. The package.json has been updated to use React 18.

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

## Step 2: Build for Production

### Option A: Static Build (Most Common)
```bash
# Build the production bundle
npm run build

# The build folder will contain optimized static files
# Serve the build folder using any static file server
```

### Option B: Serve Locally for Testing
```bash
# Install a static file server
npm install -g serve

# Serve the built files
serve -s build -l 3000
```

## Step 3: Deploy to Production

### Netlify
1. Drag and drop the `build` folder to Netlify
2. Or connect your git repository for automatic deployments

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Traditional Server (Apache/Nginx)
1. Copy contents of `build` folder to your web server directory
2. Configure your web server to serve the `index.html` for all routes (SPA routing)

#### Nginx Configuration Example:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/build/folder;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache Configuration Example:
Create `.htaccess` in build folder:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```

### AWS S3 + CloudFront
1. Upload build folder contents to S3 bucket
2. Enable static website hosting
3. Set up CloudFront distribution for CDN

### Docker Deployment
```dockerfile
# Dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Variables for Production

Create `.env.production` file:
```env
REACT_APP_API_URL=https://your-production-api.com/apis
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
GENERATE_SOURCEMAP=false
```

## Performance Optimizations

1. **Enable compression** in your web server
2. **Set proper cache headers** for static assets
3. **Use HTTPS** for production
4. **Monitor bundle size** with webpack-bundle-analyzer:
   ```bash
   npm install --save-dev webpack-bundle-analyzer
   npm run build
   npx webpack-bundle-analyzer build/static/js/*.js
   ```

## Health Check

After deployment, verify:
- [ ] App loads without console errors
- [ ] All routes work properly
- [ ] API calls use production endpoints
- [ ] Payment integration works with live keys
- [ ] All dialogs and modals function correctly

## Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Clear node_modules and reinstall
- Fix TypeScript errors before building

### Runtime Errors
- Check browser console for errors
- Verify environment variables are set
- Ensure API endpoints are accessible

### Performance Issues
- Use React DevTools Profiler
- Analyze bundle size
- Implement code splitting if needed