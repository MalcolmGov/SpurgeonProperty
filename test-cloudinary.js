import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: !!process.env.CLOUDINARY_API_KEY,
  api_secret: !!process.env.CLOUDINARY_API_SECRET
});

async function test() {
  try {
    // Test upload
    const result = await cloudinary.uploader.upload('https://via.placeholder.com/150', {
      folder: 'spurgeon-test',
      resource_type: 'image'
    });
    
    console.log("✅ Cloudinary upload successful!");
    console.log("URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
  }
}

test();
