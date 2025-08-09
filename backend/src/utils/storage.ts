import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Storage configuration
export interface StorageConfig {
  provider: 'r2' | 's3' | 'supabase';
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  publicUrl?: string;
}

// Default R2 configuration - will be overridden with actual env vars
const defaultConfig: StorageConfig = {
  provider: 'r2',
  bucket: 'ormi-storage',
  region: 'auto',
  accessKeyId: '',
  secretAccessKey: '',
  endpoint: 'https://475a121e52d9057d0e99c52062f3b6e5.r2.cloudflarestorage.com',
  publicUrl: 'https://cdn.ormi.com',
};

class StorageService {
  private config: StorageConfig;
  private s3Client: S3Client;

  constructor(config: StorageConfig = defaultConfig) {
    this.config = config;
    this.s3Client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      endpoint: this.config.endpoint,
      forcePathStyle: false, // R2 uses virtual-hosted style
      // Additional R2-specific configuration
      maxAttempts: 3,
      retryMode: 'adaptive',
    });
  }

  /**
   * Upload a file to storage with account-based path
   */
  async uploadFile(
    file: Uint8Array | Buffer,
    fileName: string,
    contentType: string,
    accountPath: string
  ): Promise<{ url: string; key: string }> {
    try {
      const key = `${accountPath}/${Date.now()}-${fileName}`;
      
      // Convert Buffer to Uint8Array if needed (Buffer not available in Workers)
      const fileData = file && typeof file === 'object' && 'buffer' in file ? new Uint8Array(file) : file;
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: fileData,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000', // 1 year cache
      });

      console.log('[DEBUG] Sending R2 upload command...');
      const result = await this.s3Client.send(command);
      console.log('[DEBUG] R2 upload result:', result);

      // Return only the key (relative path) - let frontend construct full URL
      console.log('[DEBUG] Generated key:', key);
      
      return {
        url: key, // Store only the relative path
        key: key,
      };
    } catch (error) {
      console.error('Storage upload error:', error);
      console.error('Storage config:', {
        bucket: this.config.bucket,
        region: this.config.region,
        endpoint: this.config.endpoint,
        publicUrl: this.config.publicUrl,
        hasAccessKey: !!this.config.accessKeyId,
        hasSecretKey: !!this.config.secretAccessKey
      });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload file to storage: ${errorMessage}`);
    }
  }

  /**
   * Upload team member avatar to storage with account-based path
   */
  async uploadTeamMemberAvatar(
    file: Buffer,
    fileName: string,
    contentType: string,
    accountId: string,
    teamMemberId: string
  ): Promise<{ url: string; key: string }> {
    try {
      const key = `${accountId}/team/avatars/${teamMemberId}/${Date.now()}-${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000', // 1 year cache
      });

      await this.s3Client.send(command);

      // Return the public URL
      const publicUrl = `${this.config.publicUrl}/${key}`;
      
      return {
        url: publicUrl,
        key: key,
      };
    } catch (error) {
      console.error('Team member avatar upload error:', error);
      throw new Error('Failed to upload team member avatar to storage');
    }
  }

  /**
   * Generate presigned URL for team member avatar upload
   */
  async generateTeamMemberAvatarUploadUrl(
    fileName: string,
    contentType: string,
    teamMemberId: string,
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    try {
      const key = `team-avatars/${teamMemberId}/${Date.now()}-${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      const publicUrl = `${this.config.publicUrl}/${key}`;

      return {
        uploadUrl,
        key,
        publicUrl,
      };
    } catch (error) {
      console.error('Team member avatar presigned URL generation error:', error);
      throw new Error('Failed to generate team member avatar upload URL');
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Storage delete error:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Generate a presigned URL for direct uploads
   */
  async generatePresignedUrl(
    fileName: string,
    contentType: string,
    folder: string = 'uploads',
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    try {
      const key = `${folder}/${Date.now()}-${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      const publicUrl = `${this.config.publicUrl}/${key}`;

      return {
        uploadUrl,
        key,
        publicUrl,
      };
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Get the storage configuration
   */
  getConfig(): StorageConfig {
    return { ...this.config };
  }

  /**
   * Update storage configuration
   */
  updateConfig(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.s3Client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      endpoint: this.config.endpoint,
      forcePathStyle: false,
    });
  }
}

// R2 Storage Service for Cloudflare Workers (uses R2 binding directly)
class R2StorageService extends StorageService {
  private r2Bucket: any;
  private publicUrl: string;

  constructor(r2Bucket: any, publicUrl: string) {
    // Call parent constructor with empty config (we won't use S3Client)
    super({
      provider: 'r2',
      bucket: 'ormi-storage',
      region: 'auto',
      accessKeyId: '',
      secretAccessKey: '',
      endpoint: '',
      publicUrl: publicUrl,
    });
    this.r2Bucket = r2Bucket;
    this.publicUrl = publicUrl;
  }

