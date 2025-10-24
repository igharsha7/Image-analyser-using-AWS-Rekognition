# 🎨 AI Image Analyzer

A professional web application that processes images from Google Drive using AWS Rekognition for intelligent analysis, featuring face detection, label recognition, and secure cloud storage.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![AWS](https://img.shields.io/badge/AWS-Rekognition%20%7C%20S3-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🖼️ Image Processing Pipeline
- **Google Drive Integration**: Fetch images from public folder links (including subfolders)
- **Smart Compression**: Automatically compress images >40MB to ~10MB using Sharp
- **AWS Rekognition Analysis**:
  - 🏷️ Label Detection (objects, scenes, concepts)
  - 👤 Face Detection with attributes (age, gender, emotions)
  - 🔍 Face Indexing for recognition across images
- **Cloud Storage**: Secure S3 storage with signed URLs

### 🎯 Gallery Features
- **Smart Search**: Search by labels or image ID
- **Advanced Filtering**: 
  - Multi-select label filters
  - Filter by face presence
  - Real-time search
- **Face Analysis Visualization**:
  - Bounding box overlays
  - Age range and gender detection
  - Emotion recognition
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- AWS Account (free tier eligible)
- Google Account (for Drive API)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd aws-rekog-t2
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see [SETUP_GUIDE.md](./SETUP_GUIDE.md))

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
aws-rekog-t2/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── upload/route.ts      # Image upload & processing
│   │   └── images/route.ts      # Fetch processed images
│   ├── gallery/                  # Gallery page
│   └── page.tsx                  # Upload page
├── components/                   # React components
│   ├── upload-page.tsx          # Upload UI
│   ├── gallery-page.tsx         # Gallery UI
│   └── ui/                       # shadcn/ui components
├── lib/                          # Backend services
│   ├── services/
│   │   ├── googleDrive.ts       # Google Drive API
│   │   ├── compression.ts       # Image compression
│   │   ├── s3.ts                # AWS S3 operations
│   │   └── rekognition.ts       # AWS Rekognition
│   ├── config.ts                # Service initialization
│   └── utils.ts                 # Utility functions
├── .env.local                    # Environment variables (create this)
├── .env.example                  # Example env file
├── SETUP_GUIDE.md               # Detailed setup instructions
└── README.md                     # This file
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | ✅ |
| `AWS_REGION` | AWS region (e.g., us-east-1) | ✅ |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | ✅ |
| `AWS_REKOGNITION_COLLECTION_ID` | Face collection ID | Optional |
| `GOOGLE_DRIVE_API_KEY` | Google Drive API key | ✅ |

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

---

## 📊 API Documentation

### POST `/api/upload`
Upload and process images from Google Drive.

**Request:**
```json
{
  "folderUrl": "https://drive.google.com/drive/folders/XXXXX"
}
```

**Response:**
```json
{
  "success": true,
  "processedCount": 5,
  "message": "Successfully processed 5 images from the folder"
}
```

### GET `/api/images`
Retrieve all processed images with metadata.

---

## 💰 Cost Estimation

### AWS Free Tier (12 months)
- **S3**: 5GB storage, 20,000 GET requests/month
- **Rekognition**: 5,000 images/month
- **Data Transfer**: 100GB/month

### Estimated Cost for 100 Images
- Storage: ~500MB → **$0.00** (within free tier)
- Rekognition: 100 images → **$0.00** (within free tier)
- **Total: $0.00** ✅

**Note**: Set up billing alerts to monitor usage!

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Image Processing**: Sharp
- **AWS Services**: S3, Rekognition
- **APIs**: Google Drive API v3

---

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting tips.

---

## 👨‍💻 Author

Created as part of an internship project demonstrating cloud services integration, modern web development, and AI/ML integration.

---

**Built with ❤️ using Next.js, AWS, and modern web technologies**
