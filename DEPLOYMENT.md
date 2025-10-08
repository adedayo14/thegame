# Deployment Guide for Balloon Privilege Game

## Quick Deploy to Vercel (Recommended)

Vercel will automatically use the correct Node.js version (20.x) when deploying, even if your local machine has a different version.

### Steps:

1. **Push to GitHub**:
   ```bash
   cd balloon-privilege-game
   git add .
   git commit -m "Initial commit - Balloon Privilege Game"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and configure everything
   - Click "Deploy"
   - Done! Your game will be live in ~2 minutes

### Environment on Vercel:
- Node.js 20.x (automatically configured)
- Automatic SSL/HTTPS
- Global CDN
- Zero configuration needed

## Alternative: Deploy to Netlify

1. Push your code to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Deploy!

## Local Development (If Node 19.4.0 Issue)

If you're having Node.js version issues locally, you have options:

### Option 1: Update Node.js (Recommended)

Using nvm (Node Version Manager):
```bash
# Install nvm if you haven't
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 20
nvm install 20

# Use Node 20
nvm use 20

# Verify
node --version  # Should show v20.x.x

# Now run the dev server
cd balloon-privilege-game
npm run dev
```

### Option 2: Deploy Without Local Testing

Since Vercel uses the correct Node version, you can:
1. Make your changes
2. Commit and push to GitHub
3. Vercel automatically deploys
4. Test on the live URL

## Testing the Game

### Test Different Privilege Levels:

1. **No Privilege**:
   - Email: `jane@test.com`
   - Should see only basic instructions

2. **Network Privilege Only** (knows purple = 100pts):
   - Email: `mark@test.com`
   - Should see purple balloon tip

3. **Opportunity Privilege Only** (practice round):
   - Email: `hannah@test.org`
   - Should get practice round first

4. **Both Privileges**:
   - Email: `hannah@mail.com`
   - Should get practice + purple tip

5. **Super Skills** (Round 2+):
   - Play until total score > 500
   - Balloons pop nearby balloons

6. **Slow Motion** (Round 3+):
   - Play until total score > 1500
   - Get slow-mo button

## Mobile Testing

The game is mobile-first. Test on:
- iPhone/iPad (Safari)
- Android (Chrome)
- Or use Chrome DevTools mobile emulation

## Monitoring & Analytics

### Adding Analytics (Optional):

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// In the return JSX
<body>
  {children}
  <Analytics />
</body>
```

Then install:
```bash
npm install @vercel/analytics
```

## Troubleshooting

### Build Fails on Vercel

Check:
1. `package.json` has all dependencies
2. No hardcoded localhost URLs
3. Environment variables (if any) are set in Vercel dashboard

### Game Not Responsive

- Clear browser cache
- Check if JavaScript is enabled
- Try incognito/private mode

### Balloons Not Appearing

- Check browser console for errors
- Verify canvas API support (all modern browsers support it)

## Custom Domain

On Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatic

## Performance Tips

The game is optimized, but for very high traffic:
- Vercel's free tier handles 100GB bandwidth
- Pro plan offers unlimited bandwidth
- CDN caching is automatic
- No database needed = super fast

## Data Collection (Future Enhancement)

To collect player scores for analysis:
1. Add API route: `app/api/scores/route.ts`
2. Use Vercel Postgres or similar
3. Store: email (hashed), scores, timestamps
4. Create admin dashboard to view results

Example API route:
```typescript
export async function POST(request: Request) {
  const data = await request.json();
  // Store in database
  return Response.json({ success: true });
}
```

## Security Notes

- No sensitive data stored
- Email addresses stay in browser memory only
- No authentication needed
- CORS enabled for API endpoints (if added)

## License & Usage

This is an educational tool. Feel free to:
- Modify threshold values
- Add new balloon types
- Change privilege detection logic
- Add more rounds/power-ups

---

**Ready to deploy?** Just push to GitHub and connect to Vercel. The game will be live in minutes!
