import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { db } from './db';
import { properties } from '../shared/schema';
import { eq } from 'drizzle-orm';

const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadsDir = path.join(process.cwd(), 'uploads');

async function uploadToCloudinary(localPath: string): Promise<string | null> {
  try {
    const result = await cloudinaryV2.uploader.upload(localPath, {
      folder: 'spurgeon-properties',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:`, error);
    return null;
  }
}

async function migrateImages() {
  console.log('Starting image migration to Cloudinary...');
  
  // Get all properties from database
  const allProperties = await db.select().from(properties);
  console.log(`Found ${allProperties.length} properties to check`);
  
  let totalUploaded = 0;
  let totalFailed = 0;
  let propertiesUpdated = 0;
  
  // Create a map of local filenames to Cloudinary URLs
  const urlMap: Record<string, string> = {};
  
  // First, upload all local images to Cloudinary
  const files = fs.readdirSync(uploadsDir);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
  
  console.log(`Found ${imageFiles.length} images to upload`);
  
  // Upload in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    console.log(`Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(imageFiles.length/batchSize)}...`);
    
    const results = await Promise.all(
      batch.map(async (filename) => {
        const localPath = path.join(uploadsDir, filename);
        const cloudinaryUrl = await uploadToCloudinary(localPath);
        
        if (cloudinaryUrl) {
          urlMap[`/uploads/${filename}`] = cloudinaryUrl;
          totalUploaded++;
          return { filename, success: true };
        } else {
          totalFailed++;
          return { filename, success: false };
        }
      })
    );
    
    // Log progress
    results.forEach(r => {
      if (r.success) {
        console.log(`  ✓ ${r.filename}`);
      } else {
        console.log(`  ✗ ${r.filename}`);
      }
    });
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < imageFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\nImage upload complete: ${totalUploaded} uploaded, ${totalFailed} failed`);
  console.log(`\nUpdating database references...`);
  
  // Now update each property's image references
  for (const property of allProperties) {
    let updated = false;
    let newFeaturedImage = property.featuredImage;
    let newImages = property.images || [];
    
    // Update featured image
    if (property.featuredImage && property.featuredImage.startsWith('/uploads/')) {
      const cloudinaryUrl = urlMap[property.featuredImage];
      if (cloudinaryUrl) {
        newFeaturedImage = cloudinaryUrl;
        updated = true;
      }
    }
    
    // Update images array
    if (property.images && property.images.length > 0) {
      newImages = property.images.map(img => {
        if (img && img.startsWith('/uploads/')) {
          const cloudinaryUrl = urlMap[img];
          return cloudinaryUrl || img;
        }
        return img;
      });
      
      // Check if any images were updated
      if (JSON.stringify(newImages) !== JSON.stringify(property.images)) {
        updated = true;
      }
    }
    
    if (updated) {
      await db.update(properties)
        .set({
          featuredImage: newFeaturedImage,
          images: newImages
        })
        .where(eq(properties.id, property.id));
      
      propertiesUpdated++;
      console.log(`  Updated property ${property.id}: ${property.title?.substring(0, 50)}...`);
    }
  }
  
  console.log(`\n=== Migration Complete ===`);
  console.log(`Images uploaded: ${totalUploaded}`);
  console.log(`Images failed: ${totalFailed}`);
  console.log(`Properties updated: ${propertiesUpdated}`);
}

migrateImages()
  .then(() => {
    console.log('Migration finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
