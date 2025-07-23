import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execFile = promisify(spawn);

export interface PropertyData {
  id: number;
  title: string;
  description?: string;
  salePrice: number;
  listingType: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  floorArea?: number;
  address?: string;
  suburb?: string;
  city?: string;
  province?: string;
  features?: string[];
  images?: string[];
  agent?: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
}

export class CatalogueGenerator {
  
  /**
   * Generate HTML catalogue for web viewing and social media
   */
  async generateHTMLCatalogue(properties: PropertyData[]): Promise<string> {
    try {
      // Write properties to temporary JSON file
      const jsonFile = path.join(process.cwd(), 'temp_properties.json');
      await fs.writeFile(jsonFile, JSON.stringify(properties, null, 2));
      
      // Run Python script to generate HTML
      const pythonProcess = spawn('python3', ['create_html_catalogue.py', jsonFile], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        pythonProcess.on('close', async (code) => {
          try {
            // Clean up temp file
            await fs.unlink(jsonFile).catch(() => {});
            
            if (code === 0) {
              // Check if HTML file was created
              const htmlFile = path.join(process.cwd(), 'spurgeon_catalogue.html');
              const exists = await fs.access(htmlFile).then(() => true).catch(() => false);
              
              if (exists) {
                resolve(htmlFile);
              } else {
                reject(new Error('HTML catalogue file not created'));
              }
            } else {
              reject(new Error(`Python script failed: ${stderr || stdout}`));
            }
          } catch (error) {
            reject(error);
          }
        });
        
        pythonProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn Python process: ${error.message}`));
        });
      });
      
    } catch (error) {
      throw new Error(`Failed to generate HTML catalogue: ${error.message}`);
    }
  }
  
  /**
   * Generate PDF catalogue for print and professional sharing
   */
  async generatePDFCatalogue(properties: PropertyData[]): Promise<string> {
    try {
      // Write properties to temporary JSON file
      const jsonFile = path.join(process.cwd(), 'temp_properties.json');
      await fs.writeFile(jsonFile, JSON.stringify(properties, null, 2));
      
      // Run Python script to generate PDF
      const pythonProcess = spawn('python3', ['professional_catalogue_generator.py', jsonFile], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        pythonProcess.on('close', async (code) => {
          try {
            // Clean up temp file
            await fs.unlink(jsonFile).catch(() => {});
            
            if (code === 0) {
              // Check if PDF file was created
              const pdfFile = path.join(process.cwd(), 'spurgeon_professional_catalogue.pdf');
              const exists = await fs.access(pdfFile).then(() => true).catch(() => false);
              
              if (exists) {
                resolve(pdfFile);
              } else {
                reject(new Error('PDF catalogue file not created'));
              }
            } else {
              reject(new Error(`Python script failed: ${stderr || stdout}`));
            }
          } catch (error) {
            reject(error);
          }
        });
        
        pythonProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn Python process: ${error.message}`));
        });
      });
      
    } catch (error) {
      throw new Error(`Failed to generate PDF catalogue: ${error.message}`);
    }
  }
  
  /**
   * Generate social media graphics for individual properties
   */
  async generateSocialMediaGraphics(properties: PropertyData[]): Promise<string[]> {
    try {
      // Limit to first 3 properties for social media
      const limitedProperties = properties.slice(0, 3);
      
      // Write properties to temporary JSON file
      const jsonFile = path.join(process.cwd(), 'temp_properties.json');
      await fs.writeFile(jsonFile, JSON.stringify(limitedProperties, null, 2));
      
      // Run Python script to generate social media graphics
      const pythonProcess = spawn('python3', ['create_social_media_graphics.py', jsonFile], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        pythonProcess.on('close', async (code) => {
          try {
            // Clean up temp file
            await fs.unlink(jsonFile).catch(() => {});
            
            if (code === 0) {
              // Find generated graphics files
              const generatedFiles: string[] = [];
              
              for (const property of limitedProperties) {
                const propId = property.id;
                const files = [
                  `property_${propId}_instagram.png`,
                  `property_${propId}_story.png`,
                  `property_${propId}_facebook.png`
                ];
                
                for (const file of files) {
                  const filePath = path.join(process.cwd(), file);
                  const exists = await fs.access(filePath).then(() => true).catch(() => false);
                  if (exists) {
                    generatedFiles.push(filePath);
                  }
                }
              }
              
              resolve(generatedFiles);
            } else {
              reject(new Error(`Python script failed: ${stderr || stdout}`));
            }
          } catch (error) {
            reject(error);
          }
        });
        
        pythonProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn Python process: ${error.message}`));
        });
      });
      
    } catch (error) {
      throw new Error(`Failed to generate social media graphics: ${error.message}`);
    }
  }
  
  /**
   * Generate complete marketing package (HTML, PDF, and social media graphics)
   */
  async generateCompletePackage(properties: PropertyData[]): Promise<{
    htmlFile: string;
    pdfFile: string;
    socialMediaFiles: string[];
  }> {
    try {
      console.log(`Generating complete marketing package for ${properties.length} properties...`);
      
      // Generate all formats concurrently
      const [htmlFile, pdfFile, socialMediaFiles] = await Promise.all([
        this.generateHTMLCatalogue(properties),
        this.generatePDFCatalogue(properties),
        this.generateSocialMediaGraphics(properties)
      ]);
      
      console.log('Complete marketing package generated successfully');
      
      return {
        htmlFile,
        pdfFile,
        socialMediaFiles
      };
      
    } catch (error) {
      throw new Error(`Failed to generate complete package: ${error.message}`);
    }
  }
}

// Export singleton instance
export const catalogueGenerator = new CatalogueGenerator();