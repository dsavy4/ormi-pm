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
    });
  }

  /**
   * Upload a file to storage with account-based path
   */
  async uploadFile(
    file: Uint8Array,
    fileName: string,
    contentType: string,
    accountPath: string
  ): Promise<{ url: string; key: string }> {
    try {
      const key = `${accountPath}/${Date.now()}-${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file,
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
    r2PublicUrlValue: env.R2_PUBLIC_URL
  });
  
  // In Cloudflare Workers, R2 bindings are objects, not strings
  // We need to use the bucket name directly
  const bucketName = 'ormi-storage'; // Use the actual bucket name
  
  const config: StorageConfig = {
    provider: 'r2',
    bucket: bucketName,
    region: env.R2_REGION || 'auto',
    accessKeyId: env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: env.R2_SECRET_ACCESS_KEY || '',
    endpoint: env.R2_ENDPOINT || 'https://475a121e52d9057d0e99c52062f3b6e5.r2.cloudflarestorage.com',
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