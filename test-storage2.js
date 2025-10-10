import { Client } from '@replit/object-storage';

async function test() {
  try {
    const client = new Client();
    
    // Try the exact example from docs
    const imageData = Buffer.from('This is test image data with some actual content to verify storage works correctly!');
    
    console.log('Uploading', imageData.length, 'bytes...');
    const uploadResult = await client.uploadFromBytes('file.png', imageData);
    
    if (!uploadResult.ok) {
      console.error('Upload failed:', uploadResult.error);
      return;
    }
    
    console.log('Upload successful! Now downloading...');
    
    // Try to download
    const downloadResult = await client.downloadAsBytes('file.png');
    
    if (!downloadResult.ok) {
      console.error('Download failed:', downloadResult.error);
      return;
    }
    
    const downloaded = Buffer.from(downloadResult.value);
    console.log('Downloaded', downloaded.length, 'bytes');
    console.log('Content:', downloaded.toString());
    console.log('Match:', imageData.equals(downloaded) ? 'YES ✅' : 'NO ❌');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
