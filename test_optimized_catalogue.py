#!/usr/bin/env python3
"""
Test script for optimized catalogue generation
This script tests the comprehensive PDF catalogue system with multiple properties.
"""

import json
from optimized_catalogue_generator import OptimizedCatalogueGenerator

def create_sample_properties():
    """Create multiple sample properties for comprehensive testing"""
    return [
        {
            "id": 1,
            "title": "Luxury Penthouse in Sandton City Centre",
            "description": "Spectacular 3-bedroom penthouse in the heart of Sandton featuring panoramic city views, premium finishes, and exclusive access to rooftop amenities. This extraordinary residence offers contemporary living at its finest with floor-to-ceiling windows, imported Italian marble, and state-of-the-art smart home technology.",
            "price": 4500000,
            "currency": "ZAR",
            "propertyType": "apartment",
            "listingType": "sale",
            "bedrooms": 3,
            "bathrooms": 3,
            "area": 180,
            "address": "Nelson Mandela Square, Sandton",
            "suburb": "Sandton",
            "city": "Johannesburg",
            "province": "Gauteng",
            "postalCode": "2196",
            "features": [
                "Panoramic city views",
                "Private rooftop terrace",
                "Smart home automation",
                "Italian marble finishes",
                "Double garage",
                "24-hour concierge",
                "Infinity pool access",
                "Gym and spa facilities",
                "Walking distance to Sandton City"
            ],
            "images": [],
            "status": "active",
            "featured": True
        },
        {
            "id": 2,
            "title": "Modern Family Home in Constantia",
            "description": "Exquisite 4-bedroom family residence nestled in the prestigious Constantia wine region. This architecturally designed home combines modern luxury with natural beauty, featuring open-plan living areas, wine cellar, and spectacular mountain views.",
            "price": 6200000,
            "currency": "ZAR",
            "propertyType": "house",
            "listingType": "sale",
            "bedrooms": 4,
            "bathrooms": 4,
            "area": 350,
            "lotSize": 1200,
            "address": "Constantia Main Road, Constantia",
            "suburb": "Constantia",
            "city": "Cape Town",
            "province": "Western Cape",
            "postalCode": "7806",
            "features": [
                "Mountain and vineyard views",
                "Wine cellar",
                "Swimming pool",
                "Guest cottage",
                "Triple garage",
                "Solar power system",
                "Landscaped gardens",
                "Security system",
                "Close to top schools"
            ],
            "images": [],
            "status": "active",
            "featured": True
        },
        {
            "id": 3,
            "title": "Beachfront Apartment in Umhlanga",
            "description": "Stunning 2-bedroom beachfront apartment with direct ocean access and uninterrupted sea views. Located in a prestigious complex with resort-style amenities and world-class facilities.",
            "price": 3800000,
            "currency": "ZAR",
            "propertyType": "apartment",
            "listingType": "sale",
            "bedrooms": 2,
            "bathrooms": 2,
            "area": 120,
            "address": "Lighthouse Road, Umhlanga Rocks",
            "suburb": "Umhlanga",
            "city": "Durban",
            "province": "KwaZulu-Natal",
            "postalCode": "4320",
            "features": [
                "Direct beach access",
                "Ocean views",
                "Resort amenities",
                "Swimming pools",
                "Gym and spa",
                "Underground parking",
                "24-hour security",
                "Restaurant on-site",
                "Walking distance to Gateway"
            ],
            "images": [],
            "status": "active",
            "featured": True
        }
    ]

def main():
    """Test optimized catalogue generation"""
    print("🏠 Testing Optimized Property Catalogue Generation...")
    
    # Create sample properties
    properties = create_sample_properties()
    
    # Initialize generator
    generator = OptimizedCatalogueGenerator()
    
    # Generate optimized catalogue
    output_path = "test_optimized_catalogue.pdf"
    success = generator.generate_optimized_catalogue(
        properties=properties,
        output_path=output_path,
        title="Premium Property Portfolio",
        client_name="VIP Client"
    )
    
    if success:
        print(f"✅ Optimized catalogue generated successfully: {output_path}")
        print("📋 Features included:")
        print("   • Professional cover page with company branding")
        print("   • Comprehensive table of contents")
        print("   • Individual property pages with enhanced layouts")
        print("   • Peter Spurgeon contact information throughout")
        print("   • High-quality image optimization")
        print("   • Consistent professional styling")
        print("   • Headers and footers on every page")
        print(f"   • {len(properties)} properties processed")
    else:
        print("❌ Failed to generate optimized catalogue")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())