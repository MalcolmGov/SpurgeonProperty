#!/usr/bin/env python3
"""
Social Media Graphics Generator for Property Marketing
Creates modern, eye-catching graphics optimized for Instagram, Facebook, and other platforms
"""

import json
import sys
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
import os
from PIL import Image as PILImage, ImageDraw, ImageFont
import requests
import io

# Social media dimensions
INSTAGRAM_SQUARE = (1080, 1080)
INSTAGRAM_STORY = (1080, 1920)
FACEBOOK_POST = (1200, 630)
LINKEDIN_POST = (1200, 627)

# Modern color palette
BRAND_PURPLE = (139, 92, 246)    # #8b5cf6
BRAND_ORANGE = (251, 128, 55)    # #fb8037
ACCENT_BLUE = (61, 175, 234)     # #3dafea
LIGHT_GRAY = (240, 240, 240)     # #f0f0f0
DARK_GRAY = (85, 85, 85)         # #555555
SUCCESS_GREEN = (34, 177, 76)    # #22b14c

class SocialMediaGraphics:
    def __init__(self):
        self.font_sizes = {
            'title': 48,
            'subtitle': 32,
            'body': 24,
            'small': 18,
            'tiny': 14
        }
    
    def create_gradient_background(self, size, color1, color2):
        """Create gradient background"""
        width, height = size
        image = PILImage.new('RGB', size, color1)
        draw = ImageDraw.Draw(image)
        
        for i in range(height):
            ratio = i / height
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.line([(0, i), (width, i)], fill=(r, g, b))
        
        return image
    
    def download_property_image(self, image_url, size=(800, 600)):
        """Download and resize property image"""
        try:
            if image_url.startswith('/uploads/'):
                local_path = f".{image_url}"
                if os.path.exists(local_path):
                    img = PILImage.open(local_path)
                    img = img.resize(size, PILImage.Resampling.LANCZOS)
                    return img
            else:
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                img = PILImage.open(io.BytesIO(response.content))
                img = img.resize(size, PILImage.Resampling.LANCZOS)
                return img
        except Exception as e:
            print(f"Error downloading image {image_url}: {e}")
            return None
        
        return None
    
    def create_instagram_post(self, property_data, filename):
        """Create Instagram square post (1080x1080)"""
        size = INSTAGRAM_SQUARE
        
        # Create gradient background
        background = self.create_gradient_background(size, BRAND_PURPLE, BRAND_ORANGE)
        
        # Try to add property image
        images = property_data.get('images', [])
        if images:
            prop_img = self.download_property_image(images[0], (700, 500))
            if prop_img:
                # Add rounded corners to property image
                mask = PILImage.new('L', prop_img.size, 0)
                draw = ImageDraw.Draw(mask)
                draw.rounded_rectangle([(0, 0), prop_img.size], radius=30, fill=255)
                
                prop_img.putalpha(mask)
                background.paste(prop_img, (190, 150), prop_img)
        
        # Add text overlay
        draw = ImageDraw.Draw(background)
        
        try:
            # Try to load custom font
            title_font = ImageFont.truetype("arial.ttf", self.font_sizes['title'])
            subtitle_font = ImageFont.truetype("arial.ttf", self.font_sizes['subtitle'])
            body_font = ImageFont.truetype("arial.ttf", self.font_sizes['body'])
        except:
            # Fallback to default font
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            body_font = ImageFont.load_default()
        
        # Property title (top)
        title = property_data.get('title', 'Premium Property')
        if len(title) > 50:
            title = title[:47] + "..."
        
        # Calculate text position
        title_bbox = draw.textbbox((0, 0), title, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = (size[0] - title_width) // 2
        
        # White background for title
        padding = 20
        draw.rounded_rectangle([
            (title_x - padding, 60 - padding),
            (title_x + title_width + padding, 120 + padding)
        ], radius=15, fill=white, outline=None)
        
        draw.text((title_x, 80), title, fill=DARK_GRAY, font=title_font)
        
        # Price (prominent)
        price = property_data.get('salePrice')
        if price and price > 0:
            price_text = f"R {int(price):,}"
        else:
            price_text = "POA"
        
        price_bbox = draw.textbbox((0, 0), price_text, font=title_font)
        price_width = price_bbox[2] - price_bbox[0]
        price_x = (size[0] - price_width) // 2
        
        # Orange background for price
        draw.rounded_rectangle([
            (price_x - padding, 700 - padding),
            (price_x + price_width + padding, 760 + padding)
        ], radius=15, fill=BRAND_ORANGE, outline=None)
        
        draw.text((price_x, 720), price_text, fill=white, font=title_font)
        
        # Property details
        details = []
        if property_data.get('bedrooms'):
            details.append(f"{property_data['bedrooms']} Bed")
        if property_data.get('bathrooms'):
            details.append(f"{property_data['bathrooms']} Bath")
        if property_data.get('floorArea'):
            details.append(f"{property_data['floorArea']}m²")
        
        if details:
            details_text = " • ".join(details)
            details_bbox = draw.textbbox((0, 0), details_text, font=subtitle_font)
            details_width = details_bbox[2] - details_bbox[0]
            details_x = (size[0] - details_width) // 2
            
            draw.rounded_rectangle([
                (details_x - padding, 800 - padding),
                (details_x + details_width + padding, 840 + padding)
            ], radius=10, fill=(255, 255, 255, 220), outline=None)
            
            draw.text((details_x, 810), details_text, fill=DARK_GRAY, font=subtitle_font)
        
        # Location
        location_parts = []
        if property_data.get('suburb'):
            location_parts.append(property_data['suburb'])
        if property_data.get('city'):
            location_parts.append(property_data['city'])
        
        if location_parts:
            location_text = ", ".join(location_parts)
            location_bbox = draw.textbbox((0, 0), location_text, font=body_font)
            location_width = location_bbox[2] - location_bbox[0]
            location_x = (size[0] - location_width) // 2
            
            draw.text((location_x, 880), f"📍 {location_text}", fill=white, font=body_font)
        
        # Spurgeon Property branding (bottom)
        brand_text = "SPURGEON Property"
        brand_bbox = draw.textbbox((0, 0), brand_text, font=subtitle_font)
        brand_width = brand_bbox[2] - brand_bbox[0]
        brand_x = (size[0] - brand_width) // 2
        
        draw.text((brand_x, 980), brand_text, fill=white, font=subtitle_font)
        
        # Contact info
        contact_text = "www.spurgeonproperty.co.za"
        contact_bbox = draw.textbbox((0, 0), contact_text, font=body_font)
        contact_width = contact_bbox[2] - contact_bbox[0]
        contact_x = (size[0] - contact_width) // 2
        
        draw.text((contact_x, 1020), contact_text, fill=white, font=body_font)
        
        # Save image
        background.save(filename, 'PNG', quality=95)
        return True
    
    def create_instagram_story(self, property_data, filename):
        """Create Instagram story (1080x1920)"""
        size = INSTAGRAM_STORY
        
        # Create gradient background
        background = self.create_gradient_background(size, BRAND_PURPLE, BRAND_ORANGE)
        
        # Property image (larger for story format)
        images = property_data.get('images', [])
        if images:
            prop_img = self.download_property_image(images[0], (900, 600))
            if prop_img:
                # Add rounded corners
                mask = PILImage.new('L', prop_img.size, 0)
                draw_mask = ImageDraw.Draw(mask)
                draw_mask.rounded_rectangle([(0, 0), prop_img.size], radius=40, fill=255)
                
                prop_img.putalpha(mask)
                background.paste(prop_img, (90, 300), prop_img)
        
        draw = ImageDraw.Draw(background)
        
        try:
            title_font = ImageFont.truetype("arial.ttf", 52)
            subtitle_font = ImageFont.truetype("arial.ttf", 36)
            body_font = ImageFont.truetype("arial.ttf", 28)
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            body_font = ImageFont.load_default()
        
        # Brand header
        brand_text = "SPURGEON Property"
        brand_bbox = draw.textbbox((0, 0), brand_text, font=title_font)
        brand_width = brand_bbox[2] - brand_bbox[0]
        brand_x = (size[0] - brand_width) // 2
        
        draw.text((brand_x, 80), brand_text, fill=white, font=title_font)
        
        # Property title
        title = property_data.get('title', 'Premium Property')
        if len(title) > 40:
            title = title[:37] + "..."
        
        title_bbox = draw.textbbox((0, 0), title, font=subtitle_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = (size[0] - title_width) // 2
        
        # White background for title
        padding = 25
        draw.rounded_rectangle([
            (title_x - padding, 180 - padding),
            (title_x + title_width + padding, 220 + padding)
        ], radius=20, fill=white, outline=None)
        
        draw.text((title_x, 190), title, fill=DARK_GRAY, font=subtitle_font)
        
        # Price (below image)
        price = property_data.get('salePrice')
        if price and price > 0:
            price_text = f"R {int(price):,}"
        else:
            price_text = "Price on Application"
        
        price_bbox = draw.textbbox((0, 0), price_text, font=title_font)
        price_width = price_bbox[2] - price_bbox[0]
        price_x = (size[0] - price_width) // 2
        
        draw.rounded_rectangle([
            (price_x - padding, 950 - padding),
            (price_x + price_width + padding, 1000 + padding)
        ], radius=20, fill=BRAND_ORANGE, outline=None)
        
        draw.text((price_x, 960), price_text, fill=white, font=title_font)
        
        # Property specs
        specs_y = 1080
        spec_box_width = 300
        spec_box_height = 80
        
        specs = []
        if property_data.get('bedrooms'):
            specs.append((f"🛏️ {property_data['bedrooms']}", "Bedrooms"))
        if property_data.get('bathrooms'):
            specs.append((f"🚿 {property_data['bathrooms']}", "Bathrooms"))
        if property_data.get('floorArea'):
            specs.append((f"📐 {property_data['floorArea']}m²", "Floor Area"))
        
        for i, (icon_value, label) in enumerate(specs[:3]):
            x_pos = 90 + i * 300
            
            # Spec box
            draw.rounded_rectangle([
                (x_pos, specs_y),
                (x_pos + spec_box_width, specs_y + spec_box_height)
            ], radius=15, fill=(255, 255, 255, 230), outline=None)
            
            # Icon and value
            icon_bbox = draw.textbbox((0, 0), icon_value, font=subtitle_font)
            icon_width = icon_bbox[2] - icon_bbox[0]
            icon_x = x_pos + (spec_box_width - icon_width) // 2
            
            draw.text((icon_x, specs_y + 15), icon_value, fill=BRAND_PURPLE, font=subtitle_font)
            
            # Label
            label_bbox = draw.textbbox((0, 0), label, font=body_font)
            label_width = label_bbox[2] - label_bbox[0]
            label_x = x_pos + (spec_box_width - label_width) // 2
            
            draw.text((label_x, specs_y + 50), label, fill=DARK_GRAY, font=body_font)
        
        # Location
        location_parts = []
        if property_data.get('suburb'):
            location_parts.append(property_data['suburb'])
        if property_data.get('city'):
            location_parts.append(property_data['city'])
        
        if location_parts:
            location_text = f"📍 {', '.join(location_parts)}"
            location_bbox = draw.textbbox((0, 0), location_text, font=body_font)
            location_width = location_bbox[2] - location_bbox[0]
            location_x = (size[0] - location_width) // 2
            
            draw.text((location_x, 1220), location_text, fill=white, font=body_font)
        
        # Contact call-to-action
        cta_text = "Contact us for viewing"
        cta_bbox = draw.textbbox((0, 0), cta_text, font=subtitle_font)
        cta_width = cta_bbox[2] - cta_bbox[0]
        cta_x = (size[0] - cta_width) // 2
        
        draw.rounded_rectangle([
            (cta_x - padding, 1320 - padding),
            (cta_x + cta_width + padding, 1360 + padding)
        ], radius=25, fill=SUCCESS_GREEN, outline=None)
        
        draw.text((cta_x, 1330), cta_text, fill=white, font=subtitle_font)
        
        # Website
        website_text = "www.spurgeonproperty.co.za"
        website_bbox = draw.textbbox((0, 0), website_text, font=body_font)
        website_width = website_bbox[2] - website_bbox[0]
        website_x = (size[0] - website_width) // 2
        
        draw.text((website_x, 1420), website_text, fill=white, font=body_font)
        
        # Save image
        background.save(filename, 'PNG', quality=95)
        return True
    
    def create_facebook_post(self, property_data, filename):
        """Create Facebook post (1200x630)"""
        size = FACEBOOK_POST
        
        # Create gradient background
        background = self.create_gradient_background(size, BRAND_PURPLE, BRAND_ORANGE)
        
        # Property image (left side)
        images = property_data.get('images', [])
        if images:
            prop_img = self.download_property_image(images[0], (550, 400))
            if prop_img:
                mask = PILImage.new('L', prop_img.size, 0)
                draw_mask = ImageDraw.Draw(mask)
                draw_mask.rounded_rectangle([(0, 0), prop_img.size], radius=25, fill=255)
                
                prop_img.putalpha(mask)
                background.paste(prop_img, (50, 115), prop_img)
        
        draw = ImageDraw.Draw(background)
        
        try:
            title_font = ImageFont.truetype("arial.ttf", 36)
            subtitle_font = ImageFont.truetype("arial.ttf", 24)
            body_font = ImageFont.truetype("arial.ttf", 20)
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            body_font = ImageFont.load_default()
        
        # Right side content
        content_x = 650
        
        # Property title
        title = property_data.get('title', 'Premium Property')
        if len(title) > 35:
            title = title[:32] + "..."
        
        draw.text((content_x, 80), title, fill=white, font=title_font)
        
        # Price
        price = property_data.get('salePrice')
        if price and price > 0:
            price_text = f"R {int(price):,}"
        else:
            price_text = "POA"
        
        draw.text((content_x, 140), price_text, fill=BRAND_ORANGE, font=title_font)
        
        # Property details
        details_y = 200
        if property_data.get('bedrooms'):
            draw.text((content_x, details_y), f"🛏️ {property_data['bedrooms']} Bedrooms", fill=white, font=subtitle_font)
            details_y += 35
        
        if property_data.get('bathrooms'):
            draw.text((content_x, details_y), f"🚿 {property_data['bathrooms']} Bathrooms", fill=white, font=subtitle_font)
            details_y += 35
        
        if property_data.get('floorArea'):
            draw.text((content_x, details_y), f"📐 {property_data['floorArea']}m² Floor Area", fill=white, font=subtitle_font)
            details_y += 35
        
        # Location
        location_parts = []
        if property_data.get('suburb'):
            location_parts.append(property_data['suburb'])
        if property_data.get('city'):
            location_parts.append(property_data['city'])
        
        if location_parts:
            location_text = f"📍 {', '.join(location_parts)}"
            draw.text((content_x, details_y + 20), location_text, fill=white, font=body_font)
        
        # Branding (bottom)
        brand_y = 550
        draw.text((content_x, brand_y), "SPURGEON Property", fill=white, font=subtitle_font)
        draw.text((content_x, brand_y + 30), "www.spurgeonproperty.co.za", fill=white, font=body_font)
        
        # Save image
        background.save(filename, 'PNG', quality=95)
        return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python create_social_media_graphics.py <properties_json_file>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    try:
        with open(json_file, 'r') as f:
            properties_data = json.load(f)
        
        if not properties_data:
            print("No properties found in JSON file")
            sys.exit(1)
        
        generator = SocialMediaGraphics()
        
        # Create graphics for first few properties
        for i, property_data in enumerate(properties_data[:3]):  # Limit to first 3
            prop_id = property_data.get('id', i)
            
            # Instagram square post
            instagram_file = f"property_{prop_id}_instagram.png"
            if generator.create_instagram_post(property_data, instagram_file):
                print(f"Created Instagram post: {instagram_file}")
            
            # Instagram story
            story_file = f"property_{prop_id}_story.png"
            if generator.create_instagram_story(property_data, story_file):
                print(f"Created Instagram story: {story_file}")
            
            # Facebook post
            facebook_file = f"property_{prop_id}_facebook.png"
            if generator.create_facebook_post(property_data, facebook_file):
                print(f"Created Facebook post: {facebook_file}")
        
        print("Social media graphics generated successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()