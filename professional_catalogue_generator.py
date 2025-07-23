#!/usr/bin/env python3
"""
Professional Property Catalogue Generator
Creates modern, eye-catching catalogues optimized for social media and print
"""

import json
import sys
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import Color, white, black, grey
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus.flowables import Flowable
import os

# Modern color palette (RGB 0-1 values for ReportLab)
BRAND_PURPLE = Color(139/255, 92/255, 246/255)
BRAND_ORANGE = Color(251/255, 128/255, 55/255)
ACCENT_BLUE = Color(61/255, 175/255, 234/255)
LIGHT_GRAY = Color(240/255, 240/255, 240/255)
DARK_GRAY = Color(85/255, 85/255, 85/255)
SUCCESS_GREEN = Color(34/255, 177/255, 76/255)

class PropertyCard(Flowable):
    """Custom flowable for property cards"""
    
    def __init__(self, property_data, width=180*mm, height=120*mm):
        Flowable.__init__(self)
        self.property_data = property_data
        self.width = width
        self.height = height
    
    def format_price(self, price):
        """Format price with South African Rand"""
        if not price or price == 0:
            return "POA"
        try:
            return f"R {int(price):,}"
        except:
            return "POA"
    
    def draw(self):
        """Draw the property card"""
        canvas = self.canv
        
        # Card background with border
        canvas.setStrokeColor(LIGHT_GRAY)
        canvas.setFillColor(white)
        canvas.rect(0, 0, self.width, self.height, fill=1, stroke=1)
        
        # Property type badge
        prop_type = self.property_data.get('propertyType', 'Property')
        canvas.setFillColor(BRAND_PURPLE)
        canvas.rect(10*mm, self.height - 20*mm, 35*mm, 10*mm, fill=1, stroke=0)
        
        canvas.setFillColor(white)
        canvas.setFont('Helvetica-Bold', 8)
        canvas.drawString(12*mm, self.height - 18*mm, prop_type.upper())
        
        # Price
        price_text = self.format_price(self.property_data.get('salePrice'))
        canvas.setFillColor(BRAND_ORANGE)
        canvas.setFont('Helvetica-Bold', 14)
        price_width = canvas.stringWidth(price_text, 'Helvetica-Bold', 14)
        canvas.drawString(self.width - price_width - 10*mm, self.height - 18*mm, price_text)
        
        # Property title
        title = self.property_data.get('title', 'Property Title')
        if len(title) > 50:
            title = title[:47] + "..."
        
        canvas.setFillColor(DARK_GRAY)
        canvas.setFont('Helvetica-Bold', 12)
        
        # Calculate title position and wrap if needed
        max_width = self.width - 20*mm
        if canvas.stringWidth(title, 'Helvetica-Bold', 12) > max_width:
            words = title.split()
            lines = []
            current_line = ""
            for word in words:
                test_line = current_line + " " + word if current_line else word
                if canvas.stringWidth(test_line, 'Helvetica-Bold', 12) <= max_width:
                    current_line = test_line
                else:
                    if current_line:
                        lines.append(current_line)
                    current_line = word
            if current_line:
                lines.append(current_line)
            
            for i, line in enumerate(lines[:2]):  # Max 2 lines
                canvas.drawString(10*mm, self.height - 35*mm - i*5*mm, line)
        else:
            canvas.drawString(10*mm, self.height - 35*mm, title)
        
        # Location
        location_parts = []
        if self.property_data.get('suburb'):
            location_parts.append(self.property_data['suburb'])
        if self.property_data.get('city'):
            location_parts.append(self.property_data['city'])
        
        location = ", ".join(location_parts) if location_parts else "Location Available"
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(grey)
        canvas.drawString(10*mm, self.height - 50*mm, f"📍 {location}")
        
        # Property specs
        specs_y = self.height - 65*mm
        bedrooms = self.property_data.get('bedrooms')
        bathrooms = self.property_data.get('bathrooms')
        floor_area = self.property_data.get('floorArea')
        
        spec_x = 10*mm
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(DARK_GRAY)
        
        if bedrooms:
            canvas.drawString(spec_x, specs_y, f"🛏️ {bedrooms} Bed")
            spec_x += 25*mm
        
        if bathrooms:
            canvas.drawString(spec_x, specs_y, f"🚿 {bathrooms} Bath")
            spec_x += 25*mm
        
        if floor_area:
            canvas.drawString(spec_x, specs_y, f"📐 {floor_area}m²")
        
        # Features
        features = self.property_data.get('features', [])
        if features:
            canvas.setFont('Helvetica', 7)
            canvas.setFillColor(ACCENT_BLUE)
            feature_text = " • ".join(features[:4])  # Limit features
            
            # Wrap features if too long
            max_feature_width = self.width - 20*mm
            if canvas.stringWidth(feature_text, 'Helvetica', 7) > max_feature_width:
                if len(feature_text) > 80:
                    feature_text = feature_text[:77] + "..."
            
            canvas.drawString(10*mm, specs_y - 15*mm, feature_text)
        
        # Agent contact
        agent = self.property_data.get('agent')
        if agent:
            canvas.setFillColor(BRAND_PURPLE)
            canvas.rect(0, 0, self.width, 15*mm, fill=1, stroke=0)
            
            canvas.setFillColor(white)
            canvas.setFont('Helvetica-Bold', 8)
            agent_name = agent.get('name', 'Spurgeon Property')
            phone = agent.get('phone', '+27-11-040-9507')
            canvas.drawString(10*mm, 8*mm, f"Contact: {agent_name}")
            canvas.setFont('Helvetica', 7)
            canvas.drawString(10*mm, 3*mm, phone)

