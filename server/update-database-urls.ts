import cloudinary from 'cloudinary';
import { db } from './db';
import { properties } from '../shared/schema';
import { eq } from 'drizzle-orm';

const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getAllCloudinaryImages() {
  const images: Array<{ public_id: string; secure_url: string }> = [];
  let cursor: string | undefined;

  do {
    const options: any = {
      type: 'upload',
      prefix: 'spurgeon-properties',
      max_results: 500
    };
    if (cursor) options.next_cursor = cursor;

    const result = await cloudinaryV2.api.resources(options);
    images.push(...result.resources.map((r: any) => ({
      public_id: r.public_id,
      secure_url: r.secure_url
    })));
    cursor = result.next_cursor;
  } while (cursor);

  return images;
}

function extractFilename(publicId: string): string {
  const parts = publicId.split('/');
  return parts[parts.length - 1];
}

async function updateDatabaseUrls() {
  console.log('Fetching all Cloudinary images...');
  const cloudinaryImages = await getAllCloudinaryImages();
  console.log(`Found ${cloudinaryImages.length} images in Cloudinary`);

  const urlMap: Record<string, string> = {};
  
  cloudinaryImages.forEach(img => {
    const filename = extractFilename(img.public_id);
    const possibleLocalPaths = [
      `/uploads/${filename}.jpg`,
      `/uploads/${filename}.jpeg`,
      `/uploads/${filename}.png`,
      `/uploads/${filename}.webp`,
      `/uploads/${filename}`
    ];
    possibleLocalPaths.forEach(path => {
      urlMap[path] = img.secure_url;
    });
  });

  console.log(`Built URL map with ${Object.keys(urlMap).length} entries`);

  const allProperties = await db.select().from(properties);
  console.log(`Found ${allProperties.length} properties to update`);

  let updated = 0;

  for (const property of allProperties) {
    let changed = false;
    let newFeaturedImage = property.featuredImage;
    let newImages = property.images || [];

    if (property.featuredImage && property.featuredImage.startsWith('/uploads/')) {
      const cloudUrl = urlMap[property.featuredImage];
      if (cloudUrl) {
        newFeaturedImage = cloudUrl;
        changed = true;
      }
    }

    if (property.images && property.images.length > 0) {
      const mappedImages = property.images.map(img => {
        if (img && img.startsWith('/uploads/')) {
          return urlMap[img] || img;
        }
        return img;
      });
      
      if (JSON.stringify(mappedImages) !== JSON.stringify(property.images)) {
        newImages = mappedImages;
        changed = true;
      }
    }

    if (changed) {
      await db.update(properties)
        .set({
          featuredImage: newFeaturedImage,
          images: newImages
        })
        .where(eq(properties.id, property.id));
      updated++;
      console.log(`Updated property ${property.id}: ${property.title?.substring(0, 40)}...`);
    }
  }

  console.log(`\n=== Update Complete ===`);
  console.log(`Properties updated: ${updated}`);
}

updateDatabaseUrls()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
