import { v2 as cloudinary } from 'cloudinary';

// Parse cloud name from CLOUDINARY_URL or use the correct value
let cloudName, apiKey, apiSecret;

if (process.env.CLOUDINARY_URL) {
  const url = new URL(process.env.CLOUDINARY_URL);
  cloudName = url.hostname;
  apiKey = url.username;
  apiSecret = url.password;
} else {
  // Fall back to individual vars, but use correct cloud name
  cloudName = 'djmjg0eox';
  apiKey = process.env.CLOUDINARY_API_KEY;
  apiSecret = process.env.CLOUDINARY_API_SECRET;
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

console.log("Cloudinary config:", {
  cloud_name: cloudName,
  api_key: !!apiKey,
  api_secret: !!apiSecret
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
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error.message);
  }
}

test();
