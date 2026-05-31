#!/usr/bin/env python3
"""
Professional Property Listing PDF Generator using ReportLab
Generates visually stunning property PDFs with modern design and professional typography
"""

import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image as PILImage
import io

class PropertyPDFGenerator:
    """Professional property listing PDF generator with modern design"""
    
    # Color scheme
    PRIMARY_BLUE = HexColor('#1a365d')
    SECONDARY_GRAY = HexColor('#f7fafc') 
    ACCENT_RED = HexColor('#e53e3e')
    TEXT_GRAY = HexColor('#2d3748')
    MEDIUM_GRAY = HexColor('#4a5568')
    
    # Typography settings
    HEADLINE_SIZE = 24
    SUBHEADING_SIZE = 16
    BODY_SIZE = 11
    PRICE_SIZE = 20
    
    # Layout constants
    MARGIN = 1 * inch
    HERO_WIDTH = 6.5 * inch
    HERO_HEIGHT = 4 * inch
    THUMBNAIL_WIDTH = 2 * inch
    THUMBNAIL_HEIGHT = 1.5 * inch
    LOGO_WIDTH = 1.5 * inch
    LOGO_HEIGHT = 0.75 * inch
    
    def __init__(self, company_name: str = "Spurgeon Property", logo_path: Optional[str] = None):
        """Initialize the PDF generator with company branding"""
        self.company_name = company_name
        self.logo_path = logo_path
        self.setup_styles()
    
    def setup_styles(self):
        """Setup custom paragraph styles"""
        self.styles = getSampleStyleSheet()
        
        # Headline style
        self.styles.add(ParagraphStyle(
            'PropertyHeadline',
            parent=self.styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=self.HEADLINE_SIZE,
            textColor=self.PRIMARY_BLUE,
            spaceBefore=12,
            spaceAfter=12,
            alignment=TA_LEFT
        ))
        
        # Price style
        self.styles.add(ParagraphStyle(
            'Price',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=self.PRICE_SIZE,
            textColor=self.ACCENT_RED,
            spaceBefore=6,
            spaceAfter=6,
            alignment=TA_LEFT
        ))
        
        # Subheading style
        self.styles.add(ParagraphStyle(
            'PropertySubheading',
            parent=self.styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=self.SUBHEADING_SIZE,
            textColor=self.MEDIUM_GRAY,
            spaceBefore=10,
            spaceAfter=6,
            alignment=TA_LEFT
        ))
        
        # Body text style
        self.styles.add(ParagraphStyle(
            'PropertyBody',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=self.BODY_SIZE,
            textColor=self.TEXT_GRAY,
            spaceBefore=3,
            spaceAfter=6,
            alignment=TA_JUSTIFY,
            leading=14
        ))
        
        # Feature list style
        self.styles.add(ParagraphStyle(
            'FeatureList',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=self.BODY_SIZE,
            textColor=self.TEXT_GRAY,
            spaceBefore=2,
            spaceAfter=2,
            leftIndent=20,
            bulletIndent=10,
            alignment=TA_LEFT
        ))
        
        # Contact info style
        self.styles.add(ParagraphStyle(
            'ContactInfo',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=self.BODY_SIZE - 1,
            textColor=self.TEXT_GRAY,
            spaceBefore=2,
            spaceAfter=2,
            alignment=TA_LEFT
        ))

    def optimize_image(self, image_path: str, max_width: float, max_height: float) -> Optional[ImageReader]:
        """Optimize image for PDF inclusion"""
        try:
            if not os.path.exists(image_path):
                return None
                
            # Open and optimize image
            with PILImage.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = PILImage.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Calculate optimal size maintaining aspect ratio
                aspect_ratio = img.width / img.height
                if max_width / max_height > aspect_ratio:
                    new_height = max_height
                    new_width = new_height * aspect_ratio
                else:
                    new_width = max_width
                    new_height = new_width / aspect_ratio
                
                # Resize image
                img_resized = img.resize((int(new_width * 2), int(new_height * 2)), PILImage.Resampling.LANCZOS)
                
                # Save to bytes
                img_bytes = io.BytesIO()
                img_resized.save(img_bytes, format='JPEG', quality=95, optimize=True)
                img_bytes.seek(0)
                
                return ImageReader(img_bytes)
        except Exception as e:
            print(f"Error optimizing image {image_path}: {e}")
            return None

    def format_price(self, price, currency: str = "USD") -> str:
        """Format price with currency symbol"""
        # Convert price to float if it's a string
        try:
            price_float = float(str(price).replace(',', '').replace(' ', ''))
        except (ValueError, TypeError):
            price_float = 0.0
            
        currency_symbols = {
            'USD': '$',
            'ZAR': 'R',
            'EUR': '€',
            'GBP': '£'
        }
        symbol = currency_symbols.get(currency, currency)
        
        if price_float >= 1000000:
            return f"{symbol}{price_float/1000000:.1f}M"
        elif price_float >= 1000:
            return f"{symbol}{price_float/1000:.0f}K" if price_float % 1000 == 0 else f"{symbol}{price_float:,.0f}"
        else:
            return f"{symbol}{price_float:,.0f}"

    class PropertyCanvas(canvas.Canvas):
        """Custom canvas for property PDFs with headers and footers"""
        
        def __init__(self, *args, **kwargs):
            self.generator = kwargs.pop('generator', None)
            canvas.Canvas.__init__(self, *args, **kwargs)
            
        def showPage(self):
            self._draw_header()
            self._draw_footer()
            canvas.Canvas.showPage(self)
            
        def _draw_header(self):
            """Draw header with logo and company name"""
            if self.generator and self.generator.logo_path and os.path.exists(self.generator.logo_path):
                # Draw logo in top-right corner
                logo_img = self.generator.optimize_image(
                    self.generator.logo_path, 
                    self.generator.LOGO_WIDTH, 
                    self.generator.LOGO_HEIGHT
                )
                if logo_img:
                    self.drawImage(
                        logo_img,
                        letter[0] - self.generator.MARGIN - self.generator.LOGO_WIDTH,
                        letter[1] - self.generator.MARGIN - self.generator.LOGO_HEIGHT,
                        width=self.generator.LOGO_WIDTH,
                        height=self.generator.LOGO_HEIGHT
                    )
            else:
                # Draw company name if no logo
                self.setFont('Helvetica-Bold', 12)
                self.setFillColor(self.generator.PRIMARY_BLUE)
                self.drawRightString(
                    letter[0] - self.generator.MARGIN,
                    letter[1] - self.generator.MARGIN - 20,
                    self.generator.company_name
                )
                
        def _draw_footer(self):
            """Draw footer with page numbers and branding"""
            self.setFont('Helvetica', 9)
            self.setFillColor(self.generator.MEDIUM_GRAY)
            
            # Page number
            page_num = self.getPageNumber()
            self.drawRightString(
                letter[0] - self.generator.MARGIN,
                self.generator.MARGIN / 2,
                f"Page {page_num}"
            )
            
            # Company branding
            self.drawString(
                self.generator.MARGIN,
                self.generator.MARGIN / 2,
                f"© {datetime.now().year} {self.generator.company_name}"
            )

    def generate_single_property_pdf(self, property_data: Dict[str, Any], output_path: str) -> bool:
        """Generate a single property listing PDF"""
        try:
            # Create document with custom canvas
            doc = SimpleDocTemplate(
                output_path,
                pagesize=letter,
                rightMargin=self.MARGIN,
                leftMargin=self.MARGIN,
                topMargin=self.MARGIN + 30,
                bottomMargin=self.MARGIN + 30,
                canvasmaker=lambda *args, **kwargs: self.PropertyCanvas(*args, generator=self, **kwargs)
            )
            
            story = []
            
            # Hero image
            if property_data.get('images') and len(property_data['images']) > 0:
                hero_image_path = property_data['images'][0]
                if os.path.exists(hero_image_path):
                    try:
                        hero_img = Image(hero_image_path, width=self.HERO_WIDTH, height=self.HERO_HEIGHT)
                        story.append(hero_img)
                        story.append(Spacer(1, 0.25 * inch))
                    except Exception as e:
                        print(f"Warning: Could not load hero image {hero_image_path}: {e}")
            
            # Property title
            title = Paragraph(property_data.get('title', 'Property Listing'), self.styles['PropertyHeadline'])
            story.append(title)
            
            # Price
            price_text = self.format_price(
                property_data.get('price', 0),
                property_data.get('currency', 'USD')
            )
            price = Paragraph(price_text, self.styles['Price'])
            story.append(price)
            story.append(Spacer(1, 0.25 * inch))
            
            # Property details table
            details_data = []
            if property_data.get('bedrooms'):
                details_data.append(['Bedrooms:', str(property_data['bedrooms'])])
            if property_data.get('bathrooms'):
                details_data.append(['Bathrooms:', str(property_data['bathrooms'])])
            if property_data.get('square_feet'):
                details_data.append(['Square Feet:', f"{property_data['square_feet']:,}"])
            if property_data.get('area'):
                details_data.append(['Area:', f"{property_data['area']} m²"])
            
            if details_data:
                details_table = Table(details_data, colWidths=[1.5*inch, 2*inch])
                details_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), self.BODY_SIZE),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('TEXTCOLOR', (0, 0), (-1, -1), self.TEXT_GRAY),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                    ('TOPPADDING', (0, 0), (-1, -1), 3),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ]))
                story.append(details_table)
                story.append(Spacer(1, 0.25 * inch))
            
            # Description
            if property_data.get('description'):
                desc_heading = Paragraph('Description', self.styles['PropertySubheading'])
                story.append(desc_heading)
                description = Paragraph(property_data['description'], self.styles['PropertyBody'])
                story.append(description)
                story.append(Spacer(1, 0.25 * inch))
            
            # Key Features
            if property_data.get('features'):
                features_heading = Paragraph('Key Features', self.styles['PropertySubheading'])
                story.append(features_heading)
                
                for feature in property_data['features']:
                    feature_item = Paragraph(f"• {feature}", self.styles['FeatureList'])
                    story.append(feature_item)
                story.append(Spacer(1, 0.25 * inch))
            
            # Location
            if property_data.get('address'):
                location_heading = Paragraph('Location', self.styles['PropertySubheading'])
                story.append(location_heading)
                location = Paragraph(property_data['address'], self.styles['PropertyBody'])
                story.append(location)
                story.append(Spacer(1, 0.5 * inch))
            
            # Contact Information
            if property_data.get('agent'):
                agent = property_data['agent']
                contact_heading = Paragraph('Contact Information', self.styles['PropertySubheading'])
                story.append(contact_heading)
                
                contact_info = []
                if agent.get('name'):
                    contact_info.append(f"<b>{agent['name']}</b>")
                if agent.get('title'):
                    contact_info.append(agent['title'])
                if agent.get('phone'):
                    contact_info.append(f"Phone: {agent['phone']}")
                if agent.get('email'):
                    contact_info.append(f"Email: {agent['email']}")
                
                for info in contact_info:
                    contact_para = Paragraph(info, self.styles['ContactInfo'])
                    story.append(contact_para)
            
            # Build PDF
            doc.build(story)
            return True
            
        except Exception as e:
            print(f"Error generating single property PDF: {e}")
            return False

    def generate_catalogue_pdf(self, properties: List[Dict[str, Any]], output_path: str, 
                             catalogue_title: str = "Property Catalogue") -> bool:
        """Generate a multi-property catalogue PDF"""
        try:
            doc = SimpleDocTemplate(
                output_path,
                pagesize=letter,
                rightMargin=self.MARGIN,
                leftMargin=self.MARGIN,
                topMargin=self.MARGIN + 30,
                bottomMargin=self.MARGIN + 30,
                canvasmaker=lambda *args, **kwargs: self.PropertyCanvas(*args, generator=self, **kwargs)
            )
            
            story = []
            
            # Cover page
            story.append(Spacer(1, 2 * inch))
            
            cover_title = Paragraph(catalogue_title, self.styles['PropertyHeadline'])
            cover_title.style.fontSize = 32
            cover_title.style.alignment = TA_CENTER
            story.append(cover_title)
            
            story.append(Spacer(1, 0.5 * inch))
            
            subtitle = Paragraph(f"{len(properties)} Premium Properties", self.styles['PropertySubheading'])
            subtitle.style.alignment = TA_CENTER
            story.append(subtitle)
            
            story.append(Spacer(1, 1 * inch))
            
            date_text = Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", 
                                 self.styles['PropertyBody'])
            date_text.style.alignment = TA_CENTER
            story.append(date_text)
            
            story.append(PageBreak())
            
            # Table of contents
            toc_heading = Paragraph("Table of Contents", self.styles['PropertyHeadline'])
            story.append(toc_heading)
            story.append(Spacer(1, 0.25 * inch))
            
            for i, prop in enumerate(properties, 1):
                toc_item = Paragraph(
                    f"{i}. {prop.get('title', 'Property')} - {self.format_price(prop.get('price', 0), prop.get('currency', 'USD'))}",
                    self.styles['PropertyBody']
                )
                story.append(toc_item)
                
            story.append(PageBreak())
            
            # Property listings (2 per page)
            for i, property_data in enumerate(properties):
                if i > 0 and i % 2 == 0:
                    story.append(PageBreak())
                
                # Property thumbnail and details
                prop_table_data = []
                
                # Image column
                img_cell = ""
                if property_data.get('images') and len(property_data['images']) > 0:
                    img_path = property_data['images'][0]
                    if os.path.exists(img_path):
                        try:
                            img_cell = Image(img_path, width=self.THUMBNAIL_WIDTH, height=self.THUMBNAIL_HEIGHT)
                        except Exception as e:
                            print(f"Warning: Could not load thumbnail {img_path}: {e}")
                            img_cell = ""
                
                # Details column
                details_text = []
                details_text.append(f"<b>{property_data.get('title', 'Property')}</b>")
                details_text.append(f"<font color='{self.ACCENT_RED.hexval()}'><b>{self.format_price(property_data.get('price', 0), property_data.get('currency', 'USD'))}</b></font>")
                
                if property_data.get('bedrooms') and property_data.get('bathrooms'):
                    details_text.append(f"{property_data['bedrooms']} beds, {property_data['bathrooms']} baths")
                
                if property_data.get('square_feet'):
                    details_text.append(f"{property_data['square_feet']:,} sq ft")
                elif property_data.get('area'):
                    details_text.append(f"{property_data['area']} m²")
                
                if property_data.get('address'):
                    details_text.append(property_data['address'])
                
                # Truncate description
                if property_data.get('description'):
                    desc = property_data['description']
                    if len(desc) > 150:
                        desc = desc[:150] + "..."
                    details_text.append(desc)
                
                details_cell = Paragraph("<br/>".join(details_text), self.styles['PropertyBody'])
                
                prop_table_data.append([img_cell, details_cell])
                
                prop_table = Table(prop_table_data, colWidths=[self.THUMBNAIL_WIDTH + 0.5*inch, 4*inch])
                prop_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ]))
                
                story.append(prop_table)
                story.append(Spacer(1, 0.5 * inch))
            
            # Contact directory
            story.append(PageBreak())
            contact_heading = Paragraph("Contact Directory", self.styles['PropertyHeadline'])
            story.append(contact_heading)
            story.append(Spacer(1, 0.25 * inch))
            
            # Collect unique agents
            agents = {}
            for prop in properties:
                if prop.get('agent'):
                    agent_email = prop['agent'].get('email', '')
                    if agent_email and agent_email not in agents:
                        agents[agent_email] = prop['agent']
            
            for agent in agents.values():
                agent_info = []
                if agent.get('name'):
                    agent_info.append(f"<b>{agent['name']}</b>")
                if agent.get('title'):
                    agent_info.append(agent['title'])
                if agent.get('phone'):
                    agent_info.append(f"Phone: {agent['phone']}")
                if agent.get('email'):
                    agent_info.append(f"Email: {agent['email']}")
                
                agent_para = Paragraph("<br/>".join(agent_info), self.styles['ContactInfo'])
                story.append(agent_para)
                story.append(Spacer(1, 0.25 * inch))
            
            # Build PDF
            doc.build(story)
            return True
            
        except Exception as e:
            print(f"Error generating catalogue PDF: {e}")
            return False

