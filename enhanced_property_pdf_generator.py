"""
Enhanced Professional Property Listing PDF Generator using ReportLab
Generates visually stunning property PDFs with modern design, branding, and comprehensive property information
"""

import os
import sys
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, 
    Table, TableStyle, PageBreak
)
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image as PILImage

class EnhancedPropertyPDFGenerator:
    """Enhanced professional property listing PDF generator with comprehensive branding and design"""
    
    # Spurgeon Property Brand Colors
    BRAND_PURPLE = HexColor('#8b5cf6')
    BRAND_ORANGE = HexColor('#f97316')
    PRIMARY_BLUE = HexColor('#1a365d')
    SECONDARY_GRAY = HexColor('#f7fafc') 
    ACCENT_RED = HexColor('#e53e3e')
    TEXT_GRAY = HexColor('#2d3748')
    MEDIUM_GRAY = HexColor('#4a5568')
    LIGHT_GRAY = HexColor('#e2e8f0')
    SUCCESS_GREEN = HexColor('#38a169')
    
    # Typography
    HEADLINE_SIZE = 28
    TITLE_SIZE = 22
    SUBHEADING_SIZE = 16
    BODY_SIZE = 11
    CAPTION_SIZE = 9
    PRICE_SIZE = 24
    
    # Layout constants
    MARGIN = 0.75 * inch
    HERO_WIDTH = 7 * inch
    HERO_HEIGHT = 4.5 * inch
    THUMBNAIL_WIDTH = 2.2 * inch
    THUMBNAIL_HEIGHT = 1.8 * inch
    LOGO_SIZE = 1.2 * inch
    
    def __init__(self, company_name: str = "SPURGEON Property", logo_path: Optional[str] = None):
        """Initialize the enhanced PDF generator with company branding"""
        self.company_name = company_name
        self.logo_path = logo_path
        self.styles = {}
        self.setup_styles()
    
    def setup_styles(self):
        """Setup comprehensive custom paragraph styles with modern typography"""
        base_styles = getSampleStyleSheet()
        
        # Brand Title Style
        self.styles['BrandTitle'] = ParagraphStyle(
            'BrandTitle',
            parent=base_styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=self.HEADLINE_SIZE,
            textColor=self.BRAND_PURPLE,
            alignment=TA_CENTER,
            spaceAfter=20,
            spaceBefore=10
        )
        
        # Catalogue Title
        self.styles['CatalogueTitle'] = ParagraphStyle(
            'CatalogueTitle',
            parent=base_styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=self.TITLE_SIZE,
            textColor=self.PRIMARY_BLUE,
            alignment=TA_CENTER,
            spaceAfter=15,
            spaceBefore=10
        )
        
        # Property Heading
        self.styles['PropertyHeading'] = ParagraphStyle(
            'PropertyHeading',
            parent=base_styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=18,
            textColor=self.PRIMARY_BLUE,
            spaceAfter=12,
            spaceBefore=8
        )
        
        # Property Subheading
        self.styles['PropertySubheading'] = ParagraphStyle(
            'PropertySubheading',
            parent=base_styles['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=self.SUBHEADING_SIZE,
            textColor=self.BRAND_PURPLE,
            spaceAfter=8,
            spaceBefore=6
        )
        
        # Price Highlight
        self.styles['PriceHighlight'] = ParagraphStyle(
            'PriceHighlight',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=self.PRICE_SIZE,
            textColor=self.BRAND_ORANGE,
            spaceAfter=12
        )
        
        # Body Text
        self.styles['PropertyBody'] = ParagraphStyle(
            'PropertyBody',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=self.BODY_SIZE,
            textColor=self.TEXT_GRAY,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            leading=14
        )
        
        # Feature List
        self.styles['FeatureList'] = ParagraphStyle(
            'FeatureList',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=self.BODY_SIZE,
            textColor=self.TEXT_GRAY,
            leftIndent=12,
            spaceAfter=4,
            bulletIndent=8
        )
        
        # Caption Style
        self.styles['Caption'] = ParagraphStyle(
            'Caption',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=self.CAPTION_SIZE,
            textColor=self.MEDIUM_GRAY,
            alignment=TA_CENTER,
            spaceAfter=6
        )
        
        # Contact Info
        self.styles['ContactInfo'] = ParagraphStyle(
            'ContactInfo',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=self.BODY_SIZE,
            textColor=self.TEXT_GRAY,
            spaceAfter=6,
            leading=16
        )
    
    def optimize_image(self, image_path: str, max_width: float, max_height: float) -> Optional[ImageReader]:
        """Optimize and resize image for PDF inclusion with better quality"""
        try:
            if not os.path.exists(image_path):
                print(f"Image not found: {image_path}")
                return None
                
            # Open and process image
            with PILImage.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Calculate aspect ratio preserving resize
                img_width, img_height = img.size
                aspect_ratio = img_width / img_height
                
                if aspect_ratio > max_width / max_height:
                    new_width = max_width
                    new_height = max_width / aspect_ratio
                else:
                    new_height = max_height
                    new_width = max_height * aspect_ratio
                
                # Resize with high quality
                img_resized = img.resize((int(new_width * 72/inch), int(new_height * 72/inch)), PILImage.LANCZOS)
                
                return ImageReader(img_resized)
                
        except Exception as e:
            print(f"Error optimizing image {image_path}: {e}")
            return None
    
    def format_price(self, price, currency: str = "ZAR") -> str:
        """Format price with South African Rand currency symbol"""
        try:
            price_float = float(str(price).replace(',', '').replace(' ', ''))
        except (ValueError, TypeError):
            price_float = 0.0
            
        currency_symbols = {
            'ZAR': 'R',
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        }
        symbol = currency_symbols.get(currency, 'R')
        
        if price_float >= 1000000:
            return f"{symbol}{price_float/1000000:.1f}M"
        elif price_float >= 1000:
            return f"{symbol}{price_float:,.0f}"
        else:
            return f"{symbol}{price_float:,.0f}"
    
    def create_branded_header(self, canvas_obj, doc):
        """Create professional branded header with logo and company info"""
        canvas_obj.saveState()
        
        # Brand header background
        canvas_obj.setFillColor(self.SECONDARY_GRAY)
        canvas_obj.rect(0, letter[1] - 60, letter[0], 60, fill=True, stroke=False)
        
        # Company branding
        canvas_obj.setFont('Helvetica-Bold', 16)
        canvas_obj.setFillColor(self.BRAND_PURPLE)
        canvas_obj.drawString(self.MARGIN, letter[1] - 35, "SPURGEON")
        
        canvas_obj.setFillColor(self.BRAND_ORANGE)
        canvas_obj.drawString(self.MARGIN + 95, letter[1] - 35, "Property")
        
        # Website and tagline
        canvas_obj.setFont('Helvetica', 10)
        canvas_obj.setFillColor(self.MEDIUM_GRAY)
        canvas_obj.drawRightString(letter[0] - self.MARGIN, letter[1] - 25, "www.spurgeonproperty.co.za")
        canvas_obj.drawRightString(letter[0] - self.MARGIN, letter[1] - 40, "Your Gateway to Premium Properties")
        
        canvas_obj.restoreState()
    
    def create_branded_footer(self, canvas_obj, doc):
        """Create professional branded footer with Peter Spurgeon contact info"""
        canvas_obj.saveState()
        
        # Footer background with gradient effect
        canvas_obj.setFillColor(self.SECONDARY_GRAY)
        canvas_obj.rect(0, 0, letter[0], 65, fill=True, stroke=False)
        
        # Footer line
        canvas_obj.setStrokeColor(self.BRAND_PURPLE)
        canvas_obj.setLineWidth(2)
        canvas_obj.line(self.MARGIN, 55, letter[0] - self.MARGIN, 55)
        
        # Contact Information - Peter Spurgeon
        canvas_obj.setFont('Helvetica-Bold', 11)
        canvas_obj.setFillColor(self.BRAND_PURPLE)
        canvas_obj.drawString(self.MARGIN, 40, "Contact: Peter Spurgeon")
        
        canvas_obj.setFont('Helvetica', 10)
        canvas_obj.setFillColor(self.TEXT_GRAY)
        canvas_obj.drawString(self.MARGIN, 28, "📱 084 208 9307")
        canvas_obj.drawString(self.MARGIN, 16, "📧 Peter@spurgeonproperty.com")
        
        # Website and company info
        canvas_obj.setFont('Helvetica', 10)
        canvas_obj.setFillColor(self.BRAND_ORANGE)
        canvas_obj.drawCentredString(letter[0]/2, 40, "www.spurgeonproperty.com")
        canvas_obj.setFillColor(self.MEDIUM_GRAY)
        canvas_obj.drawCentredString(letter[0]/2, 28, "Professional Real Estate Services")
        canvas_obj.drawCentredString(letter[0]/2, 16, "Available 7 days a week • 8AM - 8PM")
        
        # Page number and copyright
        canvas_obj.setFont('Helvetica', 9)
        canvas_obj.setFillColor(self.MEDIUM_GRAY)
        page_num = canvas_obj.getPageNumber()
        canvas_obj.drawRightString(letter[0] - self.MARGIN, 40, f"Page {page_num}")
        canvas_obj.drawRightString(letter[0] - self.MARGIN, 28, f"© {datetime.now().year} Spurgeon Property")
        canvas_obj.drawRightString(letter[0] - self.MARGIN, 16, "All Rights Reserved")
        
        canvas_obj.restoreState()
    
    class EnhancedCanvas(canvas.Canvas):
        """Enhanced canvas with branded headers and footers"""
        
        def __init__(self, *args, **kwargs):
            self.generator = kwargs.pop('generator', None)
            canvas.Canvas.__init__(self, *args, **kwargs)
        
        def showPage(self):
            if self.generator:
                self.generator.create_branded_header(self, None)
                self.generator.create_branded_footer(self, None)
            canvas.Canvas.showPage(self)
    
    def generate_enhanced_catalogue_pdf(self, properties: List[Dict[str, Any]], output_path: str, 
                                      catalogue_title: str = "Property Portfolio", 
                                      client_name: str = "Valued Client") -> bool:
        """Generate a comprehensive professional property catalogue PDF"""
        try:
            # Create document with enhanced canvas
            doc = BaseDocTemplate(
                output_path,
                pagesize=letter,
                topMargin=80,  # Space for header
                bottomMargin=70,  # Space for footer
                leftMargin=self.MARGIN,
                rightMargin=self.MARGIN,
                canvasmaker=lambda *args, **kwargs: self.EnhancedCanvas(
                    *args, generator=self, **kwargs
                )
            )
            
            # Define page templates
            frame = Frame(
                self.MARGIN, 70,
                letter[0] - 2 * self.MARGIN,
                letter[1] - 150,  # Account for header and footer
                showBoundary=0
            )
            template = PageTemplate(id='normal', frames=[frame])
            doc.addPageTemplates([template])
            
            # Build comprehensive story
            story = []
            
            # Enhanced Title Page
            # Welcome message
            welcome = Paragraph(
                f'<span color="{self.MEDIUM_GRAY.hexval()}">Prepared exclusively for</span><br/>'
                f'<span color="{self.BRAND_PURPLE.hexval()}"><b>{client_name}</b></span>',
                self.styles['PropertyBody']
            )
            welcome.style.alignment = TA_CENTER
            story.append(Spacer(1, 0.5 * inch))
            story.append(welcome)
            story.append(Spacer(1, 0.8 * inch))
            
            # Main title with enhanced styling
            title = Paragraph(catalogue_title, self.styles['BrandTitle'])
            story.append(title)
            story.append(Spacer(1, 0.3 * inch))
            
            # Property count and description
            subtitle = Paragraph(
                f'<span color="{self.BRAND_ORANGE.hexval()}"><b>{len(properties)} Exceptional Properties</b></span><br/><br/>'
                f'<span color="{self.TEXT_GRAY.hexval()}">A carefully curated selection of premium real estate opportunities<br/>'
                f'showcasing the finest properties in South Africa\'s most desirable locations.</span>',
                self.styles['PropertyBody']
            )
            subtitle.style.alignment = TA_CENTER
            story.append(subtitle)
            story.append(Spacer(1, 1 * inch))
            
            # Generation date with styling
            date_str = datetime.now().strftime("%B %d, %Y")
            date_para = Paragraph(
                f'<span color="{self.MEDIUM_GRAY.hexval()}">Generated on {date_str}</span><br/><br/>'
                f'<span color="{self.BRAND_PURPLE.hexval()}"><b>Spurgeon Property</b></span><br/>'
                f'<span color="{self.TEXT_GRAY.hexval()}">Professional Real Estate Services</span>',
                self.styles['PropertyBody']
            )
            date_para.style.alignment = TA_CENTER
            story.append(date_para)
            story.append(PageBreak())
            
            # Enhanced Table of Contents
            toc_title = Paragraph('Portfolio Overview', self.styles['CatalogueTitle'])
            story.append(toc_title)
            story.append(Spacer(1, 0.4 * inch))
            
            # Property summary table
            toc_data = [['#', 'Property', 'Location', 'Type', 'Price']]
            
            for i, property_data in enumerate(properties, 1):
                title = property_data.get('title', f'Property {i}')
                if len(title) > 40:
                    title = title[:37] + "..."
                    
                location_parts = property_data.get('address', '').split(',')
                location = location_parts[0] if location_parts else property_data.get('city', 'Location TBC')
                
                prop_type = property_data.get('propertyType', 'Property').title()
                price = self.format_price(property_data.get('price', 0), 
                                        property_data.get('currency', 'ZAR'))
                
                toc_data.append([str(i), title, location, prop_type, price])
            
            toc_table = Table(toc_data, colWidths=[0.4*inch, 2.8*inch, 1.5*inch, 1*inch, 1*inch])
            toc_table.setStyle(TableStyle([
                # Header row
                ('BACKGROUND', (0, 0), (-1, 0), self.BRAND_PURPLE),
                ('TEXTCOLOR', (0, 0), (-1, 0), white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                
                # Data rows
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('TEXTCOLOR', (0, 1), (-1, -1), self.TEXT_GRAY),
                ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Numbers centered
                ('ALIGN', (-1, 1), (-1, -1), 'RIGHT'),  # Prices right-aligned
                
                # Styling
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, self.SECONDARY_GRAY]),
                ('GRID', (0, 0), (-1, -1), 0.5, self.LIGHT_GRAY),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            
            story.append(toc_table)
            story.append(PageBreak())
            
            # Enhanced Property Details Pages
            for i, property_data in enumerate(properties, 1):
                # Property page header
                property_header = Paragraph(
                    f'Property {i} of {len(properties)}',
                    self.styles['Caption']
                )
                property_header.style.alignment = TA_RIGHT
                story.append(property_header)
                story.append(Spacer(1, 0.2 * inch))
                
                # Property title with enhanced styling
                title = property_data.get('title', f'Premium Property {i}')
                property_title = Paragraph(title, self.styles['PropertyHeading'])
                story.append(property_title)
                
                # Price with prominent display
                price = self.format_price(property_data.get('price', 0), 
                                        property_data.get('currency', 'ZAR'))
                price_para = Paragraph(price, self.styles['PriceHighlight'])
                story.append(price_para)
                story.append(Spacer(1, 0.3 * inch))
                
                # Main property image with better handling
                images = property_data.get('images', [])
                if images and len(images) > 0:
                    main_img_path = images[0]
                    # Convert relative path to absolute if needed
                    if not main_img_path.startswith('/'):
                        main_img_path = os.path.join('/home/runner/workspace', main_img_path.lstrip('./'))
                    
                    if os.path.exists(main_img_path):
                        try:
                            img = self.optimize_image(main_img_path, self.HERO_WIDTH, self.HERO_HEIGHT)
                            if img:
                                story.append(img)
                                # Image caption
                                img_caption = Paragraph('Main Property View', self.styles['Caption'])
                                story.append(img_caption)
                                story.append(Spacer(1, 0.3 * inch))
                        except Exception as e:
                            print(f"Could not load main image {main_img_path}: {e}")
                
                # Property specifications in professional table
                specs_data = []
                
                # Basic specifications
                if property_data.get('propertyType'):
                    specs_data.append(['Property Type:', property_data['propertyType'].title()])
                
                if property_data.get('listingType'):
                    listing_type = "For Sale" if property_data['listingType'] == 'sale' else "For Rent"
                    specs_data.append(['Listing Type:', listing_type])
                
                # Only show bedrooms/bathrooms for residential properties
                prop_type = property_data.get('propertyType', '').lower()
                if prop_type not in ['commercial', 'land']:
                    if property_data.get('bedrooms'):
                        specs_data.append(['Bedrooms:', str(property_data['bedrooms'])])
                    if property_data.get('bathrooms'):
                        specs_data.append(['Bathrooms:', str(property_data['bathrooms'])])
                
                if property_data.get('area'):
                    specs_data.append(['Floor Area:', f"{property_data['area']} m²"])
                
                if property_data.get('lotSize'):
                    unit = property_data.get('lotSizeUnit', 'm²')
                    specs_data.append(['Lot Size:', f"{property_data['lotSize']} {unit}"])
                
                if specs_data:
                    specs_table = Table(specs_data, colWidths=[2*inch, 3*inch])
                    specs_table.setStyle(TableStyle([
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 11),
                        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                        ('TEXTCOLOR', (0, 0), (0, -1), self.BRAND_PURPLE),
                        ('TEXTCOLOR', (1, 0), (1, -1), self.TEXT_GRAY),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('TOPPADDING', (0, 0), (-1, -1), 6),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                        ('LINEBELOW', (0, 0), (-1, -2), 0.5, self.LIGHT_GRAY),
                    ]))
                    story.append(specs_table)
                    story.append(Spacer(1, 0.3 * inch))
                
                # Property description with enhanced formatting
                if property_data.get('description'):
                    desc_heading = Paragraph('Property Description', self.styles['PropertySubheading'])
                    story.append(desc_heading)
                    
                    description = Paragraph(property_data['description'], self.styles['PropertyBody'])
                    story.append(description)
                    story.append(Spacer(1, 0.25 * inch))
                
                # Key features with bullet points
                if property_data.get('features'):
                    features_heading = Paragraph('Key Features & Amenities', self.styles['PropertySubheading'])
                    story.append(features_heading)
                    
                    features = property_data['features']
                    # Display features in two columns
                    for j in range(0, len(features), 2):
                        row_features = features[j:j+2]
                        if len(row_features) == 2:
                            feature_text = f"• {row_features[0]}" + " " * 15 + f"• {row_features[1]}"
                        else:
                            feature_text = f"• {row_features[0]}"
                        
                        feature_item = Paragraph(feature_text, self.styles['FeatureList'])
                        story.append(feature_item)
                    story.append(Spacer(1, 0.3 * inch))
                
                # Location information
                if property_data.get('address'):
                    location_heading = Paragraph('Location', self.styles['PropertySubheading'])
                    story.append(location_heading)
                    
                    full_address = property_data['address']
                    if property_data.get('city'):
                        full_address += f", {property_data['city']}"
                    if property_data.get('province'):
                        full_address += f", {property_data['province']}"
                    
                    location_para = Paragraph(full_address, self.styles['PropertyBody'])
                    story.append(location_para)
                    story.append(Spacer(1, 0.4 * inch))
                
                # Peter Spurgeon Contact Information Box
                contact_heading = Paragraph('Contact Your Real Estate Expert', self.styles['PropertySubheading'])
                story.append(contact_heading)
                
                # Create a styled contact box
                contact_data = [
                    ['Contact: Peter Spurgeon', ''],
                    ['Phone:', '084 208 9307'],
                    ['Email:', 'Peter@spurgeonproperty.com'],
                    ['Website:', 'www.spurgeonproperty.com'],
                    ['Available:', '7 days a week • 8AM - 8PM']
                ]
                
                contact_table = Table(contact_data, colWidths=[1.5*inch, 3.5*inch])
                contact_table.setStyle(TableStyle([
                    # Header row styling
                    ('SPAN', (0, 0), (1, 0)),
                    ('BACKGROUND', (0, 0), (1, 0), self.BRAND_PURPLE),
                    ('TEXTCOLOR', (0, 0), (1, 0), white),
                    ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (1, 0), 12),
                    ('ALIGN', (0, 0), (1, 0), 'CENTER'),
                    
                    # Contact details styling
                    ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 1), (0, -1), self.BRAND_ORANGE),
                    ('TEXTCOLOR', (1, 1), (1, -1), self.TEXT_GRAY),
                    
                    # Table styling
                    ('BACKGROUND', (0, 1), (-1, -1), self.SECONDARY_GRAY),
                    ('GRID', (0, 0), (-1, -1), 1, self.LIGHT_GRAY),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('LEFTPADDING', (0, 0), (-1, -1), 12),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ]))
                story.append(contact_table)
                
                # Call-to-action
                cta_text = Paragraph(
                    f'<span color="{self.MEDIUM_GRAY.hexval()}">Ready to schedule a viewing or get more information? '
                    f'Contact Peter today for professional guidance and exceptional service.</span>',
                    self.styles['PropertyBody']
                )
                cta_text.style.alignment = TA_CENTER
                story.append(Spacer(1, 0.2 * inch))
                story.append(cta_text)
                
                # Add page break between properties (except last)
                if i < len(properties):
                    story.append(PageBreak())
            
            # Build the enhanced PDF
            doc.build(story)
            return True
            
        except Exception as e:
            print(f"Error generating enhanced catalogue PDF: {e}")
            import traceback
            traceback.print_exc()
            return False

def main():
    """Main function to process command line arguments and generate PDF"""
    if len(sys.argv) != 4:
        print("Usage: python enhanced_property_pdf_generator.py <properties_json> <output_path> <title>")
        sys.exit(1)
    
    properties_json = sys.argv[1]
    output_path = sys.argv[2]
    title = sys.argv[3]
    
    try:
        # Load properties data
        with open(properties_json, 'r') as f:
            data = json.load(f)
        
        properties = data.get('properties', [])
        client_name = data.get('clientName', 'Valued Client')
        
        # Generate enhanced PDF
        generator = EnhancedPropertyPDFGenerator()
        success = generator.generate_enhanced_catalogue_pdf(
            properties, 
            output_path, 
            title,
            client_name
        )
        
        if success:
            print(f"Enhanced catalogue PDF generated successfully: {output_path}")
        else:
            print("Failed to generate enhanced PDF")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()