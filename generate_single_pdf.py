#!/usr/bin/env python3
"""
Single Property PDF Generator Script
Called by Node.js backend to generate individual property PDFs
"""

import sys
import json
import os
from property_pdf_generator import PropertyPDFGenerator

def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_single_pdf.py <data_file> <output_file>")
        sys.exit(1)
    
    data_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        # Load property data from JSON file
        with open(data_file, 'r', encoding='utf-8') as f:
            property_data = json.load(f)
        
        # Initialize PDF generator with Spurgeon Property branding
        logo_path = os.path.join(os.path.dirname(__file__), 'client', 'public', 'spurgeon-property-logo.png')
        if not os.path.exists(logo_path):
            logo_path = None  # Fallback to text-based branding
        
        generator = PropertyPDFGenerator(
            company_name="Spurgeon Property",
            logo_path=logo_path
        )
        
        # Generate PDF
        success = generator.generate_single_property_pdf(property_data, output_file)
        
        if success:
            print(f"PDF generated successfully: {output_file}")
            sys.exit(0)
        else:
            print("Failed to generate PDF")
            sys.exit(1)
            
    except FileNotFoundError as e:
        print(f"File not found: {e}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON data: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error generating PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()