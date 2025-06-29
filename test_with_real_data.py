#!/usr/bin/env python3
"""
Test Python PDF generator with actual property data from the database
"""

import json
import os
from property_pdf_generator import PropertyPDFGenerator

def test_with_actual_data():
    """Test PDF generation with real property data structure"""
    
    # Sample property data matching your actual database schema
    real_property_data = {
        "id": 58,
        "title": "Stunning, fully furnished apartment for sale in Paulshof",
        "description": "Two bedroom, two bathroom apartment for sale in Paulshof. This beautifully appointed apartment offers modern living at its finest. Located in the prestigious Paulshof area, this property features contemporary finishes, an open-plan living area, and stunning views. The apartment comes fully furnished with high-quality pieces and is move-in ready. Premium security and lifestyle amenities make this an ideal investment or family home.",
        "price": 1650000,
        "propertyType": "apartment",
        "listingType": "sale",
        "bedrooms": 2,
        "bathrooms": 2,
        "area": 120,
        "address": "123 Paulshof Drive",
        "suburb": "Paulshof", 
        "city": "Sandton",
        "province": "Gauteng",
        "features": [
            "Fully furnished",
            "Modern kitchen",
            "Built-in wardrobes", 
            "Balcony with views",
            "24/7 security",
            "Swimming pool"
        ],
        "images": [
            "property-1749875735396-204745832.jpg"
        ],
        "featuredImage": "property-1749875735396-204745832.jpg",
        "status": "active",
        "agentId": 7,
        "agent": {
            "id": 7,
            "name": "Reshma Kila",
            "title": "Real Estate Agent",
            "email": "reshma.kila@evogroup.co.za",
            "phone": "+27 11 234 5678",
            "city": "Cape Town"
        }
    }

    # Format for PDF generator
    pdf_property = {
        'title': real_property_data['title'],
        'price': real_property_data['price'],
        'currency': 'ZAR',
        'bedrooms': real_property_data['bedrooms'],
        'bathrooms': real_property_data['bathrooms'],
        'area': real_property_data['area'],
        'description': real_property_data['description'],
        'features': real_property_data['features'],
        'address': f"{real_property_data['address']}, {real_property_data['suburb']}, {real_property_data['city']}, {real_property_data['province']}",
        'images': [f"uploads/{img}" for img in real_property_data['images']] if real_property_data['images'] else [],
        'agent': {
            'name': real_property_data['agent']['name'],
            'title': real_property_data['agent']['title'],
            'phone': real_property_data['agent']['phone'],
            'email': real_property_data['agent']['email']
        }
    }

    # Initialize generator
    generator = PropertyPDFGenerator(
        company_name="Spurgeon Property",
        logo_path=None  # Will use text-based branding
    )

    print("Testing Python PDF generator with real property data...")
    print(f"Property: {pdf_property['title']}")
    print(f"Price: {generator.format_price(pdf_property['price'], pdf_property['currency'])}")
    print(f"Location: {pdf_property['address']}")
    print(f"Agent: {pdf_property['agent']['name']}")

    # Generate single property PDF
    success = generator.generate_single_property_pdf(pdf_property, "test_real_property.pdf")
    
    if success:
        print("✓ Single property PDF generated successfully: test_real_property.pdf")
    else:
        print("✗ Failed to generate single property PDF")

    # Test catalogue with multiple properties
    properties = [pdf_property.copy() for _ in range(2)]
    properties[1]['title'] = "Penthouse with spectacular Views in Modertefontein"
    properties[1]['price'] = 1550000
    properties[1]['suburb'] = "Modertefontein"
    properties[1]['city'] = "Kempton Park"
    properties[1]['address'] = "456 Modertefontein Boulevard, Modertefontein, Kempton Park, Gauteng"

    success = generator.generate_catalogue_pdf(
        properties, 
        "test_real_catalogue.pdf", 
        "Spurgeon Property - Featured Listings"
    )
    
    if success:
        print("✓ Catalogue PDF generated successfully: test_real_catalogue.pdf")
    else:
        print("✗ Failed to generate catalogue PDF")

if __name__ == "__main__":
    test_with_actual_data()