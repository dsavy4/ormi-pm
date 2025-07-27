# 🚀 Cloudflare R2 Storage Configuration Guide

This guide shows you how to configure Cloudflare R2 storage for the ORMI Property Management system.

## 🎯 **Cloudflare R2 - Our Storage Solution**

Cloudflare R2 is our exclusive storage solution because it's:
- ✅ **S3-compatible** - Easy to use with existing AWS SDK
- ✅ **Cost-effective** - No egress fees
- ✅ **Fast** - Global CDN with edge locations worldwide
- ✅ **Integrated** - Works seamlessly with our Cloudflare infrastructure
- ✅ **Secure** - Enterprise-grade security
- ✅ **Scalable** - Handles unlimited storage needs

---

## 🚀 **Setup Instructions**

### **Step 1: Create Cloudflare R2 Bucket**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Name it `ormi-property-images`
5. Choose your preferred region (auto is recommended for global performance)

### **Step 2: Create API Token**

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use **Custom token** template
4. Add these permissions:
   - **Cloudflare R2:Edit** (for bucket access)
   - **Zone:Read** (for public access)
5. Save the token securely

### **Step 3: Configure Environment Variables**

Add these to your `.env` file:

```bash
# Storage Provider (Cloudflare R2)
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
4. Configure your custom domain for better performance

---

## 🔧 **Storage Service Features**

### **Automatic Configuration**

The storage service automatically detects your Cloudflare R2 configuration:

```typescript
import { storageService, getActiveStorageConfig } from '../utils/storage';

// Get current configuration
const config = getActiveStorageConfig();
console.log(`Using Cloudflare R2: ${config.name}`);

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

---

## 📁 **File Organization**

Files are organized by type and ID for optimal performance:

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

profiles/
├── managers/
├── tenants/
└── ...
```

---

## 🔒 **Security Features**

- ✅ **Access Control** - Only authenticated users can upload
- ✅ **File Validation** - Only allowed file types (images, PDFs, etc.)
- ✅ **Size Limits** - 10MB per file
- ✅ **Virus Scanning** - Optional integration with Cloudflare
- ✅ **Backup** - Automatic versioning and redundancy
- ✅ **Encryption** - End-to-end encryption
- ✅ **CORS Protection** - Configured for secure cross-origin requests

---

## 📊 **Performance Optimization**

- ✅ **Global CDN** - 200+ edge locations worldwide
- ✅ **Image Optimization** - Automatic resizing and compression
- ✅ **Lazy Loading** - Frontend optimization
- ✅ **Compression** - Automatic file compression
- ✅ **Cache Headers** - 1-year cache headers for static assets
- ✅ **Edge Computing** - Process files at the edge

---

## 🚨 **Troubleshooting**

### **Upload Fails**

1. Check your R2 API credentials
2. Verify bucket permissions
3. Ensure bucket exists
4. Check network connectivity
5. Verify environment variables

### **Images Not Loading**

1. Verify public URL configuration
2. Check CORS settings in R2
3. Ensure files are public
4. Test direct URL access
5. Check CDN cache

### **Performance Issues**

1. Verify region selection (auto is recommended)
2. Check CDN cache settings
3. Optimize image sizes before upload
4. Use presigned URLs for large files
5. Monitor bandwidth usage

---

## 🎉 **Ready to Go!**

Your Cloudflare R2 storage is now configured and ready for the best-in-class property management system!

**Benefits of Cloudflare R2:**
- 🚀 **Global Performance** - 200+ edge locations
- 💰 **Cost Effective** - No egress fees
- 🔒 **Enterprise Security** - SOC 2 compliant
- 📈 **Scalable** - Unlimited storage
- 🔧 **Easy Integration** - S3-compatible API

**Next Steps:**
1. Test image uploads
2. Configure your custom domain
3. Set up monitoring
4. Enjoy fast, reliable, and secure file storage! 🚀 