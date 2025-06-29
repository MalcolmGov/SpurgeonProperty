# Python PDF Generator Integration Guide

## Overview

This guide shows how to integrate the professional Python PDF generator with your existing Spurgeon Property Node.js application. The Python generator provides superior typography, layout control, and image handling compared to HTML-based solutions.

## Architecture

The Python PDF generator works as a standalone service that can be called from your Node.js backend to generate professional property listings and catalogues.

## Integration Methods

### Method 1: Python Child Process (Recommended)

Add PDF generation endpoints to your Node.js backend that spawn Python processes:

```typescript
// server/routes.ts - Add these new endpoints

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Generate single property PDF
app.post('/api/properties/:id/pdf', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const property = await storage.getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Format property data for Python generator
    const pythonData = {
      title: property.title,
      price: property.price,
      currency: 'ZAR',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      description: property.description,
      features: property.features || [],
      address: `${property.address}, ${property.suburb}, ${property.city}, ${property.province}`,
      images: property.images?.map(img => path.join(process.cwd(), 'uploads', img)) || [],
      agent: property.agent
    };

    // Generate PDF using Python script
    const outputPath = path.join(process.cwd(), 'temp', `property_${propertyId}.pdf`);
    const success = await generatePropertyPDF(pythonData, outputPath);

    if (success && fs.existsSync(outputPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="property_${propertyId}.pdf"`);
      
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
      
      // Cleanup temp file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(outputPath);
      });
    } else {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate property catalogue PDF
app.post('/api/properties/catalogue/pdf', async (req, res) => {
  try {
    const { propertyIds, title = 'Property Catalogue', clientName } = req.body;
    
    if (!propertyIds || !Array.isArray(propertyIds)) {
      return res.status(400).json({ error: 'Property IDs required' });
    }

    // Fetch properties
    const properties = await Promise.all(
      propertyIds.map(id => storage.getPropertyById(parseInt(id)))
    );

    const validProperties = properties.filter(p => p !== null);
    
    if (validProperties.length === 0) {
      return res.status(404).json({ error: 'No valid properties found' });
    }

    // Format properties for Python generator
    const pythonData = validProperties.map(property => ({
      title: property.title,
      price: property.price,
      currency: 'ZAR',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      description: property.description,
      features: property.features || [],
      address: `${property.address}, ${property.suburb}, ${property.city}, ${property.province}`,
      images: property.images?.map(img => path.join(process.cwd(), 'uploads', img)) || [],
      agent: property.agent
    }));

    // Generate catalogue PDF
    const outputPath = path.join(process.cwd(), 'temp', `catalogue_${Date.now()}.pdf`);
    const success = await generateCataloguePDF(pythonData, outputPath, title, clientName);

    if (success && fs.existsSync(outputPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
      
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
      
      // Cleanup temp file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(outputPath);
      });
    } else {
      res.status(500).json({ error: 'Failed to generate catalogue PDF' });
    }
  } catch (error) {
    console.error('Catalogue generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
async function generatePropertyPDF(propertyData: any, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const pythonScript = path.join(process.cwd(), 'generate_single_pdf.py');
    const tempDataPath = path.join(process.cwd(), 'temp', `data_${Date.now()}.json`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempDataPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write property data to temp file
    fs.writeFileSync(tempDataPath, JSON.stringify(propertyData, null, 2));
    
    const python = spawn('python', [pythonScript, tempDataPath, outputPath]);
    
    python.on('close', (code) => {
      // Cleanup temp data file
      if (fs.existsSync(tempDataPath)) {
        fs.unlinkSync(tempDataPath);
      }
      resolve(code === 0);
    });
    
    python.on('error', (error) => {
      console.error('Python process error:', error);
      resolve(false);
    });
  });
}

async function generateCataloguePDF(properties: any[], outputPath: string, title: string, clientName?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const pythonScript = path.join(process.cwd(), 'generate_catalogue_pdf.py');
    const tempDataPath = path.join(process.cwd(), 'temp', `catalogue_data_${Date.now()}.json`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempDataPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write catalogue data to temp file
    const catalogueData = {
      properties,
      title,
      clientName
    };
    fs.writeFileSync(tempDataPath, JSON.stringify(catalogueData, null, 2));
    
    const python = spawn('python', [pythonScript, tempDataPath, outputPath]);
    
    python.on('close', (code) => {
      // Cleanup temp data file
      if (fs.existsSync(tempDataPath)) {
        fs.unlinkSync(tempDataPath);
      }
      resolve(code === 0);
    });
    
    python.on('error', (error) => {
      console.error('Python process error:', error);
      resolve(false);
    });
  });
}
```

### Python Integration Scripts

Create these Python scripts to handle the Node.js integration:

```python
# generate_single_pdf.py
#!/usr/bin/env python3
import sys
import json
from property_pdf_generator import PropertyPDFGenerator

def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_single_pdf.py <data_file> <output_file>")
        sys.exit(1)
    
    data_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        # Load property data
        with open(data_file, 'r') as f:
            property_data = json.load(f)
        
        # Generate PDF
        generator = PropertyPDFGenerator(
            company_name="Spurgeon Property",
            logo_path="spurgeon-property-logo.png"  # Update path as needed
        )
        
        success = generator.generate_single_property_pdf(property_data, output_file)
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

```python
# generate_catalogue_pdf.py
#!/usr/bin/env python3
import sys
import json
from property_pdf_generator import PropertyPDFGenerator

def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_catalogue_pdf.py <data_file> <output_file>")
        sys.exit(1)
    
    data_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        # Load catalogue data
        with open(data_file, 'r') as f:
            catalogue_data = json.load(f)
        
        properties = catalogue_data['properties']
        title = catalogue_data.get('title', 'Property Catalogue')
        client_name = catalogue_data.get('clientName')
        
        # Generate catalogue PDF
        generator = PropertyPDFGenerator(
            company_name="Spurgeon Property",
            logo_path="spurgeon-property-logo.png"  # Update path as needed
        )
        
        success = generator.generate_catalogue_pdf(properties, output_file, title)
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Frontend Integration

Update your admin properties page to include Python PDF generation:

```typescript
// client/src/pages/admin/properties.tsx - Add to existing component

const generatePythonPDF = async (propertyId: number) => {
  try {
    setIsGeneratingPDF(true);
    
    const response = await fetch(`/api/properties/${propertyId}/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `property_${propertyId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Professional PDF generated successfully!",
      });
    } else {
      throw new Error('Failed to generate PDF');
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    toast({
      title: "Error",
      description: "Failed to generate PDF. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsGeneratingPDF(false);
  }
};

const generatePythonCatalogue = async () => {
  try {
    setIsGeneratingCatalogue(true);
    
    const propertyIds = selectedProperties.map(p => p.id);
    
    const response = await fetch('/api/properties/catalogue/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyIds,
        title: catalogueTitle || 'Property Catalogue',
        clientName: clientName
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${catalogueTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'catalogue'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Professional catalogue generated successfully!",
      });
    } else {
      throw new Error('Failed to generate catalogue');
    }
  } catch (error) {
    console.error('Catalogue generation error:', error);
    toast({
      title: "Error",
      description: "Failed to generate catalogue. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsGeneratingCatalogue(false);
  }
};

// Add buttons to your existing UI
<div className="flex gap-2">
  <Button onClick={() => generatePythonPDF(property.id)} disabled={isGeneratingPDF}>
    {isGeneratingPDF ? "Generating..." : "Professional PDF"}
  </Button>
  
  <Button onClick={generatePythonCatalogue} disabled={isGeneratingCatalogue}>
    {isGeneratingCatalogue ? "Generating..." : "Professional Catalogue"}
  </Button>
</div>
```

## Installation Steps

1. **Install Python Dependencies**:
```bash
# Already installed: reportlab
pip install Pillow  # For image processing
```

2. **Copy Python Files**:
   - Copy `property_pdf_generator.py` to your project root
   - Copy `generate_single_pdf.py` to your project root  
   - Copy `generate_catalogue_pdf.py` to your project root

3. **Add Logo File**:
   - Place `spurgeon-property-logo.png` in your project root
   - Update logo path in Python scripts if different location

4. **Create Temp Directory**:
```bash
mkdir temp  # For temporary files during generation
```

5. **Update Node.js Routes**:
   - Add the PDF generation endpoints to your `server/routes.ts`
   - Install any missing Node.js dependencies if needed

## Features

### Professional Typography
- Helvetica font family for clean, professional appearance
- Proper font weights and sizes for hierarchy
- Consistent spacing and margins

### Image Handling
- Automatic image optimization and resizing
- Maintains aspect ratios
- High-quality output suitable for printing

### South African Specific
- ZAR currency formatting (R1.6M, R450K)
- Area in square meters (m²)
- Support for commercial properties without bedrooms/bathrooms

### Layout Quality
- Professional margins and spacing
- Proper page breaks in catalogues
- Responsive layout adapting to content length
- Consistent branding throughout

## Advantages Over HTML/CSS PDF

1. **Superior Typography**: True professional typography with proper kerning and spacing
2. **Image Quality**: Better image handling and optimization
3. **Layout Control**: Precise control over page breaks and element positioning
4. **File Size**: Smaller, optimized PDF files
5. **Printing Quality**: Designed specifically for high-quality printing
6. **Reliability**: No browser rendering inconsistencies

## Testing

Test the integration with your existing property data:

```bash
# Test single property PDF
python demo_pdf_generation.py

# Verify generated files
ls -la *.pdf
```

The Python generator provides enterprise-grade PDF generation that will significantly enhance your client presentations and marketing materials.