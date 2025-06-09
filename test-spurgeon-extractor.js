const { extractSpurgeonProperties } = require('./server/spurgeon-extractor.ts');

async function testExtractor() {
  console.log('Testing Spurgeon Property extractor...');
  
  try {
    const result = await extractSpurgeonProperties();
    console.log('Extraction result:', result);
    
    if (result.success) {
      console.log(`Successfully extracted ${result.count} properties`);
    } else {
      console.log('Extraction failed:', result.message);
    }
  } catch (error) {
    console.error('Error during extraction:', error.message);
  }
}

testExtractor();