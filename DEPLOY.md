# 🚀 HOW TO DEPLOY - STEP BY STEP

## Method 1: Vercel (Recommended - 2 minutes)

### Step 1: Upload to GitHub
1. Go to https://github.com and sign up (free)
2. Click the **"+"** button → **"New repository"**
3. Name it: `game-of-life-strata`
4. Click **"creating a new file"** or **"uploading an existing file"**
5. **Drag ALL files from this folder** into the upload area
6. Scroll down and click **"Commit changes"**

### Step 2: Deploy on Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Click **"New Project"**
4. Find your `game-of-life-strata` repository
5. Click **"Import"**
6. Click **"Deploy"** (don't change any settings!)
7. Wait 30-60 seconds
8. **DONE!** Click the URL to see your site

Your site will be at: `game-of-life-strata.vercel.app`

---

## Method 2: Netlify Drop (Fastest - 1 minute)

1. Go to https://app.netlify.com/drop
2. **Drag this entire folder** onto the page
3. Wait 30 seconds
4. **DONE!** Get your URL

---

## Troubleshooting

**Problem:** Build fails on Vercel
**Solution:** Make sure ALL files are uploaded including:
- package.json
- vite.config.js
- index.html
- src/main.jsx
- src/App.jsx

**Problem:** Blank page
**Solution:** Check browser console (F12) for errors

**Problem:** Can't find repository
**Solution:** Make sure files are in the ROOT of your GitHub repo, not in a subfolder

---

## Files You Need to Upload

✅ package.json
✅ vite.config.js  
✅ index.html
✅ .gitignore
✅ README.md
✅ src/
   ✅ main.jsx
   ✅ App.jsx

**DO NOT upload:**
❌ node_modules folder (if it exists)
❌ dist folder (if it exists)

---

## After Deployment

Your site will be:
- ✅ FREE forever
- ✅ Fast worldwide (CDN)
- ✅ HTTPS secure
- ✅ Auto-updates when you push to GitHub

---

**Need help?** Check README.md or open an issue!
