#!/usr/bin/env python3
"""
Modern Property Catalogue Generator for Social Media
Creates professional, eye-catching property catalogues optimized for social media advertising
"""

import json
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
import os
import requests
from PIL import Image as PILImage
import io

# Modern color palette
BRAND_PURPLE = Color(0.545, 0.361, 0.965)  # #8b5cf6
BRAND_ORANGE = Color(0.984, 0.502, 0.227)  # #fb8037
ACCENT_BLUE = Color(0.239, 0.682, 0.914)   # #3dafea
LIGHT_GRAY = Color(0.941, 0.941, 0.941)    # #f0f0f0
DARK_GRAY = Color(0.333, 0.333, 0.333)     # #555555
SUCCESS_GREEN = Color(0.133, 0.694, 0.298) # #22b14c

class ModernPropertyCatalogue:
    def __init__(self, filename="modern_property_catalogue.pdf"):
        self.filename = filename
        self.page_width, self.page_height = A4
        self.margin = 20*mm
        self.styles = self.create_modern_styles()
        
    def create_modern_styles(self):
        """Create modern, professional paragraph styles"""
        styles = getSampleStyleSheet()
        
        # Modern header style with gradient effect
        styles.add(ParagraphStyle(
            name='ModernHeader',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=BRAND_PURPLE,
            alignment=TA_CENTER,
            spaceAfter=20*mm,
            fontName='Helvetica-Bold'
        ))
        
        # Property title style
        styles.add(ParagraphStyle(
            name='PropertyTitle',
            parent=styles['Heading2'],
            fontSize=22,
            textColor=DARK_GRAY,
            alignment=TA_LEFT,
            spaceAfter=8*mm,
            fontName='Helvetica-Bold'
        ))
        
        # Price style with emphasis
        styles.add(ParagraphStyle(
            name='PriceStyle',
            parent=styles['Normal'],
            fontSize=24,
            textColor=BRAND_ORANGE,
            alignment=TA_RIGHT,
            fontName='Helvetica-Bold'
        ))
        
        # Feature highlight style
        styles.add(ParagraphStyle(
            name='FeatureHighlight',
            parent=styles['Normal'],
            fontSize=11,
            textColor=white,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Description style
        styles.add(ParagraphStyle(
            name='Description',
            parent=styles['Normal'],
            fontSize=11,
            textColor=DARK_GRAY,
            alignment=TA_LEFT,
            spaceAfter=6*mm,
            fontName='Helvetica'
        ))
        
        # Contact style
        styles.add(ParagraphStyle(
            name='ContactStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=BRAND_PURPLE,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        return styles
    
    def format_price(self, price):
        """Format price with South African Rand"""
        if not price or price == 0:
            return "POA (Price on Application)"
        try:
            return f"R {int(price):,}"
        except Exception:
            return "POA (Price on Application)"
    
    def get_property_type_color(self, property_type):
        """Get color based on property type"""
        colors = {
            'House': BRAND_PURPLE,
            'Apartment': ACCENT_BLUE,
            'Townhouse': SUCCESS_GREEN,
            'Villa': BRAND_ORANGE,
            'Commercial': DARK_GRAY,
            'Land': Color(0.769, 0.612, 0.204)  # Golden
        }
        return colors.get(property_type, BRAND_PURPLE)
    
    def download_image(self, image_url, max_size=(800, 600)):
        """Download and optimize image for PDF"""
        try:
            if image_url.startswith('/uploads/'):
                # Local file path
                local_path = f".{image_url}"
                if os.path.exists(local_path):
                    img = PILImage.open(local_path)
                    img.thumbnail(max_size, PILImage.Resampling.LANCZOS)
                    return img
            else:
                # URL download
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                img = PILImage.open(io.BytesIO(response.content))
                img.thumbnail(max_size, PILImage.Resampling.LANCZOS)
                return img
        except Exception as e:
            print(f"Error downloading image {image_url}: {e}")
            return None
        
        return None
    
    def create_modern_header(self, canvas, title="Property Portfolio"):
        """Create modern header with gradient background"""
        width, height = A4
        
        # Create gradient background
        gradient_height = 80*mm
        canvas.setFillColor(BRAND_PURPLE)
        canvas.rect(0, height - gradient_height, width, gradient_height, fill=1, stroke=0)
        
        # Add logo area (simulated)
        canvas.setFillColor(white)
        canvas.setFont('Helvetica-Bold', 16)
        canvas.drawString(30*mm, height - 35*mm, "SPURGEON")
        canvas.setFont('Helvetica', 12)
        canvas.drawString(30*mm, height - 45*mm, "Property")
        
        # Title
        canvas.setFillColor(white)
        canvas.setFont('Helvetica-Bold', 28)
        title_width = canvas.stringWidth(title, 'Helvetica-Bold', 28)
        canvas.drawString((width - title_width) / 2, height - 45*mm, title)
        
        # Subtitle
        canvas.setFont('Helvetica', 12)
        subtitle = "Prepared for Spurgeon Property"
        subtitle_width = canvas.stringWidth(subtitle, 'Helvetica', 12)
        canvas.drawString((width - subtitle_width) / 2, height - 55*mm, subtitle)
        
        return gradient_height
    
    def create_property_card(self, canvas, property_data, y_position):
        """Create modern property card layout"""
        width, height = A4
        card_height = 180*mm
        card_margin = 15*mm
        
        # Card background with shadow effect
        canvas.setFillColor(Color(0.9, 0.9, 0.9, alpha=0.3))
        canvas.rect(card_margin - 2*mm, y_position - card_height - 2*mm, 
                   width - 2*card_margin + 4*mm, card_height + 4*mm, fill=1, stroke=0)
        
        canvas.setFillColor(white)
        canvas.setStrokeColor(LIGHT_GRAY)
        canvas.rect(card_margin, y_position - card_height, 
                   width - 2*card_margin, card_height, fill=1, stroke=1)
        
        # Property type badge
        prop_type = property_data.get('propertyType', 'Property')
        type_color = self.get_property_type_color(prop_type)
        canvas.setFillColor(type_color)
        canvas.roundRect(card_margin + 10*mm, y_position - 25*mm, 40*mm, 12*mm, 6*mm, fill=1, stroke=0)
        
        canvas.setFillColor(white)
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawString(card_margin + 15*mm, y_position - 22*mm, prop_type.upper())
        
        # Price
        price_text = self.format_price(property_data.get('salePrice'))
        canvas.setFillColor(BRAND_ORANGE)
        canvas.setFont('Helvetica-Bold', 20)
        price_width = canvas.stringWidth(price_text, 'Helvetica-Bold', 20)
        canvas.drawString(width - card_margin - price_width - 10*mm, y_position - 25*mm, price_text)
        
        # Image area
        img_x = card_margin + 10*mm
        img_y = y_position - 120*mm
        img_width = width - 2*card_margin - 20*mm
        img_height = 70*mm
        
        # Try to add property image
        images = property_data.get('images', [])
        if images:
            try:
                img = self.download_image(images[0])
                if img:
                    # Save temporary image
                    temp_path = f"temp_property_{property_data.get('id', 'unknown')}.jpg"
                    img.save(temp_path, 'JPEG', quality=85)
                    canvas.drawImage(temp_path, img_x, img_y, img_width, img_height, preserveAspectRatio=True)
                    os.remove(temp_path)
                else:
                    # Placeholder for missing image
                    canvas.setFillColor(LIGHT_GRAY)
                    canvas.rect(img_x, img_y, img_width, img_height, fill=1, stroke=1)
                    canvas.setFillColor(DARK_GRAY)
                    canvas.setFont('Helvetica', 12)
                    canvas.drawCentredText(img_x + img_width/2, img_y + img_height/2, "Property Image")
            except Exception as e:
                print(f"Error adding image: {e}")
                # Placeholder
                canvas.setFillColor(LIGHT_GRAY)
                canvas.rect(img_x, img_y, img_width, img_height, fill=1, stroke=1)
        else:
            # No image placeholder
            canvas.setFillColor(LIGHT_GRAY)
            canvas.rect(img_x, img_y, img_width, img_height, fill=1, stroke=1)
            canvas.setFillColor(DARK_GRAY)
            canvas.setFont('Helvetica', 12)
            canvas.drawCentredText(img_x + img_width/2, img_y + img_height/2, "Property Image")
        
        # Property details
        title = property_data.get('title', 'Property Title')
        canvas.setFillColor(DARK_GRAY)
        canvas.setFont('Helvetica-Bold', 16)
        
        # Wrap title if too long
        max_title_width = img_width
        if canvas.stringWidth(title, 'Helvetica-Bold', 16) > max_title_width:
            words = title.split()
            lines = []
            current_line = ""
            for word in words:
                test_line = current_line + " " + word if current_line else word
                if canvas.stringWidth(test_line, 'Helvetica-Bold', 16) <= max_title_width:
                    current_line = test_line
                else:
                    if current_line:
                        lines.append(current_line)
                    current_line = word
            if current_line:
                lines.append(current_line)
            
            for i, line in enumerate(lines[:2]):  # Max 2 lines
                canvas.drawString(img_x, img_y - 15*mm - i*6*mm, line)
        else:
            canvas.drawString(img_x, img_y - 15*mm, title)
        
        # Location
        address = property_data.get('address', '')
        suburb = property_data.get('suburb', '')
        location = f"{address}, {suburb}".strip(', ')
        
        canvas.setFont('Helvetica', 10)
        canvas.setFillColor(Color(0.4, 0.4, 0.4))
        canvas.drawString(img_x, img_y - 25*mm, f"📍 {location}")
        
        # Property specs in modern boxes
        specs_y = img_y - 40*mm
        bedrooms = property_data.get('bedrooms')
        bathrooms = property_data.get('bathrooms')
        floor_area = property_data.get('floorArea')
        
        spec_box_width = 35*mm
        spec_box_height = 20*mm
        spec_spacing = 10*mm
        
        specs = []
        if bedrooms:
            specs.append(('🛏️', str(bedrooms), 'Bedrooms'))
        if bathrooms:
            specs.append(('🚿', str(bathrooms), 'Bathrooms'))
        if floor_area:
            specs.append(('📐', f"{floor_area}m²", 'Area'))
        
        for i, (icon, value, label) in enumerate(specs[:3]):
            x_pos = img_x + i * (spec_box_width + spec_spacing)
            
            # Spec box background
            canvas.setFillColor(Color(0.95, 0.95, 0.95))
            canvas.roundRect(x_pos, specs_y, spec_box_width, spec_box_height, 4*mm, fill=1, stroke=0)
            
            # Icon and value
            canvas.setFillColor(BRAND_PURPLE)
            canvas.setFont('Helvetica-Bold', 14)
            canvas.drawCentredText(x_pos + spec_box_width/2, specs_y + 12*mm, f"{icon} {value}")
            
            # Label
            canvas.setFillColor(DARK_GRAY)
            canvas.setFont('Helvetica', 8)
            canvas.drawCentredText(x_pos + spec_box_width/2, specs_y + 4*mm, label)
        
        # Features
        features = property_data.get('features', [])
        if features:
            canvas.setFillColor(DARK_GRAY)
            canvas.setFont('Helvetica-Bold', 10)
            canvas.drawString(img_x, specs_y - 15*mm, "Key Features:")
            
            canvas.setFont('Helvetica', 9)
            feature_text = " • ".join(features[:6])  # Limit features
            # Wrap features if too long
            max_width = img_width
            if canvas.stringWidth(feature_text, 'Helvetica', 9) > max_width:
                words = feature_text.split()
                lines = []
                current_line = ""
                for word in words:
                    test_line = current_line + " " + word if current_line else word
                    if canvas.stringWidth(test_line, 'Helvetica', 9) <= max_width:
                        current_line = test_line
                    else:
                        if current_line:
                            lines.append(current_line)
                        current_line = word
                if current_line:
                    lines.append(current_line)
                
                for i, line in enumerate(lines[:2]):
                    canvas.drawString(img_x, specs_y - 25*mm - i*4*mm, line)
            else:
                canvas.drawString(img_x, specs_y - 25*mm, feature_text)
        
        # Agent contact
        agent = property_data.get('agent')
        if agent:
            contact_y = y_position - card_height + 15*mm
            
            # Contact background
            canvas.setFillColor(BRAND_PURPLE)
            canvas.rect(card_margin, contact_y - 5*mm, width - 2*card_margin, 20*mm, fill=1, stroke=0)
            
            canvas.setFillColor(white)
            canvas.setFont('Helvetica-Bold', 10)
            canvas.drawString(card_margin + 10*mm, contact_y + 8*mm, "Contact Agent:")
            
            canvas.setFont('Helvetica', 10)
            agent_name = agent.get('name', 'Spurgeon Property')
            phone = agent.get('phone', '+27-11-040-9507')
            canvas.drawString(card_margin + 10*mm, contact_y + 2*mm, f"{agent_name} - {phone}")
        
        return card_height + 20*mm  # Return height used
    
    def create_footer(self, canvas):
        """Create modern footer"""
        width, height = A4
        footer_height = 40*mm
        
        # Footer background
        canvas.setFillColor(BRAND_PURPLE)
        canvas.rect(0, 0, width, footer_height, fill=1, stroke=0)
        
        # Footer content
        canvas.setFillColor(white)
        canvas.setFont('Helvetica-Bold', 14)
        canvas.drawCentredText(width/2, footer_height/2 + 8*mm, "Your Gateway to Premium Properties")
        
        canvas.setFont('Helvetica', 10)
        canvas.drawCentredText(width/2, footer_height/2, "info@spurgeonproperty.co.za")
        canvas.drawCentredText(width/2, footer_height/2 - 6*mm, "www.spurgeonproperty.co.za")
        canvas.drawCentredText(width/2, footer_height/2 - 12*mm, "Professional Property Services Since 2020")
    
    def generate_catalogue(self, properties_data):
        """Generate the complete modern catalogue"""
        if not properties_data:
            print("No properties data provided")
            return False
        
        try:
            # Create PDF with custom canvas
            pdf_canvas = canvas.Canvas(self.filename, pagesize=A4)
            width, height = A4
            
            # First page with header
            header_height = self.create_modern_header(pdf_canvas, "Property Portfolio")
            current_y = height - header_height - 20*mm
            
            properties_per_page = 2
            property_count = 0
            
            for property_data in properties_data:
                # Check if we need a new page
                if property_count > 0 and property_count % properties_per_page == 0:
                    self.create_footer(pdf_canvas)
                    pdf_canvas.showPage()
                    current_y = height - 20*mm
                
                # Add property card
                card_height = self.create_property_card(pdf_canvas, property_data, current_y)
                current_y -= card_height
                property_count += 1
                
                # Check if we have space for another property
                if current_y < 100*mm:  # Not enough space
                    self.create_footer(pdf_canvas)
                    pdf_canvas.showPage()
                    current_y = height - 20*mm
            
            # Final footer
            self.create_footer(pdf_canvas)
            pdf_canvas.save()
            
            print(f"Modern catalogue created successfully: {self.filename}")
            return True
            
        except Exception as e:
            print(f"Error creating catalogue: {e}")
            return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python create_modern_catalogue.py <properties_json_file>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    try:
        with open(json_file, 'r') as f:
            properties_data = json.load(f)
        
        # Create catalogue
        catalogue = ModernPropertyCatalogue("spurgeon_modern_catalogue.pdf")
        success = catalogue.generate_catalogue(properties_data)
        
        if success:
            print("Modern property catalogue generated successfully!")
            print("File: spurgeon_modern_catalogue.pdf")
        else:
            print("Failed to generate catalogue")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()