class ModernPropertyCatalogue:
    def __init__(self, filename="spurgeon_professional_catalogue.pdf"):
        self.filename = filename
        self.doc = SimpleDocTemplate(
            filename,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )
        self.styles = self.create_styles()
        self.story = []
    
    def create_styles(self):
        """Create modern paragraph styles"""
        styles = getSampleStyleSheet()
        
        # Header style
        styles.add(ParagraphStyle(
            name='ModernHeader',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=BRAND_PURPLE,
            alignment=TA_CENTER,
            spaceAfter=10*mm,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        styles.add(ParagraphStyle(
            name='Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=DARK_GRAY,
            alignment=TA_CENTER,
            spaceAfter=15*mm,
            fontName='Helvetica'
        ))
        
        # Footer style
        styles.add(ParagraphStyle(
            name='Footer',
            parent=styles['Normal'],
            fontSize=10,
            textColor=white,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        return styles
    
    def add_header(self):
        """Add catalogue header"""
        # Company logo/name
        logo_table = Table([
            ['SPURGEON', 'Property Portfolio'],
            ['Property', 'Prepared for Spurgeon Property']
        ], colWidths=[40*mm, 130*mm])
        
        logo_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 16),
            ('FONTSIZE', (0, 1), (0, 1), 10),
            ('FONTSIZE', (1, 0), (1, 0), 20),
            ('FONTSIZE', (1, 1), (1, 1), 10),
            ('TEXTCOLOR', (0, 0), (0, 1), BRAND_PURPLE),
            ('TEXTCOLOR', (1, 0), (1, 0), BRAND_ORANGE),
            ('TEXTCOLOR', (1, 1), (1, 1), DARK_GRAY),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), white),
            ('GRID', (0, 0), (-1, -1), 1, LIGHT_GRAY),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        self.story.append(logo_table)
        self.story.append(Spacer(1, 15*mm))
    
    def add_property_grid(self, properties_data):
        """Add properties in grid layout"""
        # Group properties in rows of 2
        for i in range(0, len(properties_data), 2):
            row_properties = properties_data[i:i+2]
            
            # Create property cards
            cards = []
            for prop in row_properties:
                cards.append(PropertyCard(prop))
            
            # If odd number, add empty cell
            if len(cards) == 1:
                cards.append("")
            
            # Create table row
            property_table = Table([cards], colWidths=[90*mm, 90*mm])
            property_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 5*mm),
                ('RIGHTPADDING', (0, 0), (-1, -1), 5*mm),
                ('TOPPADDING', (0, 0), (-1, -1), 5*mm),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5*mm),
            ]))
            
            self.story.append(KeepTogether(property_table))
            self.story.append(Spacer(1, 10*mm))
    
    def add_footer(self):
        """Add catalogue footer"""
        footer_table = Table([
            ['Your Gateway to Premium Properties'],
            ['info@spurgeonproperty.co.za • www.spurgeonproperty.co.za'],
            ['Professional Property Services Since 2020']
        ], colWidths=[170*mm])
        
        footer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BRAND_PURPLE),
            ('TEXTCOLOR', (0, 0), (-1, -1), white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 14),
            ('FONTSIZE', (0, 1), (0, 1), 10),
            ('FONTSIZE', (0, 2), (0, 2), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        self.story.append(Spacer(1, 10*mm))
        self.story.append(footer_table)
    
    def generate_catalogue(self, properties_data):
        """Generate the complete catalogue"""
        if not properties_data:
            print("No properties data provided")
            return False
        
        try:
            # Add header
            self.add_header()
            
            # Add properties
            self.add_property_grid(properties_data)
            
            # Add footer
            self.add_footer()
            
            # Build PDF
            self.doc.build(self.story)
            
            print(f"Professional catalogue created: {self.filename}")
            return True
            
        except Exception as e:
            print(f"Error creating catalogue: {e}")
            import traceback
            traceback.print_exc()
            return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python professional_catalogue_generator.py <properties_json_file>")
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
        
        # Create catalogue
        catalogue = ModernPropertyCatalogue()
        success = catalogue.generate_catalogue(properties_data)
        
        if success:
            print("Professional property catalogue generated successfully!")
            print("File: spurgeon_professional_catalogue.pdf")
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