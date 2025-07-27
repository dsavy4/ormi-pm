// Storage Configuration
// This file allows easy switching between different storage providers

export interface StorageProviderConfig {
  name: string;
  type: 'r2' | 's3' | 'supabase' | 'local';
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  publicUrl?: string;
  enabled: boolean;
}

// Cloudflare R2 Configuration (Recommended)
export const r2Config: StorageProviderConfig = {
  name: 'Cloudflare R2',
  type: 'r2',
  bucket: process.env.R2_BUCKET_NAME || 'ormi-property-images',
  region: process.env.R2_REGION || 'auto',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  endpoint: process.env.R2_ENDPOINT || 'https://your-account-id.r2.cloudflarestorage.com',
  publicUrl: process.env.R2_PUBLIC_URL || 'https://your-public-domain.com',
  enabled: true,
};

// AWS S3 Configuration (Alternative)
export const s3Config: StorageProviderConfig = {
  name: 'AWS S3',
  type: 's3',
  bucket: process.env.S3_BUCKET_NAME || 'ormi-property-images',
  region: process.env.S3_REGION || 'us-east-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  publicUrl: process.env.S3_PUBLIC_URL || 'https://your-bucket.s3.amazonaws.com',
  enabled: false,
};

// Supabase Storage Configuration (Alternative)
export const supabaseConfig: StorageProviderConfig = {
  name: 'Supabase Storage',
  type: 'supabase',
  bucket: process.env.SUPABASE_BUCKET_NAME || 'property-images',
  region: process.env.SUPABASE_REGION || 'us-east-1',
  accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY || '',
  endpoint: process.env.SUPABASE_ENDPOINT || 'https://your-project.supabase.co',
  publicUrl: process.env.SUPABASE_PUBLIC_URL || 'https://your-project.supabase.co/storage/v1/object/public',
  enabled: false,
};

// Local Storage Configuration (Development)
export const localConfig: StorageProviderConfig = {
  name: 'Local Storage',
  type: 'local',
  bucket: 'uploads',
  region: 'local',
  accessKeyId: '',
  secretAccessKey: '',
  publicUrl: process.env.LOCAL_STORAGE_URL || 'http://localhost:3000/uploads',
  enabled: false,
};

// Get the active storage configuration
export function getActiveStorageConfig(): StorageProviderConfig {
  const storageProvider = process.env.STORAGE_PROVIDER || 'r2';
  
  switch (storageProvider.toLowerCase()) {
    case 'r2':
      return r2Config;
    case 's3':
      return s3Config;
    case 'supabase':
      return supabaseConfig;
    case 'local':
      return localConfig;
    default:
      return r2Config; // Default to R2
  }
}

// Get all available storage configurations
export function getAllStorageConfigs(): StorageProviderConfig[] {
  return [r2Config, s3Config, supabaseConfig, localConfig];
}

// Validate storage configuration
export function validateStorageConfig(config: StorageProviderConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.bucket) {
    errors.push('Bucket name is required');
  }

  if (!config.accessKeyId) {
    errors.push('Access key ID is required');
  }

  if (!config.secretAccessKey) {
    errors.push('Secret access key is required');
  }

  if (!config.publicUrl) {
    errors.push('Public URL is required');
  }

  if (config.type === 'r2' && !config.endpoint) {
    errors.push('R2 endpoint is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Environment variables documentation
export const STORAGE_ENV_VARS = {
  // Storage Provider Selection
  STORAGE_PROVIDER: 'r2|s3|supabase|local - Choose storage provider (default: r2)',
  
  // Cloudflare R2
  R2_BUCKET_NAME: 'R2 bucket name for storing images',
  R2_REGION: 'R2 region (usually "auto")',
  R2_ACCESS_KEY_ID: 'R2 access key ID',
  R2_SECRET_ACCESS_KEY: 'R2 secret access key',
  R2_ENDPOINT: 'R2 endpoint URL',
  R2_PUBLIC_URL: 'Public URL for accessing R2 files',
  
  // AWS S3
  S3_BUCKET_NAME: 'S3 bucket name for storing images',
  S3_REGION: 'S3 region (e.g., us-east-1)',
  S3_ACCESS_KEY_ID: 'S3 access key ID',
  S3_SECRET_ACCESS_KEY: 'S3 secret access key',
  S3_PUBLIC_URL: 'Public URL for accessing S3 files',
  
  // Supabase Storage
  SUPABASE_BUCKET_NAME: 'Supabase bucket name',
  SUPABASE_REGION: 'Supabase region',
  SUPABASE_ACCESS_KEY_ID: 'Supabase access key ID',
  SUPABASE_SECRET_ACCESS_KEY: 'Supabase secret access key',
  SUPABASE_ENDPOINT: 'Supabase endpoint URL',
  SUPABASE_PUBLIC_URL: 'Public URL for accessing Supabase files',
  
  // Local Storage
  LOCAL_STORAGE_URL: 'Local storage public URL (for development)',
}; 