#!/usr/bin/env python3
"""
Optimized Property Catalogue Generator for Professional PDF Output
Comprehensive system for generating high-quality property catalogues with enhanced layouts,
professional branding, and Peter Spurgeon contact information.
"""

import os
import sys
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, 
    Table, TableStyle, Image, PageBreak, KeepTogether, NextPageTemplate
)
from reportlab.platypus.flowables import HRFlowable, Flowable
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image as PILImage

class OptimizedCatalogueGenerator:
    """Optimized professional property catalogue generator with comprehensive features"""
    
    # Enhanced Spurgeon Property Brand Colors
    BRAND_PURPLE = HexColor('#8b5cf6')
    BRAND_ORANGE = HexColor('#f97316')
    BRAND_LIGHT_PURPLE = HexColor('#c4b5fd')
    BRAND_LIGHT_ORANGE = HexColor('#fed7aa')
    PRIMARY_BLUE = HexColor('#1e40af')
    SECONDARY_GRAY = HexColor('#f8fafc')
    ACCENT_RED = HexColor('#dc2626')
    TEXT_GRAY = HexColor('#374151')
    MEDIUM_GRAY = HexColor('#6b7280')
    LIGHT_GRAY = HexColor('#e5e7eb')
    SUCCESS_GREEN = HexColor('#059669')
    DARK_GRAY = HexColor('#1f2937')
    
    # Typography System
    HERO_TITLE_SIZE = 32
    TITLE_SIZE = 24
    SUBTITLE_SIZE = 18
    HEADING_SIZE = 16
    SUBHEADING_SIZE = 14
    BODY_SIZE = 11
    CAPTION_SIZE = 9
    PRICE_SIZE = 22
    CONTACT_SIZE = 12
    
    # Layout Constants
    MARGIN = 0.75 * inch
    INNER_MARGIN = 0.5 * inch
    PAGE_WIDTH = A4[0]
    PAGE_HEIGHT = A4[1]
    CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN)
    CONTENT_HEIGHT = PAGE_HEIGHT - (2 * MARGIN)
    
    # Image Sizes
    HERO_IMAGE_WIDTH = 6 * inch
    HERO_IMAGE_HEIGHT = 4 * inch
    THUMBNAIL_WIDTH = 2.3 * inch
    THUMBNAIL_HEIGHT = 1.7 * inch
    GALLERY_IMAGE_WIDTH = 1.8 * inch
    GALLERY_IMAGE_HEIGHT = 1.4 * inch
    
    def __init__(self, company_name: str = "SPURGEON Property"):
        """Initialize the optimized catalogue generator"""
        self.company_name = company_name
        self.styles = {}
        self.setup_comprehensive_styles()
    
    def setup_comprehensive_styles(self):
        """Setup comprehensive typography and styling system"""
        base_styles = getSampleStyleSheet()
        
        # Hero Title for Cover Page
        self.styles['HeroTitle'] = ParagraphStyle(
            'HeroTitle',
            parent=base_styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=self.HERO_TITLE_SIZE,
            textColor=self.BRAND_PURPLE,
            alignment=TA_CENTER,
            spaceAfter=24,
            spaceBefore=12,
            leading=36
        )
        
        # Main Title Style
        self.styles['MainTitle'] = ParagraphStyle(
            'MainTitle',
            parent=base_styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=self.TITLE_SIZE,
            textColor=self.BRAND_PURPLE,
            alignment=TA_CENTER,
            spaceAfter=18,
            spaceBefore=12,
            leading=28
        )
        
        # Property Title
        self.styles['PropertyTitle'] = ParagraphStyle(
            'PropertyTitle',
            parent=base_styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=self.SUBTITLE_SIZE,
            textColor=self.TEXT_GRAY,
            alignment=TA_LEFT,
            spaceAfter=12,
            spaceBefore=8,
            leading=22
        )
        
        # Section Heading
        self.styles['SectionHeading'] = ParagraphStyle(
            'SectionHeading',
            parent=base_styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=self.HEADING_SIZE,
            textColor=self.BRAND_ORANGE,
            alignment=TA_LEFT,
            spaceAfter=8,
            spaceBefore=16,
            leading=18
        )
        
        # Subheading
        self.styles['Subheading'] = ParagraphStyle(
            'Subheading',
            parent=base_styles['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=self.SUBHEADING_SIZE,
            textColor=self.MEDIUM_GRAY,
            alignment=TA_LEFT,
            spaceAfter=6,
            spaceBefore=12,
            leading=16
        )
        
        # Body Text
        self.styles['BodyText'] = ParagraphStyle(
            'BodyText',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=self.BODY_SIZE,
            textColor=self.TEXT_GRAY,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            spaceBefore=0,
            leading=14
        )
        
        # Price Highlight
        self.styles['PriceHighlight'] = ParagraphStyle(
            'PriceHighlight',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=self.PRICE_SIZE,
            textColor=self.BRAND_ORANGE,
            alignment=TA_LEFT,
            spaceAfter=12,
            spaceBefore=8,
            leading=26
        )
        
        # Contact Information
        self.styles['ContactInfo'] = ParagraphStyle(
            'ContactInfo',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=self.CONTACT_SIZE,
            textColor=self.TEXT_GRAY,
            alignment=TA_LEFT,
            spaceAfter=6,
            spaceBefore=4,
            leading=15
        )
        
        # Caption Style
        self.styles['Caption'] = ParagraphStyle(
            'Caption',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=self.CAPTION_SIZE,
            textColor=self.MEDIUM_GRAY,
            alignment=TA_CENTER,
            spaceAfter=4,
            spaceBefore=2,
            leading=11
        )
        
        # Feature List
        self.styles['FeatureList'] = ParagraphStyle(
            'FeatureList',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=self.BODY_SIZE,
            textColor=self.TEXT_GRAY,
            alignment=TA_LEFT,
            spaceAfter=4,
            spaceBefore=2,
            leading=14,
            leftIndent=12
        )
    
    def format_price(self, price, currency: str = "ZAR") -> str:
        """Format price with proper currency formatting"""
        try:
            if isinstance(price, str):
                price_str = price.replace(',', '').replace('R', '').replace(' ', '').strip()
                price_float = float(price_str) if price_str else 0.0
            else:
                price_float = float(price or 0)
        except (ValueError, TypeError):
            return "POA"
            
        if price_float == 0:
            return "POA"
            
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
    
    def optimize_image(self, image_path: str, max_width: float, max_height: float) -> Optional[Image]:
        """Optimize image for PDF with proper aspect ratio and quality"""
        if not os.path.exists(image_path):
            return None
            
        try:
            with PILImage.open(image_path) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                img_width, img_height = img.size
                aspect_ratio = img_width / img_height
                
                # Calculate optimal dimensions
                if aspect_ratio > max_width / max_height:
                    new_width = max_width
                    new_height = max_width / aspect_ratio
                else:
                    new_height = max_height
                    new_width = max_height * aspect_ratio
                
                # High quality resize
                target_width = int(new_width * 72 / inch)
                target_height = int(new_height * 72 / inch)
                img_resized = img.resize((target_width, target_height), PILImage.LANCZOS)
                
                return Image(ImageReader(img_resized), width=new_width, height=new_height)
                
        except Exception as e:
            print(f"Error optimizing image {image_path}: {e}")
            return None
    
    def create_cover_page(self, title: str, property_count: int, client_name: str) -> List:
        """Create professional cover page"""
        story = []
        
        # Cover page spacer
        story.append(Spacer(1, 1.5 * inch))
        
        # Company branding
        brand_title = Paragraph(
            f'<span color="{self.BRAND_PURPLE.hexval()}"><b>SPURGEON</b></span> '
            f'<span color="{self.BRAND_ORANGE.hexval()}"><b>Property</b></span>',
            self.styles['HeroTitle']
        )
        story.append(brand_title)
        story.append(Spacer(1, 0.5 * inch))
        
        # Main catalogue title
        main_title = Paragraph(title, self.styles['MainTitle'])
        story.append(main_title)
        story.append(Spacer(1, 0.3 * inch))
        
        # Subtitle with property count
        subtitle = Paragraph(
            f'<span color="{self.BRAND_ORANGE.hexval()}"><b>{property_count} Premium Properties</b></span><br/><br/>'
            f'<span color="{self.TEXT_GRAY.hexval()}">Carefully curated selection of exceptional real estate opportunities<br/>'
            f'in South Africa\'s most desirable locations</span>',
            self.styles['BodyText']
        )
        subtitle.style.alignment = TA_CENTER
        story.append(subtitle)
        story.append(Spacer(1, 1 * inch))
        
        # Client dedication
        if client_name and client_name != 'Valued Client':
            dedication = Paragraph(
                f'<span color="{self.MEDIUM_GRAY.hexval()}">Exclusively prepared for</span><br/>'
                f'<span color="{self.BRAND_PURPLE.hexval()}"><b>{client_name}</b></span>',
                self.styles['BodyText']
            )
            dedication.style.alignment = TA_CENTER
            story.append(dedication)
            story.append(Spacer(1, 0.8 * inch))
        
        # Contact information box
        contact_data = [
            ['Contact Information', ''],
            ['Peter Spurgeon', 'Principal Real Estate Agent'],
            ['Phone:', '084 208 9307'],
            ['Email:', 'Peter@spurgeonproperty.com'],
            ['Website:', 'www.spurgeonproperty.com'],
            ['Available:', '7 days a week • 8AM - 8PM']
        ]
        
        contact_table = Table(contact_data, colWidths=[2.2*inch, 3*inch])
        contact_table.setStyle(TableStyle([
            # Header styling
            ('SPAN', (0, 0), (1, 0)),
            ('BACKGROUND', (0, 0), (1, 0), self.BRAND_PURPLE),
            ('TEXTCOLOR', (0, 0), (1, 0), white),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (1, 0), 14),
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            
            # Agent name row
            ('SPAN', (0, 1), (1, 1)),
            ('BACKGROUND', (0, 1), (1, 1), self.BRAND_LIGHT_PURPLE),
            ('TEXTCOLOR', (0, 1), (1, 1), self.TEXT_GRAY),
            ('FONTNAME', (0, 1), (1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (1, 1), 12),
            ('ALIGN', (0, 1), (1, 1), 'CENTER'),
            
            # Contact details
            ('FONTNAME', (0, 2), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 2), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 2), (-1, -1), 11),
            ('TEXTCOLOR', (0, 2), (0, -1), self.BRAND_ORANGE),
            ('TEXTCOLOR', (1, 2), (1, -1), self.TEXT_GRAY),
            
            # Table styling
            ('BACKGROUND', (0, 2), (-1, -1), self.SECONDARY_GRAY),
            ('GRID', (0, 0), (-1, -1), 1, self.LIGHT_GRAY),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ]))
        
        story.append(contact_table)
        story.append(Spacer(1, 0.5 * inch))
        
        # Generation date
        date_str = datetime.now().strftime("%B %d, %Y")
        date_para = Paragraph(
            f'<span color="{self.MEDIUM_GRAY.hexval()}">Generated on {date_str}</span>',
            self.styles['Caption']
        )
        story.append(date_para)
        story.append(PageBreak())
        
        return story
    
    def create_table_of_contents(self, properties: List[Dict[str, Any]]) -> List:
        """Create comprehensive table of contents"""
        story = []
        
        # TOC Title
        toc_title = Paragraph('Property Portfolio Overview', self.styles['MainTitle'])
        story.append(toc_title)
        story.append(Spacer(1, 0.4 * inch))
        
        # TOC Table
        toc_data = [['#', 'Property Details', 'Location', 'Type', 'Price']]
        
        for i, prop in enumerate(properties, 1):
            title = prop.get('title', f'Property {i}')
            if len(title) > 45:
                title = title[:42] + "..."
                
            # Location formatting
            location_parts = []
            if prop.get('suburb'):
                location_parts.append(prop['suburb'])
            if prop.get('city'):
                location_parts.append(prop['city'])
            location = ', '.join(location_parts) if location_parts else 'Location TBC'
            
            prop_type = (prop.get('propertyType', 'Property')).title()
            price = self.format_price(prop.get('price', 0))
            
            toc_data.append([str(i), title, location, prop_type, price])
        
        toc_table = Table(toc_data, colWidths=[0.5*inch, 3.2*inch, 1.8*inch, 1*inch, 1.2*inch])
        toc_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), self.BRAND_PURPLE),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TEXTCOLOR', (0, 1), (-1, -1), self.TEXT_GRAY),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Numbers
            ('ALIGN', (-1, 1), (-1, -1), 'RIGHT'),  # Prices
            
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, self.SECONDARY_GRAY]),
            ('GRID', (0, 0), (-1, -1), 0.5, self.LIGHT_GRAY),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        story.append(toc_table)
        story.append(PageBreak())
        
        return story
    
    def create_property_page(self, prop: Dict[str, Any], index: int, total: int) -> List:
        """Create comprehensive property page with enhanced layout"""
        story = []
        
        # Property header
        header = Paragraph(
            f'Property {index} of {total}',
            self.styles['Caption']
        )
        header.style.alignment = TA_RIGHT
        story.append(header)
        story.append(Spacer(1, 0.2 * inch))
        
        # Property title and price section
        title = prop.get('title', f'Premium Property {index}')
        property_title = Paragraph(title, self.styles['PropertyTitle'])
        story.append(property_title)
        
        price = self.format_price(prop.get('price', 0))
        price_para = Paragraph(price, self.styles['PriceHighlight'])
        story.append(price_para)
        story.append(Spacer(1, 0.2 * inch))
        
        # Main property image
        images = prop.get('images', [])
        if images and len(images) > 0:
            main_img_path = images[0]
            if not main_img_path.startswith('/'):
                main_img_path = os.path.join(os.getcwd(), main_img_path.lstrip('./'))
            
            if os.path.exists(main_img_path):
                img = self.optimize_image(main_img_path, self.HERO_IMAGE_WIDTH, self.HERO_IMAGE_HEIGHT)
                if img:
                    story.append(img)
                    story.append(Spacer(1, 0.2 * inch))
        
        # Property specifications table
        specs_data = []
        
        if prop.get('propertyType'):
            specs_data.append(['Property Type:', prop['propertyType'].title()])
        
        if prop.get('listingType'):
            listing_type = "For Sale" if prop['listingType'] == 'sale' else "For Rent"
            specs_data.append(['Listing Type:', listing_type])
        
        # Bedrooms/Bathrooms for residential properties
        prop_type = prop.get('propertyType', '').lower()
        if prop_type not in ['commercial', 'land']:
            if prop.get('bedrooms'):
                specs_data.append(['Bedrooms:', str(prop['bedrooms'])])
            if prop.get('bathrooms'):
                specs_data.append(['Bathrooms:', str(prop['bathrooms'])])
        
        if prop.get('area'):
            specs_data.append(['Floor Area:', f"{prop['area']} m²"])
        
        if prop.get('lotSize'):
            unit = prop.get('lotSizeUnit', 'm²')
            specs_data.append(['Lot Size:', f"{prop['lotSize']} {unit}"])
        
        if specs_data:
            specs_table = Table(specs_data, colWidths=[2.2*inch, 3.5*inch])
            specs_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('TEXTCOLOR', (0, 0), (0, -1), self.BRAND_PURPLE),
                ('TEXTCOLOR', (1, 0), (1, -1), self.TEXT_GRAY),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LINEBELOW', (0, 0), (-1, -2), 0.5, self.LIGHT_GRAY),
            ]))
            story.append(specs_table)
            story.append(Spacer(1, 0.3 * inch))
        
        # Property description
        if prop.get('description'):
            desc_heading = Paragraph('Property Description', self.styles['SectionHeading'])
            story.append(desc_heading)
            
            description = Paragraph(prop['description'], self.styles['BodyText'])
            story.append(description)
            story.append(Spacer(1, 0.25 * inch))
        
        # Key features
        if prop.get('features'):
            features_heading = Paragraph('Key Features & Amenities', self.styles['SectionHeading'])
            story.append(features_heading)
            
            features = prop['features'] if isinstance(prop['features'], list) else []
            for feature in features:
                feature_item = Paragraph(f"• {feature}", self.styles['FeatureList'])
                story.append(feature_item)
            story.append(Spacer(1, 0.3 * inch))
        
        # Location information
        if prop.get('address'):
            location_heading = Paragraph('Location Details', self.styles['SectionHeading'])
            story.append(location_heading)
            
            full_address = prop['address']
            if prop.get('suburb'):
                full_address += f", {prop['suburb']}"
            if prop.get('city'):
                full_address += f", {prop['city']}"
            if prop.get('province'):
                full_address += f", {prop['province']}"
            
            location_para = Paragraph(full_address, self.styles['BodyText'])
            story.append(location_para)
            story.append(Spacer(1, 0.3 * inch))
        
        # Peter Spurgeon Contact Box
        contact_heading = Paragraph('Contact Your Real Estate Expert', self.styles['SectionHeading'])
        story.append(contact_heading)
        
        contact_data = [
            ['Peter Spurgeon - Principal Agent', ''],
            ['Phone:', '084 208 9307'],
            ['Email:', 'Peter@spurgeonproperty.com'],
            ['Website:', 'www.spurgeonproperty.com'],
            ['Available:', '7 days a week • 8AM - 8PM']
        ]
        
        contact_table = Table(contact_data, colWidths=[2*inch, 3.7*inch])
        contact_table.setStyle(TableStyle([
            # Header
            ('SPAN', (0, 0), (1, 0)),
            ('BACKGROUND', (0, 0), (1, 0), self.BRAND_ORANGE),
            ('TEXTCOLOR', (0, 0), (1, 0), white),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (1, 0), 12),
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            
            # Contact details
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TEXTCOLOR', (0, 1), (0, -1), self.BRAND_PURPLE),
            ('TEXTCOLOR', (1, 1), (1, -1), self.TEXT_GRAY),
            
            # Styling
            ('BACKGROUND', (0, 1), (-1, -1), self.BRAND_LIGHT_ORANGE),
            ('GRID', (0, 0), (-1, -1), 1, self.LIGHT_GRAY),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(contact_table)
        
        # Call to action
        cta_text = Paragraph(
            'Ready to schedule a viewing or need more information? Contact Peter today for professional guidance and exceptional service.',
            self.styles['BodyText']
        )
        cta_text.style.alignment = TA_CENTER
        cta_text.style.textColor = self.MEDIUM_GRAY
        story.append(Spacer(1, 0.2 * inch))
        story.append(cta_text)
        
        # Page break (except for last property)
        if index < total:
            story.append(PageBreak())
        
        return story
    
    def create_enhanced_header_footer_canvas(self):
        """Create canvas class with enhanced headers and footers"""
        generator = self
        
        class EnhancedCanvas(canvas.Canvas):
            def __init__(self, *args, **kwargs):
                canvas.Canvas.__init__(self, *args, **kwargs)
            
            def showPage(self):
                self.draw_header()
                self.draw_footer()
                canvas.Canvas.showPage(self)
            
            def draw_header(self):
                self.saveState()
                
                # Header background
                self.setFillColor(generator.SECONDARY_GRAY)
                self.rect(0, generator.PAGE_HEIGHT - 70, generator.PAGE_WIDTH, 70, fill=True, stroke=False)
                
                # Brand elements
                self.setFont('Helvetica-Bold', 18)
                self.setFillColor(generator.BRAND_PURPLE)
                self.drawString(generator.MARGIN, generator.PAGE_HEIGHT - 35, "SPURGEON")
                
                self.setFillColor(generator.BRAND_ORANGE)
                self.drawString(generator.MARGIN + 105, generator.PAGE_HEIGHT - 35, "Property")
                
                # Tagline
                self.setFont('Helvetica', 10)
                self.setFillColor(generator.MEDIUM_GRAY)
                self.drawRightString(generator.PAGE_WIDTH - generator.MARGIN, generator.PAGE_HEIGHT - 25, "Your Gateway to Premium Properties")
                self.drawRightString(generator.PAGE_WIDTH - generator.MARGIN, generator.PAGE_HEIGHT - 40, "www.spurgeonproperty.com")
                
                self.restoreState()
            
            def draw_footer(self):
                self.saveState()
                
                # Footer background
                self.setFillColor(generator.SECONDARY_GRAY)
                self.rect(0, 0, generator.PAGE_WIDTH, 80, fill=True, stroke=False)
                
                # Decorative line
                self.setStrokeColor(generator.BRAND_PURPLE)
                self.setLineWidth(2)
                self.line(generator.MARGIN, 65, generator.PAGE_WIDTH - generator.MARGIN, 65)
                
                # Contact information
                self.setFont('Helvetica-Bold', 12)
                self.setFillColor(generator.BRAND_PURPLE)
                self.drawString(generator.MARGIN, 48, "Contact: Peter Spurgeon")
                
                self.setFont('Helvetica', 10)
                self.setFillColor(generator.TEXT_GRAY)
                self.drawString(generator.MARGIN, 34, "📱 084 208 9307  📧 Peter@spurgeonproperty.com")
                self.drawString(generator.MARGIN, 22, "🌐 www.spurgeonproperty.com")
                self.drawString(generator.MARGIN, 10, "Available: 7 days a week • 8AM - 8PM")
                
                # Center info
                self.setFont('Helvetica', 10)
                self.setFillColor(generator.BRAND_ORANGE)
                self.drawCentredString(generator.PAGE_WIDTH/2, 48, "Professional Real Estate Services")
                self.setFillColor(generator.MEDIUM_GRAY)
                self.drawCentredString(generator.PAGE_WIDTH/2, 34, "Serving South Africa's Premium Property Market")
                self.drawCentredString(generator.PAGE_WIDTH/2, 22, "Expert Guidance • Exceptional Results")
                
                # Page number and copyright
                page_num = self.getPageNumber()
                self.setFont('Helvetica', 9)
                self.setFillColor(generator.MEDIUM_GRAY)
                self.drawRightString(generator.PAGE_WIDTH - generator.MARGIN, 48, f"Page {page_num}")
                self.drawRightString(generator.PAGE_WIDTH - generator.MARGIN, 34, f"© {datetime.now().year} Spurgeon Property")
                self.drawRightString(generator.PAGE_WIDTH - generator.MARGIN, 22, "All Rights Reserved")
                
                self.restoreState()
        
        return EnhancedCanvas
    
    def generate_optimized_catalogue(self, properties: List[Dict[str, Any]], 
                                   output_path: str, 
                                   title: str = "Premium Property Catalogue",
                                   client_name: str = "Valued Client") -> bool:
        """Generate comprehensive optimized property catalogue"""
        try:
            # Create document with enhanced canvas
            doc = BaseDocTemplate(
                output_path,
                pagesize=A4,
                topMargin=80,
                bottomMargin=90,
                leftMargin=self.MARGIN,
                rightMargin=self.MARGIN,
                canvasmaker=self.create_enhanced_header_footer_canvas()
            )
            
            # Define page template
            frame = Frame(
                self.MARGIN, 90,
                A4[0] - 2 * self.MARGIN,
                A4[1] - 170,
                showBoundary=0
            )
            template = PageTemplate(id='normal', frames=[frame])
            doc.addPageTemplates([template])
            
            # Build comprehensive story
            story = []
            
            # Cover page
            story.extend(self.create_cover_page(title, len(properties), client_name))
            
            # Table of contents
            story.extend(self.create_table_of_contents(properties))
            
            # Property pages
            for i, prop in enumerate(properties, 1):
                story.extend(self.create_property_page(prop, i, len(properties)))
            
            # Build final PDF
            doc.build(story)
            return True
            
        except Exception as e:
            print(f"Error generating optimized catalogue: {e}")
            import traceback
            traceback.print_exc()
            return False

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 4:
        print("Usage: python optimized_catalogue_generator.py <properties_json> <output_path> <title>")
        sys.exit(1)
    
    properties_json = sys.argv[1]
    output_path = sys.argv[2]
    title = sys.argv[3]
    
    try:
        with open(properties_json, 'r') as f:
            data = json.load(f)
        
        properties = data.get('properties', [])
        client_name = data.get('clientName', 'Valued Client')
        
        generator = OptimizedCatalogueGenerator()
        success = generator.generate_optimized_catalogue(properties, output_path, title, client_name)
        
        if success:
            print(f"✅ Optimized catalogue generated: {output_path}")
        else:
            print("❌ Failed to generate optimized catalogue")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()