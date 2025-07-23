#!/usr/bin/env python3
"""
HTML Property Catalogue Generator
Creates modern, professional HTML catalogues optimized for web viewing and printing
"""

import json
import sys
import os

class HTMLPropertyCatalogue:
    def __init__(self, filename="spurgeon_catalogue.html"):
        self.filename = filename
    
    def format_price(self, price):
        """Format price with South African Rand"""
        if not price or price == 0:
            return "POA"
        try:
            return f"R {int(price):,}"
        except:
            return "POA"
    
    def get_property_type_color(self, property_type):
        """Get color class based on property type"""
        colors = {
            'House': 'type-house',
            'Apartment': 'type-apartment', 
            'Townhouse': 'type-townhouse',
            'Villa': 'type-villa',
            'Commercial': 'type-commercial',
            'Land': 'type-land'
        }
        return colors.get(property_type, 'type-default')
    
    def create_property_card(self, property_data):
        """Create HTML for a single property card"""
        images = property_data.get('images', [])
        image_url = images[0] if images else '/uploads/placeholder.jpg'
        
        # Handle local image paths
        if image_url.startswith('/uploads/'):
            image_url = f".{image_url}"
        
        title = property_data.get('title', 'Property Title')
        price = self.format_price(property_data.get('salePrice'))
        property_type = property_data.get('propertyType', 'Property')
        type_class = self.get_property_type_color(property_type)
        
        # Location
        location_parts = []
        if property_data.get('suburb'):
            location_parts.append(property_data['suburb'])
        if property_data.get('city'):
            location_parts.append(property_data['city'])
        location = ", ".join(location_parts) if location_parts else "Location Available"
        
        # Property specs
        specs = []
        if property_data.get('bedrooms'):
            specs.append(f"🛏️ {property_data['bedrooms']} Bed")
        if property_data.get('bathrooms'):
            specs.append(f"🚿 {property_data['bathrooms']} Bath")
        if property_data.get('floorArea'):
            specs.append(f"📐 {property_data['floorArea']}m²")
        
        specs_html = " • ".join(specs) if specs else ""
        
        # Features
        features = property_data.get('features', [])
        features_html = " • ".join(features[:6]) if features else ""
        
        # Agent info
        agent = property_data.get('agent', {})
        agent_name = agent.get('name', 'Spurgeon Property')
        agent_phone = agent.get('phone', '+27-11-040-9507')
        
        return f'''
        <div class="property-card">
            <div class="property-image">
                <img src="{image_url}" alt="{title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KICA8L3N2Zz4K'">
                <div class="property-type-badge {type_class}">{property_type}</div>
                <div class="property-price">{price}</div>
            </div>
            <div class="property-content">
                <h3 class="property-title">{title}</h3>
                <p class="property-location">📍 {location}</p>
                <div class="property-specs">{specs_html}</div>
                <div class="property-features">{features_html}</div>
                <div class="property-agent">
                    <strong>Contact:</strong> {agent_name}<br>
                    <span class="agent-phone">{agent_phone}</span>
                </div>
            </div>
        </div>
        '''
    
    def generate_catalogue(self, properties_data):
        """Generate the complete HTML catalogue"""
        if not properties_data:
            print("No properties data provided")
            return False
        
        try:
            # Generate property cards
            property_cards = ""
            for property_data in properties_data:
                property_cards += self.create_property_card(property_data)
            
            # Complete HTML template
            html_content = f'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spurgeon Property - Portfolio</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #8b5cf6 0%, #fb8037 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        
        .catalogue-container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #8b5cf6 0%, #fb8037 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .logo {{
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        
        .subtitle {{
            font-size: 1.2rem;
            opacity: 0.9;
        }}
        
        .properties-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 30px;
            padding: 40px;
        }}
        
        .property-card {{
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 2px solid #f0f0f0;
        }}
        
        .property-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }}
        
        .property-image {{
            position: relative;
            height: 250px;
            overflow: hidden;
        }}
        
        .property-image img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }}
        
        .property-card:hover .property-image img {{
            transform: scale(1.05);
        }}
        
        .property-type-badge {{
            position: absolute;
            top: 15px;
            left: 15px;
            padding: 8px 16px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 0.85rem;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        
        .type-house {{ background: #8b5cf6; }}
        .type-apartment {{ background: #3dafea; }}
        .type-townhouse {{ background: #22b14c; }}
        .type-villa {{ background: #fb8037; }}
        .type-commercial {{ background: #555555; }}
        .type-land {{ background: #c49c34; }}
        .type-default {{ background: #8b5cf6; }}
        
        .property-price {{
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(251, 128, 55, 0.95);
            color: white;
            padding: 10px 16px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.1rem;
            backdrop-filter: blur(10px);
        }}
        
        .property-content {{
            padding: 25px;
        }}
        
        .property-title {{
            font-size: 1.3rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }}
        
        .property-location {{
            color: #666;
            margin-bottom: 15px;
            font-size: 0.95rem;
        }}
        
        .property-specs {{
            background: #f8f9ff;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 15px;
            font-weight: 600;
            color: #8b5cf6;
            border-left: 4px solid #8b5cf6;
        }}
        
        .property-features {{
            color: #3dafea;
            font-size: 0.9rem;
            margin-bottom: 20px;
            line-height: 1.5;
        }}
        
        .property-agent {{
            background: linear-gradient(135deg, #8b5cf6 0%, #fb8037 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-size: 0.9rem;
        }}
        
        .agent-phone {{
            font-weight: bold;
            color: #fff;
        }}
        
        .footer {{
            background: linear-gradient(135deg, #8b5cf6 0%, #fb8037 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        
        .footer h3 {{
            margin-bottom: 10px;
            font-size: 1.4rem;
        }}
        
        .footer p {{
            opacity: 0.9;
            margin-bottom: 5px;
        }}
        
        @media (max-width: 768px) {{
            .properties-grid {{
                grid-template-columns: 1fr;
                gap: 20px;
                padding: 20px;
            }}
            
            .header {{
                padding: 30px 20px;
            }}
            
            .logo {{
                font-size: 2rem;
            }}
        }}
        
        @media print {{
            body {{
                background: white;
            }}
            
            .catalogue-container {{
                box-shadow: none;
                border-radius: 0;
            }}
            
            .property-card {{
                break-inside: avoid;
                page-break-inside: avoid;
            }}
        }}
    </style>
</head>
<body>
    <div class="catalogue-container">
        <div class="header">
            <div class="logo">SPURGEON Property</div>
            <div class="subtitle">Property Portfolio - Prepared for Spurgeon Property</div>
        </div>
        
        <div class="properties-grid">
            {property_cards}
        </div>
        
        <div class="footer">
            <h3>Your Gateway to Premium Properties</h3>
            <p>info@spurgeonproperty.co.za • www.spurgeonproperty.co.za</p>
            <p>Professional Property Services Since 2020</p>
        </div>
    </div>
</body>
</html>
            '''
            
            # Write HTML file
            with open(self.filename, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"HTML catalogue created: {self.filename}")
            return True
            
        except Exception as e:
            print(f"Error creating HTML catalogue: {e}")
            import traceback
            traceback.print_exc()
            return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python create_html_catalogue.py <properties_json_file>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        # Handle both list and object formats
        if isinstance(data, list):
            properties_data = data
        elif isinstance(data, dict) and 'properties' in data:
            properties_data = data['properties']
        else:
            properties_data = [data] if data else []
        
        # Create HTML catalogue
        catalogue = HTMLPropertyCatalogue()
        success = catalogue.generate_catalogue(properties_data)
        
        if success:
            print("HTML property catalogue generated successfully!")
            print("File: spurgeon_catalogue.html")
            print("Open the HTML file in your browser to view the catalogue")
        else:
            print("Failed to generate catalogue")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()