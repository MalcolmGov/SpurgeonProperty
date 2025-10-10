import { Client } from '@replit/object-storage';
import fs from 'fs';

async function test() {
  try {
    const client = new Client();
    
    // Create a test file
    const testContent = 'This is test file content!';
    fs.writeFileSync('/tmp/test.txt', testContent);
    
    console.log('Test 1: uploadFromFilename');
    const upload1 = await client.uploadFromFilename('test-from-file.txt', '/tmp/test.txt');
    console.log('Upload result:', upload1);
    
    const download1 = await client.downloadAsBytes('test-from-file.txt');
    if (download1.ok) {
      console.log('Downloaded:', Buffer.from(download1.value).toString());
    }
    
    console.log('\nTest 2: uploadFromText');
    const upload2 = await client.uploadFromText('test-from-text.txt', testContent);
    console.log('Upload result:', upload2);
    
    const download2 = await client.downloadAsBytes('test-from-text.txt');
    if (download2.ok) {
      console.log('Downloaded:', Buffer.from(download2.value).toString());
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
