#!/usr/bin/env python3
"""
Demo script for the Property PDF Generator
Shows integration with existing property data and generates sample PDFs
"""

from property_pdf_generator import PropertyPDFGenerator

def create_sample_properties():
    """Create sample property data that matches your existing structure"""
    
    properties = [
        {
            'title': 'Stunning, fully furnished apartment for sale in Paulshof',
            'price': 1650000,
            'currency': 'ZAR',
            'bedrooms': 2,
            'bathrooms': 2,
            'area': 120,
            'propertyType': 'apartment',
            'listingType': 'sale',
            'description': 'This beautifully appointed apartment offers modern living at its finest. Located in the prestigious Paulshof area, this property features contemporary finishes, an open-plan living area, and stunning views. The apartment comes fully furnished with high-quality pieces and is move-in ready. Premium security and lifestyle amenities make this an ideal investment or family home.',
            'features': [
                'Fully furnished',
                'Open-plan living',
                'Modern kitchen',
                'Built-in wardrobes',
                'Balcony with views',
                '24/7 security',
                'Swimming pool',
                'Gymnasium'
            ],
            'address': '123 Paulshof Drive',
            'suburb': 'Paulshof',
            'city': 'Sandton',
            'province': 'Gauteng',
            'images': [],
            'agent': {
                'name': 'Reshma Kila',
                'title': 'Real Estate Agent',
                'phone': '+27 11 234 5678',
                'email': 'reshma.kila@evogroup.co.za'
            }
        },
        {
            'title': 'Penthouse with spectacular Views in the heart of Modertefontein',
            'price': 1550000,
            'currency': 'ZAR',
            'bedrooms': 2,
            'bathrooms': 2,
            'area': 180,
            'propertyType': 'apartment',
            'listingType': 'sale',
            'description': 'Spectacular penthouse offering panoramic views of the surrounding landscape. This exceptional property combines luxury living with modern convenience. The open-plan design maximizes space and natural light, while premium finishes throughout create an atmosphere of sophistication. Located in the heart of Modertefontein with easy access to major highways and amenities.',
            'features': [
                'Panoramic views',
                'Premium finishes',
                'Open-plan design',
                'Private balcony',
                'Secure parking',
                'Elevator access',
                'Modern appliances',
                'Air conditioning'
            ],
            'address': '456 Modertefontein Boulevard',
            'suburb': 'Modertefontein',
            'city': 'Kempton Park',
            'province': 'Gauteng',
            'images': [],
            'agent': {
                'name': 'Veruschkia Barnard',
                'title': 'Senior Real Estate Agent',
                'phone': '+27 11 345 6789',
                'email': 'veruschkiabarnard@rocketmail.com'
            }
        },
        {
            'title': 'Warehouse for rent in Jatnel Benoni',
            'price': 25000,
            'currency': 'ZAR',
            'propertyType': 'commercial',
            'listingType': 'rent',
            'area': 1500,
            'description': 'Prime industrial warehouse space available for rent in the established Jatnel Benoni industrial area. This property offers excellent accessibility for logistics operations with high ceilings, loading docks, and ample parking. The facility is suitable for manufacturing, storage, or distribution operations. Well-maintained property with immediate availability.',
            'features': [
                'High ceilings',
                'Loading docks',
                'Ample parking',
                'Security fencing',
                '3-phase power',
                'Office space included',
                'Easy highway access',
                'Industrial zoning'
            ],
            'address': '789 Industrial Road',
            'suburb': 'Jatnel',
            'city': 'Benoni',
            'province': 'Gauteng',
            'images': [],
            'agent': {
                'name': 'Spurgeon Peter',
                'title': 'Managing Director',
                'phone': '+27 11 456 7890',
                'email': 'Peter@spurgeonproperty.com'
            }
        }
    ]
    
    return properties

def format_property_for_pdf(property_data):
    """Convert property data to PDF generator format"""
    
    # Format address
    address_parts = []
    if property_data.get('address'):
        address_parts.append(property_data['address'])
    if property_data.get('suburb'):
        address_parts.append(property_data['suburb'])
    if property_data.get('city'):
        address_parts.append(property_data['city'])
    if property_data.get('province'):
        address_parts.append(property_data['province'])
    
    formatted_address = ', '.join(address_parts)
    
    # Convert to PDF format
    pdf_property = {
        'title': property_data.get('title', 'Property Listing'),
        'price': property_data.get('price', 0),
        'currency': property_data.get('currency', 'ZAR'),
        'description': property_data.get('description', ''),
        'features': property_data.get('features', []),
        'address': formatted_address,
        'images': property_data.get('images', []),
        'agent': property_data.get('agent', {})
    }
    
    # Add bedrooms/bathrooms for residential properties
    if property_data.get('propertyType') not in ['commercial', 'land']:
        if property_data.get('bedrooms'):
            pdf_property['bedrooms'] = property_data['bedrooms']
        if property_data.get('bathrooms'):
            pdf_property['bathrooms'] = property_data['bathrooms']
    
    # Add area (prioritize area over square_feet for South African properties)
    if property_data.get('area'):
        pdf_property['area'] = property_data['area']
    
    return pdf_property

def main():
    """Generate sample PDFs using South African property data"""
    
    print("Property PDF Generator Demo")
    print("=" * 40)
    
    # Create sample properties
    properties = create_sample_properties()
    
    # Initialize PDF generator with Spurgeon Property branding
    generator = PropertyPDFGenerator(
        company_name="Spurgeon Property",
        logo_path=None  # Update with actual logo path if available
    )
    
    # Generate individual property PDFs
    print("\nGenerating individual property PDFs...")
    
    for i, prop in enumerate(properties, 1):
        formatted_prop = format_property_for_pdf(prop)
        filename = f"property_{i}_{prop['suburb'].lower().replace(' ', '_')}.pdf"
        
        print(f"  {i}. {prop['title'][:50]}...")
        
        success = generator.generate_single_property_pdf(formatted_prop, filename)
        if success:
            print(f"     ✓ Generated: {filename}")
        else:
            print(f"     ✗ Failed to generate: {filename}")
    
    # Generate catalogue PDF
    print("\nGenerating property catalogue...")
    
    formatted_properties = [format_property_for_pdf(prop) for prop in properties]
    
    success = generator.generate_catalogue_pdf(
        formatted_properties,
        "spurgeon_property_catalogue.pdf",
        "Spurgeon Property - Premium Collection"
    )
    
    if success:
        print("  ✓ Generated: spurgeon_property_catalogue.pdf")
    else:
        print("  ✗ Failed to generate catalogue")
    
    print("\nDemo completed!")
    print("\nGenerated files:")
    print("- property_1_paulshof.pdf")
    print("- property_2_modertefontein.pdf") 
    print("- property_3_jatnel.pdf")
    print("- spurgeon_property_catalogue.pdf")
    
    print("\nIntegration Notes:")
    print("- The PDF generator handles both residential and commercial properties")
    print("- South African Rand (ZAR) currency formatting is supported")
    print("- Property types (apartment, commercial) are handled appropriately")
    print("- Agent information from your database is included")
    print("- To add images, update the 'images' array with actual file paths")

if __name__ == "__main__":
    main()