# Deployment Guide - Deen Companion

## Deploying to Vercel (Recommended)

Vercel is the ideal hosting platform for this Next.js application - it's free for hobby projects and optimized for Next.js.

### Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)
3. **Supabase Project**: Have your Supabase credentials ready

### Step-by-Step Deployment

#### 1. Commit Your Changes

Before deploying, ensure all your V1 features are committed:

```bash
git add .
git commit -m "Complete V1 features for production deployment"
git push origin main
```

#### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `deen-companion`
4. Vercel will auto-detect it's a Next.js project

#### 3. Configure Environment Variables

In the Vercel project settings, add these environment variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Optional:**
- `GOOGLE_PLACES_API_KEY`: (if using Places features)

**Where to find Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy "Project URL" and "anon public" key

#### 4. Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x (specified in package.json)

#### 5. Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Vercel will provide you with a production URL (e.g., `deen-companion.vercel.app`)

#### 6. Configure Supabase Redirect URLs

After deployment, add your Vercel URL to Supabase:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL": `https://your-app.vercel.app`
3. Add to "Redirect URLs": `https://your-app.vercel.app/api/auth/callback`

### Post-Deployment

#### Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Don't forget to update Supabase redirect URLs with your custom domain

#### Automatic Deployments

Every push to `main` will automatically deploy to production. You can also:
- Create preview deployments from pull requests
- Roll back to previous deployments instantly
- View deployment logs and analytics

### Monitoring

Vercel provides:
- **Analytics**: Visit insights and page performance
- **Logs**: Real-time function and edge logs
- **Errors**: Automatic error tracking

### Environment Management

- **Production**: Environment variables in Vercel dashboard
- **Preview**: Can set separate variables for preview deployments
- **Development**: Use `.env.local` (not committed to Git)

### Troubleshooting

#### Build Fails

1. Check Vercel build logs for errors
2. Verify all dependencies are in `package.json`
3. Ensure Node version matches (20.x)
4. Test `npm run build` locally first

#### Environment Variables Not Working

1. Verify variables are set in Vercel dashboard
2. Remember: Client-side variables need `NEXT_PUBLIC_` prefix
3. Redeploy after adding/changing variables

#### Supabase Connection Issues

1. Verify Supabase project is active
2. Check environment variables are correct
3. Ensure Supabase redirect URLs include Vercel domain
4. Check Supabase service status

#### API Routes Failing

1. Check function logs in Vercel dashboard
2. Verify API keys are set correctly
3. Test endpoints locally first
4. Check for CORS issues with external APIs

### Cost

**Free Tier Includes:**
- Unlimited deployments
- Automatic HTTPS
- Serverless functions
- 100GB bandwidth/month
- Analytics

This is more than sufficient for a personal/community app.

### Alternative Hosting Options

While Vercel is recommended, you can also deploy to:

#### Netlify
- Similar to Vercel, Next.js support
- Free tier available
- Requires additional configuration for server features

#### Cloudflare Pages
- Free tier with good performance
- Next.js support via adapter
- Global CDN included

#### Railway/Render
- Container-based deployment
- Free tier available
- Good for full-stack apps

**Recommendation**: Stick with Vercel for best Next.js experience and minimal configuration.

## Vercel CLI (Alternative Method)

If you prefer command-line deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts to configure project
```

## Production Checklist

Before launching to users:

- [ ] All V1 features tested and working
- [ ] Environment variables configured in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled in Vercel
- [ ] Error tracking verified
- [ ] Mobile responsiveness tested
- [ ] Performance tested (Lighthouse score)
- [ ] Security headers configured
- [ ] Database RLS policies enabled in Supabase

## Continuous Deployment Workflow

1. Make changes locally
2. Test thoroughly (`npm run dev`, `npm test`)
3. Commit to feature branch
4. Push to GitHub (creates preview deployment)
5. Review preview deployment
6. Merge to main (deploys to production automatically)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Docs: https://supabase.com/docs

