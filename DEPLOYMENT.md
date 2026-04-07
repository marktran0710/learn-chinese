# Deployment Guide - Learn Traditional Chinese

## 🚀 Deploy to Vercel (Easiest Method)

Vercel is the recommended hosting platform for Next.js applications. Follow these steps:

### Step 1: Push Code to GitHub

1. Create a new GitHub repository:
   - Go to [github.com/new](https://github.com/new)
   - Name it `learn-chinese` (or your preferred name)
   - Click "Create repository"

2. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/learn-chinese.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 2: Deploy on Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Click "Import from GitHub"
4. Select your `learn-chinese` repository
5. Vercel will auto-detect these settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Start Command: `npm start`
6. Click "Deploy"

### Step 3: Your Site is Live! 🎉

Your application will be deployed at:

```
https://learn-chinese.vercel.app
```

(or your custom domain if you configured one)

---

## 📱 Custom Domain (Optional)

1. In Vercel Dashboard, go to Project Settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records according to Vercel's instructions

---

## 🔧 Environment Variables (Optional)

For future backend integration, add environment variables in Vercel:

1. Go to Project Settings → Environment Variables
2. Add variables:
   - `NEXT_PUBLIC_API_URL` = your API endpoint
   - `MONGODB_URI` = your database connection string

---

## 📊 Monitoring & Analytics

After deployment, you can:

- View analytics in Vercel Dashboard
- Monitor performance metrics
- Check build logs
- Set up alerts

---

## 🔄 Continuous Deployment

Every time you push to the `main` branch:

1. Vercel automatically detects changes
2. Starts a new build
3. Tests the application
4. Deploys automatically if successful

To disable auto-deploy:

- Go to Project Settings → Git
- Uncheck "Automatic Deployments"

---

## 📝 Local Testing Before Deploy

Always test locally before pushing:

```bash
# Development
npm run dev
# Visit http://localhost:3000

# Production build test
npm run build
npm start
# Visit http://localhost:3000
```

---

## ❌ Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel Dashboard
2. Clear build cache: Project Settings → Advanced → Clear Build Cache
3. Redeploy

### Application won't load

- Check browser console for errors
- Check Vercel function logs
- Ensure all environment variables are set

### Performance issues

- Enable Vercel Analytics
- Optimize images using Next.js Image component
- Check for large dependencies

---

## 🎯 Alternative Deployment Options

### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Deploy

### Railway

1. Create account at [railway.app](https://railway.app)
2. Connect GitHub
3. Deploy

### Self-hosted (AWS, GCP, Azure, DigitalOcean)

```bash
npm run build
npm start
# Then upload to your server
```

---

## 📞 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [GitHub Pages for static exports](https://github.com/pages)

Happy deploying! 🎉
