# AWS & Google Drive Setup Guide

This guide will walk you through setting up all the required services for the AI Image Analyzer application.

---

## 📋 Prerequisites

- AWS Account (Free tier eligible)
- Google Account (for Google Drive API)
- Node.js 18+ installed locally

---

## 1️⃣ AWS Setup

### Step 1: Create an AWS Account
1. Go to [https://aws.amazon.com/](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Complete the registration process (credit card required, but we'll use free tier)

### Step 2: Create an IAM User
1. Sign in to AWS Console
2. Go to **IAM** (Identity and Access Management)
3. Click **Users** → **Create user**
4. User name: `image-analyzer-user`
5. Select **Programmatic access**
6. Click **Next: Permissions**

### Step 3: Attach Policies
Attach the following policies to your user:
- `AmazonS3FullAccess`
- `AmazonRekognitionFullAccess`

### Step 4: Get Access Keys
1. After creating the user, go to **Security credentials** tab
2. Click **Create access key**
3. Choose **Application running outside AWS**
4. **Save these credentials** (you'll need them for `.env.local`):
   - Access Key ID
   - Secret Access Key

### Step 5: Create an S3 Bucket
1. Go to **S3** service in AWS Console
2. Click **Create bucket**
3. **Bucket name**: `ai-image-analyzer-YOUR_NAME` (must be globally unique)
4. **Region**: Choose `us-east-1` (or your preferred region)
5. **Block all public access**: Uncheck this (we need public access for images)
   - ⚠️ Acknowledge the warning
6. Click **Create bucket**

### Step 6: Configure S3 Bucket CORS
1. Click on your bucket name
2. Go to **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit** and paste:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

5. Click **Save changes**

### Step 7: AWS Rekognition Region
- Rekognition is available in specific regions
- Recommended: `us-east-1`, `us-west-2`, `eu-west-1`
- Make sure your `.env.local` uses a supported region

---

## 2️⃣ Google Drive API Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. **Project name**: `AI Image Analyzer`
4. Click **Create**

### Step 2: Enable Google Drive API
1. In the project, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and click **Enable**

### Step 3: Create API Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. **Copy the API key** (you'll need this for `.env.local`)
4. (Optional) Click **Restrict Key**:
   - Under **API restrictions**, select **Restrict key**
   - Choose **Google Drive API**
   - Click **Save**

### Step 4: Test Your Setup
Create a test Google Drive folder:
1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder
3. Add 2-3 test images
4. Right-click the folder → **Share** → **Get link**
5. Set to **Anyone with the link can view**
6. Copy the link (looks like: `https://drive.google.com/drive/folders/XXXXX`)

---

## 3️⃣ Environment Variables Configuration

Open your `.env.local` file and fill in the values:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=AKIA... (from Step 1.4)
AWS_SECRET_ACCESS_KEY=your_secret_key (from Step 1.4)
AWS_REGION=us-east-1 (from Step 1.5)
AWS_S3_BUCKET_NAME=ai-image-analyzer-YOUR_NAME (from Step 1.5)

# AWS Rekognition
AWS_REKOGNITION_COLLECTION_ID=faces-collection

# Google Drive API
GOOGLE_DRIVE_API_KEY=AIzaSy... (from Step 2.3)

# App Configuration
NODE_ENV=development
```

---

## 4️⃣ Verify Setup

### Test Locally
```bash
cd aws-rekog-t2
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

### Test Upload
1. Go to the upload page
2. Paste your Google Drive folder link
3. Click "Process & Upload Images"
4. Check the console for logs

### Verify in AWS Console
1. **S3 Bucket**: Should have `images/` and `metadata/` folders
2. **Rekognition Collections**: Run this to verify:
   - Go to **AWS CLI** or use the app's first upload

---

## 5️⃣ Cost Monitoring (Important!)

### Set Up Billing Alerts
1. Go to **AWS Billing Dashboard**
2. Click **Budgets** → **Create budget**
3. Choose **Zero spend budget** or set to **$5**
4. Add your email for alerts

### Free Tier Limits
- **S3**: 5GB storage, 20,000 GET requests/month (12 months)
- **Rekognition**: 5,000 images/month (12 months)
- **Data Transfer**: 100GB/month outbound

### Monitor Usage
- Check **AWS Billing → Free Tier Usage** regularly
- For this internship project with ~50-100 images, cost should be **$0**

---

## 6️⃣ Troubleshooting

### Error: "Access Denied" on S3
- Check IAM permissions include `AmazonS3FullAccess`
- Verify bucket name in `.env.local` matches AWS

### Error: "Invalid Google Drive URL"
- Make sure the folder is set to "Anyone with the link can view"
- URL must contain `/folders/` or `id=`

### Error: "Rekognition not available"
- Check your region supports Rekognition
- Switch to `us-east-1` if needed

### Error: "Sharp module not found"
- Run: `npm install sharp --legacy-peer-deps`

---

## 7️⃣ Security Best Practices

### ✅ Do:
- Never commit `.env.local` to Git (already in `.gitignore`)
- Use IAM users instead of root credentials
- Regularly rotate access keys
- Set up CloudWatch alerts

### ❌ Don't:
- Share your AWS access keys
- Commit API keys to GitHub
- Leave S3 bucket fully public for production
- Use root AWS account for daily operations

---

## 8️⃣ Deployment Checklist

Before deploying to Vercel/Render:

- [ ] All environment variables set in deployment platform
- [ ] S3 bucket created and configured
- [ ] IAM user has correct permissions
- [ ] Google Drive API key is restricted to your domain
- [ ] Billing alerts configured
- [ ] Test with sample images

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs (`npm run dev` output)
3. Verify all environment variables are set correctly
4. Check AWS CloudWatch logs

---

## 🎉 You're Ready!

Once all steps are complete, your application should:
- ✅ Fetch images from Google Drive
- ✅ Compress large images
- ✅ Analyze with AWS Rekognition
- ✅ Store in S3
- ✅ Display in gallery with all features

Happy coding! 🚀