  /**
   * Override uploadFile to use R2 binding directly
   */
  async uploadFile(
    file: Uint8Array | Buffer,
    fileName: string,
    contentType: string,
    accountPath: string
  ): Promise<{ url: string; key: string }> {
    try {
      const key = `${accountPath}/${Date.now()}-${fileName}`;
      
      // Convert Buffer to Uint8Array if needed (Buffer not available in Workers)
      const fileData = file && typeof file === 'object' && 'buffer' in file ? new Uint8Array(file) : file;
      
      // Use the R2 binding directly
      await this.r2Bucket.put(key, fileData, {
        httpMetadata: {
          contentType: contentType,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        }
      });

      console.log('[DEBUG] File uploaded to R2 successfully:', key);
      
      return {
        url: `${this.publicUrl}/${key}`, // Return the full public URL for frontend display
        key: key,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Override deleteFile to use R2 binding directly
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.r2Bucket.delete(key);
      console.log('[DEBUG] File deleted from R2:', key);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw new Error(`Failed to delete file from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Override generatePresignedUrl to use R2 binding
   */
  async generatePresignedUrl(
    fileName: string,
    contentType: string,
    folder: string = 'uploads',
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    try {
      const key = `${folder}/${Date.now()}-${fileName}`;
      
      // Generate presigned URL using R2 binding
      const uploadUrl = await this.r2Bucket.createMultipartUpload(key, {
        httpMetadata: {
          contentType: contentType,
          cacheControl: 'public, max-age=31536000',
        }
      });

      const publicUrl = `${this.publicUrl}/${key}`;

      return {
        uploadUrl: uploadUrl.uploadId, // This is simplified - R2 binding might have different API
        key,
        publicUrl,
      };
    } catch (error) {
      console.error('R2 presigned URL generation error:', error);
      throw new Error('Failed to generate upload URL');
    }
  }
}

// Create storage service with Cloudflare Worker environment variables
export function createStorageService(env: any): StorageService {
  console.log('[DEBUG] Creating storage service with env:', {
    hasR2BucketName: !!env.R2_BUCKET_NAME,
    r2BucketNameType: typeof env.R2_BUCKET_NAME,
    r2BucketNameValue: env.R2_BUCKET_NAME,
    hasR2AccessKey: !!env.R2_ACCESS_KEY_ID,
    hasR2SecretKey: !!env.R2_SECRET_ACCESS_KEY,
    hasR2Endpoint: !!env.R2_ENDPOINT,
    hasR2PublicUrl: !!env.R2_PUBLIC_URL,
    r2PublicUrlValue: env.R2_PUBLIC_URL,
    // Log all available env keys for debugging
    availableKeys: Object.keys(env).filter(key => key.startsWith('R2_'))
  });
  
  // In Cloudflare Workers, R2 bindings are objects, not strings
  // We need to use the bucket name directly
  let bucketName = 'ormi-storage'; // Default fallback
  
  if (env.R2_BUCKET_NAME) {
    if (typeof env.R2_BUCKET_NAME === 'object' && env.R2_BUCKET_NAME.name) {
      bucketName = env.R2_BUCKET_NAME.name;
    } else if (typeof env.R2_BUCKET_NAME === 'string') {
      bucketName = env.R2_BUCKET_NAME;
    }
  }
  
  console.log('[DEBUG] R2 bucket configuration:', {
    bucketBinding: env.R2_BUCKET_NAME,
    bucketBindingType: typeof env.R2_BUCKET_NAME,
    finalBucketName: bucketName
  });
  
  // For Cloudflare Workers, we can use the R2 binding directly
  // The S3Client approach might not work properly in the worker environment
  if (env.R2_BUCKET_NAME && typeof env.R2_BUCKET_NAME === 'object') {
    console.log('[DEBUG] Using R2 binding directly for Cloudflare Workers');
    // Return a simplified storage service that uses the R2 binding
    return new R2StorageService(env.R2_BUCKET_NAME, env.R2_PUBLIC_URL || 'https://cdn.ormi.com');
  }
  
  // Fallback to S3Client approach (for development/testing)
  console.log('[DEBUG] Using S3Client approach (fallback)');
  
  // Check if R2 credentials are available
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    console.error('[DEBUG] Missing R2 credentials:', {
      hasAccessKey: !!env.R2_ACCESS_KEY_ID,
      hasSecretKey: !!env.R2_SECRET_ACCESS_KEY,
      availableKeys: Object.keys(env).filter(key => key.startsWith('R2_'))
    });
    throw new Error('R2 credentials are not properly configured. Please check your Cloudflare Worker secrets.');
  }
  
  // Check if R2 endpoint is available
  if (!env.R2_ENDPOINT) {
    console.error('[DEBUG] Missing R2 endpoint. Available keys:', Object.keys(env).filter(key => key.startsWith('R2_')));
    // Use the correct default endpoint format for Cloudflare R2
    const defaultEndpoint = 'https://475a121e52d9057d0e99c52062f3b6e5.r2.cloudflarestorage.com';
    console.log('[DEBUG] Using default R2 endpoint:', defaultEndpoint);
    env.R2_ENDPOINT = defaultEndpoint;
  }
  
  const config: StorageConfig = {
    provider: 'r2',
    bucket: bucketName,
    region: env.R2_REGION || 'auto',
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    endpoint: env.R2_ENDPOINT,
    publicUrl: env.R2_PUBLIC_URL || 'https://cdn.ormi.com',
  };
  
  console.log('[DEBUG] Storage service config:', {
    bucket: config.bucket,
    bucketType: typeof config.bucket,
    region: config.region,
    endpoint: config.endpoint,
    publicUrl: config.publicUrl,
    hasAccessKey: !!config.accessKeyId,
    hasSecretKey: !!config.secretAccessKey
  });
  
  return new StorageService(config);
}

// Default instance (for backward compatibility, but won't work in Workers)
export const storageService = new StorageService();

// Export for easy configuration changes
export { StorageService }; 