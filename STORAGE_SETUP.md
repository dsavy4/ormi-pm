# 🚀 Storage Configuration Guide

This guide shows you how to configure different storage providers for the ORMI Property Management system.

## 🎯 **Recommended: Cloudflare R2**

Cloudflare R2 is our recommended storage solution because it's:
- ✅ **S3-compatible** - Easy to use with existing AWS SDK
- ✅ **Cost-effective** - No egress fees
- ✅ **Fast** - Global CDN
- ✅ **Integrated** - Works seamlessly with our Cloudflare infrastructure

### **Step 1: Create Cloudflare R2 Bucket**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Name it `ormi-property-images`
5. Choose your preferred region

### **Step 2: Create API Token**

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use **Custom token** template
4. Add these permissions:
   - **Cloudflare R2:Edit** (for bucket access)
   - **Zone:Read** (for public access)
5. Save the token

### **Step 3: Configure Environment Variables**

Add these to your `.env` file:

```bash
# Storage Provider
STORAGE_PROVIDER="r2"

# Cloudflare R2 Configuration
R2_BUCKET_NAME="ormi-property-images"
R2_REGION="auto"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
R2_PUBLIC_URL="https://your-public-domain.com"
```

### **Step 4: Set Up Public Access (Optional)**

For direct public access to images:

1. Go to your R2 bucket
2. Click **Settings** → **Public Access**
3. Enable **Public Access**
4. Configure your custom domain

## 🔄 **Alternative Storage Providers**

### **AWS S3**

```bash
STORAGE_PROVIDER="s3"
S3_BUCKET_NAME="ormi-property-images"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-s3-access-key-id"
S3_SECRET_ACCESS_KEY="your-s3-secret-access-key"
S3_PUBLIC_URL="https://your-bucket.s3.amazonaws.com"
```

### **Supabase Storage**

```bash
STORAGE_PROVIDER="supabase"
SUPABASE_BUCKET_NAME="property-images"
SUPABASE_REGION="us-east-1"
SUPABASE_ACCESS_KEY_ID="your-supabase-access-key-id"
SUPABASE_SECRET_ACCESS_KEY="your-supabase-secret-access-key"
SUPABASE_ENDPOINT="https://your-project.supabase.co"
SUPABASE_PUBLIC_URL="https://your-project.supabase.co/storage/v1/object/public"
```

### **Local Storage (Development)**

```bash
STORAGE_PROVIDER="local"
LOCAL_STORAGE_URL="http://localhost:3000/uploads"
```

## 🔧 **Storage Service Features**

### **Automatic Configuration**

The storage service automatically detects your configuration:

```typescript
import { storageService, getActiveStorageConfig } from '../utils/storage';

// Get current configuration
const config = getActiveStorageConfig();
console.log(`Using ${config.name}`);

// Upload file
const result = await storageService.uploadFile(
  fileBuffer,
  'property-image.jpg',
  'image/jpeg',
  'properties/123'
);
```

### **Direct Upload Support**

For better performance, you can use presigned URLs:

```typescript
// Generate presigned URL
const { uploadUrl, publicUrl } = await storageService.generatePresignedUrl(
  'image.jpg',
  'image/jpeg',
  'properties/123'
);

// Upload directly from frontend
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});
```

### **Easy Provider Switching**

Change storage providers without code changes:

```bash
# Switch to S3
STORAGE_PROVIDER="s3"

# Switch to Supabase
STORAGE_PROVIDER="supabase"

# Switch back to R2
STORAGE_PROVIDER="r2"
```

## 📁 **File Organization**

Files are organized by type and ID:

```
properties/
├── 123/
│   ├── 1703123456789-image1.jpg
│   ├── 1703123456790-image2.jpg
│   └── 1703123456791-image3.jpg
├── 456/
│   ├── 1703123456792-image1.jpg
│   └── 1703123456793-image2.jpg
└── ...

maintenance/
├── 789/
│   ├── 1703123456794-issue1.jpg
│   └── 1703123456795-issue2.jpg
└── ...

documents/
├── leases/
├── contracts/
└── ...
```

## 🔒 **Security Features**

- ✅ **Access Control** - Only authenticated users can upload
- ✅ **File Validation** - Only images allowed
- ✅ **Size Limits** - 10MB per file
- ✅ **Virus Scanning** - Optional integration
- ✅ **Backup** - Automatic versioning

## 📊 **Performance Optimization**

- ✅ **CDN Caching** - 1-year cache headers
- ✅ **Image Optimization** - Automatic resizing
- ✅ **Lazy Loading** - Frontend optimization
- ✅ **Compression** - Automatic file compression

## 🚨 **Troubleshooting**

### **Upload Fails**

1. Check your API credentials
2. Verify bucket permissions
3. Ensure bucket exists
4. Check network connectivity

### **Images Not Loading**

1. Verify public URL configuration
2. Check CORS settings
3. Ensure files are public
4. Test direct URL access

### **Switch Providers**

1. Update environment variables
2. Restart the application
3. Test with a small file
4. Verify configuration

## 🎉 **Ready to Go!**

Your storage is now configured and ready for the best-in-class property management system!

**Next Steps:**
1. Test image uploads
2. Configure your domain
3. Set up monitoring
4. Enjoy fast, reliable file storage! 🚀 