import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration
const R2_CONFIG = {
  bucket: 'ormi-storage',
  region: 'auto',
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT || 'https://475a121e52d9057d0e99c52062f3b6e5.r2.cloudflarestorage.com',
};

const s3Client = new S3Client({
  region: R2_CONFIG.region,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
  endpoint: R2_CONFIG.endpoint,
  forcePathStyle: false,
});

/**
 * Migration script to move files from old structure to new optimized structure
 * 
 * OLD STRUCTURE:
 * - accountId/property/properties/propertyId/file.jpg
 * - accountId/property/units/unitId/images/file.jpg
 * - accountId/team/avatars/teamMemberId/file.jpg
 * 
 * NEW STRUCTURE:
 * - accountId/property/propertyId/file.jpg
 * - accountId/property/propertyId/unitId/file.jpg
 * - accountId/team/teamMemberId/file.jpg
 * - accountId/documents/category/context/file.jpg
 */

async function listObjects(prefix = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.bucket,
      Prefix: prefix,
    });
    
    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing objects:', error);
    return [];
  }
}

async function copyObject(oldKey, newKey) {
  try {
    const command = new CopyObjectCommand({
      Bucket: R2_CONFIG.bucket,
      CopySource: `${R2_CONFIG.bucket}/${oldKey}`,
      Key: newKey,
    });
    
    await s3Client.send(command);
    console.log(`✅ Copied: ${oldKey} → ${newKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Error copying ${oldKey} → ${newKey}:`, error);
    return false;
  }
}

async function deleteObject(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`🗑️  Deleted: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${key}:`, error);
    return false;
  }
}

async function migrateStorageStructure() {
  console.log('🚀 Starting R2 storage structure migration...');
  console.log('📊 Current structure will be optimized for better organization');
  
  // List all objects in the bucket
  const allObjects = await listObjects();
  console.log(`📁 Found ${allObjects.length} objects to process`);
  
  let migratedCount = 0;
  let errorCount = 0;
  
  for (const obj of allObjects) {
    const oldKey = obj.Key;
    
    if (!oldKey) continue;
    
    try {
      // Parse the old key structure
      const parts = oldKey.split('/');
      
      if (parts.length < 3) {
        console.log(`⏭️  Skipping: ${oldKey} (invalid structure)`);
        continue;
      }
      
      const accountId = parts[0];
      const category = parts[1];
      let newKey = oldKey;
      
      // Handle different migration scenarios
      if (category === 'property') {
        if (parts[2] === 'properties' && parts.length >= 4) {
          // OLD: accountId/property/properties/propertyId/file.jpg
          // NEW: accountId/property/propertyId/file.jpg
          const propertyId = parts[3];
          const fileName = parts.slice(4).join('/');
          newKey = `${accountId}/property/${propertyId}/${fileName}`;
        } else if (parts[2] === 'units' && parts.length >= 5) {
          // OLD: accountId/property/units/unitId/images/file.jpg
          // NEW: accountId/property/propertyId/unitId/file.jpg
          // Note: We need propertyId from database, so we'll handle this separately
          console.log(`⚠️  Unit files need property context: ${oldKey}`);
          continue;
        }
      } else if (category === 'team') {
        if (parts[2] === 'avatars' && parts.length >= 4) {
          // OLD: accountId/team/avatars/teamMemberId/file.jpg
          // NEW: accountId/team/teamMemberId/file.jpg
          const teamMemberId = parts[3];
          const fileName = parts.slice(4).join('/');
          newKey = `${accountId}/team/${teamMemberId}/${fileName}`;
        }
      }
      
      // Only migrate if the key actually changed
      if (newKey !== oldKey) {
        console.log(`🔄 Migrating: ${oldKey} → ${newKey}`);
        
        const copySuccess = await copyObject(oldKey, newKey);
        if (copySuccess) {
          const deleteSuccess = await deleteObject(oldKey);
          if (deleteSuccess) {
            migratedCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      } else {
        console.log(`✅ Already optimized: ${oldKey}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${oldKey}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${migratedCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`📁 Total processed: ${allObjects.length} files`);
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some files failed to migrate. Please check the logs above.');
  } else {
    console.log('\n🎉 Migration completed successfully!');
  }
}

// Handle unit files separately (requires database context)
async function migrateUnitFiles() {
  console.log('\n🔧 Note: Unit files require property context from database');
  console.log('📝 Please run this after updating the application code');
  console.log('🔄 Unit files will be migrated automatically when accessed');
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateStorageStructure()
    .then(() => migrateUnitFiles())
    .then(() => {
      console.log('\n✨ Migration script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

export {
  migrateStorageStructure,
  migrateUnitFiles,
}; 