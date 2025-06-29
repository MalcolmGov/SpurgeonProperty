"""
Test Python PDF generator with actual property data from the database
"""
import json
import sys
from property_pdf_generator import PropertyPDFGenerator

def test_with_actual_data():
    """Test PDF generation with real property data structure"""
    
    # Sample data that matches the actual database structure
    properties_data = [
        {
            "title": "Stunning, fully furnished apartment for sale in Paulshof",
            "price": 1650000,
            "currency": "ZAR",
            "bedrooms": 2,
            "bathrooms": 2,
            "area": 120,
            "description": "Two bedroom, two bathroom apartment for sale in Paulshof. This beautifully appointed apartment offers modern living at its finest with spectacular finishes and attention to detail throughout.",
            "features": ["Fully furnished", "Modern kitchen", "Built-in wardrobes", "Balcony with views", "24/7 security", "Swimming pool", "Gym facilities", "Covered parking"],
            "address": "123 Paulshof Drive, Paulshof, Sandton, Gauteng",
            "images": [],  # Will work without images
            "agent": {
                "name": "Reshma Kila", 
                "title": "Real Estate Agent",
                "phone": "+27 11 234 5678",
                "email": "reshma.kila@evogroup.co.za"
            }
        },
        {
            "title": "Penthouse with spectacular views",
            "price": 3500000,
            "currency": "ZAR", 
            "bedrooms": 3,
            "bathrooms": 3,
            "area": 200,
            "description": "Luxurious penthouse offering panoramic views and premium finishes throughout. Perfect for executive living with world-class amenities.",
            "features": ["Penthouse level", "360-degree views", "Private elevator", "Rooftop terrace", "Premium finishes", "Smart home technology"],
            "address": "456 Sandton City, Sandton, Gauteng",
            "images": [],
            "agent": {
                "name": "Veruschkia Barnard",
                "title": "Senior Real Estate Agent", 
                "phone": "+27 11 567 8901",
                "email": "veruschkia@spurgeonproperty.com"
            }
        }
    ]
    
    # Create PDF generator
    generator = PropertyPDFGenerator(company_name="Spurgeon Property")
    
    # Test single property PDF
    print("Generating single property PDF...")
    success1 = generator.generate_single_property_pdf(
        properties_data[0], 
        "test_real_property.pdf"
    )
    print(f"Single property PDF generated: {success1}")
    
    # Test catalogue PDF  
    print("Generating property catalogue PDF...")
    success2 = generator.generate_catalogue_pdf(
        properties_data,
        "test_real_catalogue.pdf",
        "Premium Property Portfolio"
    )
    print(f"Catalogue PDF generated: {success2}")
    
    if success1 and success2:
        print("✅ All PDF generation tests passed!")
        print("Files generated:")
        print("- test_real_property.pdf")
        print("- test_real_catalogue.pdf")
    else:
        print("❌ Some PDF generation tests failed")
        
    return success1 and success2

if __name__ == "__main__":
    test_with_actual_data()