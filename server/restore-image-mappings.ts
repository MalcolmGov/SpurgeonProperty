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

interface ImageGroup {
  timestamp: number;
  files: string[];
  date: Date;
}

async function uploadToCloudinary(localPath: string): Promise<string | null> {
  try {
    const result = await cloudinaryV2.uploader.upload(localPath, {
      folder: 'spurgeon-restored',
      resource_type: 'image',
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:`, error);
    return null;
  }
}

function extractTimestamp(filename: string): number | null {
  const match = filename.match(/property-(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}

function groupImagesByTimestamp(files: string[]): ImageGroup[] {
  const groups: Map<number, string[]> = new Map();
  
  files.forEach(file => {
    const timestamp = extractTimestamp(file);
    if (timestamp) {
      const bucketTime = Math.floor(timestamp / 60000) * 60000;
      if (!groups.has(bucketTime)) {
        groups.set(bucketTime, []);
      }
      groups.get(bucketTime)!.push(file);
    }
  });

  return Array.from(groups.entries())
    .map(([timestamp, files]) => ({
      timestamp,
      files: files.sort(),
      date: new Date(timestamp)
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

async function restoreImageMappings() {
  console.log('=== Image Restoration Script ===\n');

  const allFiles = fs.readdirSync(uploadsDir);
  const imageFiles = allFiles.filter(f => 
    /^property-\d+.*\.(jpg|jpeg|png|webp)$/i.test(f)
  );
  
  console.log(`Found ${imageFiles.length} property images in uploads folder`);

  const imageGroups = groupImagesByTimestamp(imageFiles);
  console.log(`Grouped into ${imageGroups.length} upload sessions\n`);

  const allProperties = await db.select().from(properties);
  console.log(`Found ${allProperties.length} properties in database\n`);

  const propertiesWithDates = allProperties
    .filter(p => p.createdAt)
    .map(p => ({
      ...p,
      createdTime: new Date(p.createdAt!).getTime()
    }))
    .sort((a, b) => a.createdTime - b.createdTime);

  const assignments: Map<number, { property: any; images: string[] }> = new Map();

  for (const group of imageGroups) {
    let bestMatch: any = null;
    let bestDiff = Infinity;

    for (const prop of propertiesWithDates) {
      const diff = Math.abs(group.timestamp - prop.createdTime);
      if (diff < bestDiff && diff < 24 * 60 * 60 * 1000) {
        bestDiff = diff;
        bestMatch = prop;
      }
    }

    if (bestMatch) {
      if (!assignments.has(bestMatch.id)) {
        assignments.set(bestMatch.id, { property: bestMatch, images: [] });
      }
      assignments.get(bestMatch.id)!.images.push(...group.files);
    }
  }

  console.log(`Matched images to ${assignments.size} properties\n`);

  let totalUpdated = 0;
  let totalImages = 0;

  for (const [propertyId, data] of assignments) {
    console.log(`\nProperty ${propertyId}: ${data.property.title?.substring(0, 50)}...`);
    console.log(`  Uploading ${data.images.length} images...`);

    const cloudinaryUrls: string[] = [];
    
    for (const filename of data.images.slice(0, 20)) {
      const localPath = path.join(uploadsDir, filename);
      const url = await uploadToCloudinary(localPath);
      if (url) {
        cloudinaryUrls.push(url);
        process.stdout.write('.');
      }
    }
    console.log(` Done (${cloudinaryUrls.length} uploaded)`);

    if (cloudinaryUrls.length > 0) {
      const featuredImage = cloudinaryUrls[0];
      const allImages = cloudinaryUrls;

      await db.update(properties)
        .set({
          featuredImage,
          images: allImages
        })
        .where(eq(properties.id, propertyId));

      totalUpdated++;
      totalImages += cloudinaryUrls.length;
      console.log(`  ✓ Updated database with ${cloudinaryUrls.length} images`);
    }
  }

  console.log(`\n=== Restoration Complete ===`);
  console.log(`Properties updated: ${totalUpdated}`);
  console.log(`Total images restored: ${totalImages}`);
}

restoreImageMappings()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
