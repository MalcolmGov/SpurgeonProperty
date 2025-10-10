import { Client } from '@replit/object-storage';

async function test() {
  try {
    const storage = new Client();
    console.log('✅ Object Storage client created');
    
    // Test upload
    const testData = Buffer.from('Hello World! This is a test file with actual content.');
    const uploadResult = await storage.uploadFromBytes('test-file.txt', testData);
    console.log('Upload result:', uploadResult);
    
    // Test download
    const downloadResult = await storage.downloadAsBytes('test-file.txt');
    console.log('Download result:', {
      ok: downloadResult.ok,
      size: downloadResult.ok ? downloadResult.value.length : 0,
      content: downloadResult.ok ? Buffer.from(downloadResult.value).toString() : null
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
