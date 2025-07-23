// Export properties data for PDF generation
const fs = require('fs');
const path = require('path');

// Import the storage module
const { createStorage } = require('./server/storage.ts');

async function exportProperties() {
    try {
        const storage = createStorage();
        const properties = await storage.getProperties();
        
        console.log(`Found ${properties.length} properties`);
        
        // Convert to plain objects for JSON serialization
        const propertiesData = properties.map(prop => {
            const data = { ...prop };
            
            // Parse images JSON string if needed
            if (typeof data.images === 'string') {
                try {
                    data.images = JSON.parse(data.images);
                } catch (e) {
                    data.images = [];
                }
            }
            
            // Parse features JSON string if needed
            if (typeof data.features === 'string') {
                try {
                    data.features = JSON.parse(data.features);
                } catch (e) {
                    data.features = [];
                }
            }
            
            return data;
        });
        
        // Write to JSON file
        fs.writeFileSync('properties_for_catalogue.json', JSON.stringify(propertiesData, null, 2));
        console.log('Properties exported to properties_for_catalogue.json');
        
        // Show sample data
        if (propertiesData.length > 0) {
            console.log('\nSample property:');
            console.log(`Title: ${propertiesData[0].title}`);
            console.log(`Price: R${propertiesData[0].salePrice}`);
            console.log(`Images: ${propertiesData[0].images?.length || 0} images`);
        }
        
    } catch (error) {
        console.error('Error exporting properties:', error);
    }
}

exportProperties();