# Netlify Functions Setup Guide

> **Quick start — 27 Aug 2026.** The repo is on GitHub at
> `jaiveersingh-spareit/Site-Visit-Tools`. No Netlify site is connected yet.
> Do these six steps to get a URL. ~20 minutes.
>
> 1. netlify.com → **Add new site → Import an existing project → GitHub** →
>    pick `Site-Visit-Tools`.
> 2. In the build settings, set **Base directory** to `Internal-Tool`.
>    Leave build command and publish directory alone — `Internal-Tool/netlify.toml`
>    supplies them. Getting this wrong is why the functions won't be found.
> 3. Deploy. You get a `*.netlify.app` URL.
> 4. **Site configuration → Environment variables** → add:
>    - `SENDGRID_API_KEY` = your SendGrid key (see Step 1 below)
>    - `OPERATIONS_EMAIL` = `support@spare-it.com`
>    These live **only** here. `netlify.toml` no longer declares them — a value
>    in that file overrides the dashboard, and the empty string that used to be
>    there broke email export silently.
> 5. **Trigger deploy → Clear cache and deploy site** so the function picks up
>    the variables.
> 6. Open the URL on a phone. It must load `INTERNAL_Site_Visit_Tool_v3.html`.
>    Then run the field gate: a real floor plan, 15+ photos, and confirm the
>    export email actually arrives.
>
> **Sender verification:** the function sends from `noreply@spare-it.com`.
> That address must be a verified sender or domain in SendGrid, or every send
> fails with a 403 regardless of the key.

---

This guide covers deploying the Spare-it Site Visit Form to Netlify with email export functionality.

## Prerequisites

- Netlify account (https://netlify.com)
- SendGrid account (https://sendgrid.com) - Free tier available
- Git repository (or use Netlify's direct file upload)

---

## Step 1: Get SendGrid API Key

1. Go to https://sendgrid.com
2. Sign up for a **Free account** (100 emails/day)
3. Once logged in, go to **Settings → API Keys**
4. Click **Create API Key**
5. Give it a name: `Spare-it Site Visit`
6. Select **Full Access**
7. Copy the API key (you'll use this next)

**Important:** Never commit the API key to Git. Netlify will store it securely.

---

## Step 2: File Structure

Ensure your project has this structure:

```
Project Root/
├── INTERNAL_Site_Visit_Tool_v3.html
├── netlify.toml
├── .env.example
└── netlify/
    └── functions/
        ├── send-export.js
        └── package.json
```

All files have been created for you.

---

## Step 3: Deploy to Netlify

### Option A: Via Git (Recommended)

1. Push your project to GitHub/GitLab
2. Go to https://netlify.com and click **"New site from Git"**
3. Select your repository
4. Netlify will auto-detect the `netlify.toml` config
5. Deploy (Netlify will install dependencies from `netlify/functions/package.json`)

### Option B: Drag & Drop

1. Go to https://netlify.com
2. Drag the project folder onto the **"Deploy"** area
3. Netlify will create a site and deploy

---

## Step 4: Set Environment Variables

After deployment:

1. Go to your site's dashboard
2. Click **Site settings → Build & deploy → Environment**
3. Click **Edit variables**
4. Add these two variables:

```
SENDGRID_API_KEY = your_api_key_from_step_1
OPERATIONS_EMAIL = support@spare-it.com
```

5. Save and **redeploy** the site (changes require redeploy)

---

## Step 5: Test the Email Export

1. Open your deployed site: `https://your-site-name.netlify.app`
2. Fill in a test form with data
3. Upload a floor plan
4. Add some photos
5. Click **Export → 📧 Email to Operations**
6. Check the inbox for `support@spare-it.com` to receive the export

---

## Local Testing (Optional)

To test Netlify Functions locally:

### Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Run Locally

```bash
cd /path/to/project
netlify dev
```

This starts a local server at `http://localhost:8888` that simulates Netlify environment.

### Set Local Environment Variables

Create a file `.env` in your project root (don't commit this):

```
SENDGRID_API_KEY=your_actual_api_key_here
OPERATIONS_EMAIL=support@spare-it.com
```

The `netlify dev` command will load these automatically.

---

## Email Contents

When the export is sent, the recipient receives:

**To:** `support@spare-it.com`

**Subject:** `Site Visit Export - [Building] ([Date])`

**Attachments:**
- `Site_Visit_Summary.csv` - All site visit details
- `01_Context_*.jpg` - Context photos
- `02_FloorPlan_F*.jpg` - Annotated floor plans
- `03_Station_F*_*.jpg` - Station photos
- `04_Gateway_F*.jpg` - Gateway photos
- `05_Display_F*.jpg` - Display photos

**File Naming Convention:**
All photos maintain the standard naming scheme that matches your app's internal organization.

---

## Troubleshooting

### "Failed to send export"

**Check:**
1. API key is correct (test in SendGrid dashboard)
2. Environment variables are set in Netlify
3. You've redeployed after setting variables
4. SendGrid account is active (not suspended)

### Photos not included

**Check:**
1. Photos were actually captured in the app
2. "Photos Exported: X photos" shows in the Summary tab
3. Check browser console for errors (F12 → Console)

### Function timeout

**Note:** Large exports with many photos may take time. Netlify Functions have a 26-second timeout on free tier. If needed, upgrade to Pro tier for longer timeouts.

---

## Future Enhancements

Once this is working, you can:

- Add **PDF report generation** in the function
- Store exports in **S3/Google Drive** instead of email
- Send to **multiple recipients**
- Add **scheduled daily digests**
- Generate **compliance reports**

---

## Support

If you encounter issues:

1. Check **Netlify Function logs** in your site dashboard
2. Look at **SendGrid Activity** to see if emails were sent
3. Check browser console (F12) for client-side errors
4. Ensure `.env` is in `.gitignore` (don't commit API keys!)

---

**Status:** Ready to deploy! 🚀