def main():
    """Demo function showing how to use the PropertyPDFGenerator"""
    
    # Sample property data
    sample_property = {
        'title': 'Modern Family Home in Prime Location',
        'price': 450000,
        'currency': 'USD',
        'bedrooms': 4,
        'bathrooms': 3,
        'square_feet': 2500,
        'description': 'Beautiful modern home with stunning architecture and premium finishes throughout. This property features an open-concept living area, gourmet kitchen with granite countertops, and spacious bedrooms with walk-in closets. The master suite includes a luxurious en-suite bathroom and private balcony overlooking the landscaped garden.',
        'features': [
            'Granite countertops',
            'Hardwood floors throughout',
            'Two-car garage',
            'Central air conditioning',
            'Fireplace in living room',
            'Walk-in closets',
            'Landscaped garden',
            'Security system'
        ],
        'address': '123 Main Street, Anytown, State 12345',
        'images': [],  # Add actual image paths here
        'agent': {
            'name': 'John Smith',
            'title': 'Senior Real Estate Agent',
            'phone': '+1-555-0123',
            'email': 'john.smith@example.com'
        }
    }
    
    # Create generator instance
    generator = PropertyPDFGenerator(
        company_name="Spurgeon Property",
        logo_path=None  # Add logo path if available
    )
    
    # Generate single property PDF
    print("Generating single property PDF...")
    success = generator.generate_single_property_pdf(sample_property, "single_property.pdf")
    if success:
        print("✓ Single property PDF generated successfully: single_property.pdf")
    else:
        print("✗ Failed to generate single property PDF")
    
    # Generate catalogue PDF with multiple properties
    print("\nGenerating property catalogue PDF...")
    properties = [sample_property.copy() for _ in range(3)]
    properties[1]['title'] = 'Luxury Condo Downtown'
    properties[1]['price'] = 320000
    properties[1]['bedrooms'] = 2
    properties[1]['bathrooms'] = 2
    properties[1]['square_feet'] = 1200
    
    properties[2]['title'] = 'Charming Suburban Home'
    properties[2]['price'] = 280000
    properties[2]['bedrooms'] = 3
    properties[2]['bathrooms'] = 2
    properties[2]['square_feet'] = 1800
    
    success = generator.generate_catalogue_pdf(properties, "property_catalogue.pdf", "Premium Property Collection")
    if success:
        print("✓ Property catalogue PDF generated successfully: property_catalogue.pdf")
    else:
        print("✗ Failed to generate property catalogue PDF")

if __name__ == "__main__":
    main()