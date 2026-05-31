#!/usr/bin/env python3
"""Debug script to test PDF generation with real property data"""

import json

def debug_property_data():
    """Debug property data structure"""
    # Test with actual property structure from API
    test_property = {
        "id": 82,
        "title": "Luxury apartment for corporate rental in Palm Gate Umhlanga fully furnished",
        "description": "2 bedrooms 2 bathrooms upstairs lounge downstairs dining room gourmet kitchen two undercover parking's.",
        "price": 25000,  # Converted to number
        "address": "11 Centenary Blvd, Umhlanga Ridge, uMhlanga",
        "suburb": "uMhlanga",
        "city": "Durban",
        "province": "KwaZulu-Natal",
        "propertyType": "apartment",
        "listingType": "rent",
        "bedrooms": 2,
        "bathrooms": 2,
        "area": 85,  # Set proper area
        "features": ["Balcony", "Security Complex", "Furnished"],
        "images": ["/uploads/property-1751627937675-847007781.jpeg"],
        "featuredImage": "/uploads/property-1751627937675-847007781.jpeg",
        "status": "active",
        "agent": {
            "id": 9,
            "name": "Peter Spurgeon",
            "email": "Peter@spurgeonproperty.com",
            "phone": "0842089307",
            "title": "Managing Director"
        }
    }
    
    print("=== PROPERTY DATA DEBUG ===")
    print(f"Title: {test_property['title']}")
    print(f"Price: {test_property['price']} (type: {type(test_property['price'])})")
    print(f"Area: {test_property['area']} (type: {type(test_property['area'])})")
    print(f"Bedrooms: {test_property['bedrooms']}")
    print(f"Bathrooms: {test_property['bathrooms']}")
    print(f"Features: {test_property['features']}")
    print(f"Agent: {test_property['agent']['name']} - {test_property['agent']['phone']}")
    
    # Save test data for PDF generation
    with open('debug_property_data.json', 'w') as f:
        json.dump([test_property], f, indent=2)
    
    print("\nTest data saved to debug_property_data.json")
    return test_property

if __name__ == "__main__":
    debug_property_data()