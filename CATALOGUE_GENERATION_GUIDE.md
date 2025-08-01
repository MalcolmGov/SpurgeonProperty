# Property Catalogue Generation Guide

## Overview
The Spurgeon Property platform now offers three comprehensive catalogue generation options, each optimized for different use cases and marketing needs.

## Catalogue Types

### 1. HTML Web Catalogue
**Best for:** Social media, websites, and digital sharing
- **Features:**
  - Responsive design for all devices
  - Modern purple/orange gradient styling
  - Animated elements and hover effects
  - Perfect for social media sharing
  - Direct web links for easy distribution

**How to Generate:**
1. Go to Admin Dashboard → Catalogue Generator
2. Select specific properties or use "Select All"
3. Click "Generate HTML Catalogue"
4. File downloads automatically as `spurgeon_property_catalogue.html`

### 2. Standard PDF Catalogue
**Best for:** Client presentations and professional brochures
- **Features:**
  - Clean, professional layout
  - Property images and details
  - Contact information included
  - Print-ready format

**How to Generate:**
1. Go to Admin Dashboard → Catalogue Generator
2. Select desired properties
3. Click "Generate PDF Catalogue"
4. PDF downloads automatically

### 3. Optimized PDF Catalogue (NEW)
**Best for:** Premium client portfolios and high-end marketing
- **Features:**
  - Professional cover page with Spurgeon Property branding
  - Comprehensive table of contents
  - Individual property pages with enhanced layouts
  - Peter Spurgeon contact information on every page
  - Headers and footers throughout
  - High-quality image optimization
  - Consistent professional styling

**How to Generate:**
1. Go to Admin Dashboard → Catalogue Generator
2. Select properties to include
3. Click "Generate Optimized PDF"
4. Premium catalogue downloads with enhanced branding

## Contact Information Display

All catalogues prominently feature Peter Spurgeon's contact details:
- **Name:** Peter Spurgeon - Principal Real Estate Agent
- **Phone:** 084 208 9307
- **Email:** Peter@spurgeonproperty.com
- **Website:** www.spurgeonproperty.com
- **Availability:** 7 days a week • 8AM - 8PM

## Technical Features

### HTML Catalogue
- Modern CSS Grid layout
- Responsive breakpoints for mobile/tablet/desktop
- Gradient backgrounds matching brand colors
- Property filtering and sorting capabilities
- Contact forms integrated

### Standard PDF
- A4 page format
- Professional typography
- Property specifications tables
- Image galleries with captions

### Optimized PDF
- Professional cover page design
- Enhanced typography system with multiple font sizes
- Color-coded property information
- Contact boxes on each property page
- Professional headers and footers
- Table of contents with property overview
- Optimized image processing for print quality

## API Endpoints

- **HTML Catalogue:** `POST /api/admin/catalogue/html`
- **Standard PDF:** `POST /api/admin/catalogue/pdf`
- **Optimized PDF:** `POST /api/properties/optimized-catalogue`

## File Locations

Generated files are temporarily stored in:
- HTML files: Root directory (`spurgeon_catalogue.html`)
- PDF files: `uploads/` directory with timestamp filenames
- Automatic cleanup after 10-15 minutes

## Usage Tips

1. **Property Selection:** Use "Select All" for comprehensive catalogues or choose specific properties for targeted marketing
2. **Client Customization:** The optimized PDF includes client name personalization
3. **Download Management:** Files automatically download - check your Downloads folder
4. **Mobile Compatibility:** HTML catalogues work perfectly on mobile devices for on-the-go sharing
5. **Print Quality:** Both PDF options are optimized for professional printing

## Troubleshooting

### HTML Not Downloading
- Ensure pop-up blockers are disabled
- Check Downloads folder
- Try refreshing the page and regenerating

### PDF Generation Issues
- Verify properties have images uploaded
- Check that property data is complete
- Contact admin if Python PDF generation fails

### Image Display Problems
- Ensure images are properly uploaded to `/uploads/` directory
- Check file permissions and sizes
- Verify image formats (JPG, PNG supported)

## Marketing Best Practices

### HTML Catalogues
- Perfect for Instagram Stories and Facebook posts
- Use shortened URLs for easy sharing
- Great for email marketing campaigns
- Responsive design works on all devices

### PDF Catalogues
- Professional email attachments
- Print for client meetings
- Upload to property portals
- Share via WhatsApp and messaging apps

### Optimized PDFs
- Premium client presentations
- High-value property portfolios
- Professional marketing materials
- Investor packages and proposals

## Contact Information

For technical support or feature requests:
- **Development Team:** Via admin dashboard
- **Property Management:** Contact Peter Spurgeon directly
- **System Issues:** Check server logs in admin panel