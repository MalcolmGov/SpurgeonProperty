#!/usr/bin/env python3
"""
Test script for enhanced PDF generation with Peter Spurgeon contact information
This script generates a sample property PDF with enhanced contact details and branding.
"""

from enhanced_property_pdf_generator import EnhancedPropertyPDFGenerator

def create_sample_property():
    """Create sample property data for testing"""
    return {
        "id": 1,
        "title": "Luxury Apartment in Sandton City Centre",
        "description": "Discover this stunning 2-bedroom, 2-bathroom apartment in the heart of Sandton. Featuring modern finishes, panoramic city views, and premium amenities including a gym, pool, and 24-hour security. Perfect for executives and investors seeking luxury living in Johannesburg's financial district.",
        "price": 2500000,
        "currency": "ZAR",
        "propertyType": "apartment",
        "listingType": "sale",
        "bedrooms": 2,
        "bathrooms": 2,
        "area": 95,
        "lotSize": 0,
        "address": "123 West Street, Sandton",
        "suburb": "Sandton",
        "city": "Johannesburg",
        "province": "Gauteng",
        "postalCode": "2196",
        "features": [
            "Panoramic city views",
            "Modern kitchen with granite countertops",
            "Master bedroom with en-suite",
            "24-hour security",
            "Swimming pool and gym",
            "Underground parking",
            "Air conditioning throughout",
            "Close to Sandton City Mall",
            "Walking distance to Gautrain",
            "Fibre internet ready"
        ],
        "images": [],
        "agent": {
            "id": 9,
            "name": "Peter Spurgeon",
            "title": "Principal Real Estate Agent",
            "phone": "084 208 9307",
            "email": "Peter@spurgeonproperty.com",
            "rating": 4.9
        },
        "status": "active",
        "featured": True
    }

def main():
    """Generate test PDF with enhanced contact information"""
    print("🏠 Generating Enhanced Property PDF with Peter Spurgeon Contact Info...")
    
    # Create sample data
    properties = [create_sample_property()]
    
    # Create PDF data structure
    
    # Initialize PDF generator
    generator = EnhancedPropertyPDFGenerator(
        company_name="SPURGEON Property",
        logo_path=None
    )
    
    # Generate the enhanced PDF
    output_path = "test_enhanced_contact_pdf.pdf"
    success = generator.generate_enhanced_catalogue_pdf(
        properties=properties,
        output_path=output_path,
        catalogue_title="Premium Property Showcase",
        client_name="Prospective Buyer"
    )
    
    if success:
        print(f"✅ Enhanced PDF generated successfully: {output_path}")
        print("📋 Features included:")
        print("   • Professional Spurgeon Property branding")
        print("   • Peter Spurgeon contact information in footer")
        print("   • Prominent contact box for each property")
        print("   • Phone: 084 208 9307")
        print("   • Email: Peter@spurgeonproperty.com")
        print("   • Website: www.spurgeonproperty.com")
        print("   • Availability: 7 days a week • 8AM - 8PM")
    else:
        print("❌ Failed to generate enhanced PDF")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())