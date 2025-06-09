import { extractSpurgeonProperties } from './server/spurgeon-extractor';

async function testPropertyImport() {
  console.log('Testing property import from Spurgeon Property...');
  
  try {
    const result = await extractSpurgeonProperties();
    
    if (result.success) {
      console.log(`✓ Successfully imported ${result.count} properties`);
      console.log(`Message: ${result.message}`);
    } else {
      console.log(`✗ Import failed: ${result.message}`);
    }
  } catch (error) {
    console.error('Error during import:', error);
  }
}

testPropertyImport();