import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, MapPin, Bed, Bath, Square } from 'lucide-react';
import type { PropertyWithAgent } from '@shared/schema';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PropertyCatalogueProps {
  className?: string;
}

export default function PropertyCatalogue({ className }: PropertyCatalogueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [catalogueTitle, setCatalogueTitle] = useState('Property Portfolio');
  const [clientName, setClientName] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [listingType, setListingType] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  // Fetch properties for selection
  const { data: properties = [], isLoading } = useQuery<PropertyWithAgent[]>({
    queryKey: ['/api/properties', { propertyType: propertyType !== 'all' ? propertyType : undefined, listingType: listingType !== 'all' ? listingType : undefined, limit: 50 }],
    enabled: isOpen,
  });

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const handlePropertyToggle = (propertyId: number) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const generateCatalogue = async () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Properties Selected",
        description: "Please select at least one property for the catalogue",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const selectedProps = properties.filter(p => selectedProperties.includes(p.id));
      
      if (selectedProps.length === 0) {
        toast({
          title: "No Properties Selected",
          description: "Please select at least one property for the catalogue",
          variant: "destructive",
        });
        return;
      }
      
      // Create a temporary container for PDF generation
      const catalogueContainer = document.createElement('div');
      catalogueContainer.style.position = 'absolute';
      catalogueContainer.style.left = '-9999px';
      catalogueContainer.style.top = '0';
      catalogueContainer.style.width = '794px'; // A4 width in pixels (210mm at 96dpi)
      catalogueContainer.style.backgroundColor = 'white';
      catalogueContainer.style.fontFamily = 'Arial, sans-serif';
      catalogueContainer.style.padding = '40px';
      catalogueContainer.style.boxSizing = 'border-box';

      // Build the catalogue HTML
      catalogueContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%); border-radius: 12px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <img src="${window.location.origin}/spurgeon-logo.png" alt="Spurgeon Property" style="height: 60px; margin-bottom: 15px;" />
            <h1 style="color: #1f2937; font-size: 32px; margin: 0 0 10px 0; font-weight: 700; letter-spacing: 1px;">${catalogueTitle}</h1>
            ${clientName ? `<p style="color: #6b7280; font-size: 16px; margin: 10px 0;">Prepared for: ${clientName}</p>` : ''}
            <div style="height: 2px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%); margin: 20px auto; width: 80%;"></div>
            <h2 style="color: #8b5cf6; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: 0.5px;">Property Portfolio</h2>
          </div>
        </div>

        <div style="display: grid; gap: 30px;">
          ${selectedProps.map(property => {
            const imageIndex = property.featuredImage ? parseInt(property.featuredImage.toString()) : 0;
            const imageName = property.images && property.images[imageIndex] ? property.images[imageIndex] : '';
            const cleanImageName = imageName ? imageName.replace(/^\/uploads\//, '') : '';
            
            return `
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              ${property.images && property.images.length > 0 && cleanImageName ? `
                <div style="height: 200px; background-image: url('${window.location.origin}/uploads/${cleanImageName}'); background-size: cover; background-position: center; position: relative;">
                  <div style="position: absolute; top: 15px; left: 15px; background: rgba(139, 92, 246, 0.9); color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 18px;">
                    ${formatPrice(property.price)}
                  </div>
                  <div style="position: absolute; top: 15px; right: 15px; background: rgba(139, 92, 246, 0.9); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; text-transform: capitalize;">
                    ${property.propertyType}
                  </div>
                </div>
              ` : ''}
              
              <div style="padding: 20px;">
                <h3 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 10px 0;">${property.title}</h3>
                
                <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px; margin-bottom: 15px;">
                  <span style="margin-right: 5px;">📍</span>
                  ${property.address}, ${property.suburb}, ${property.city}, ${property.province}
                </div>

                ${!["commercial", "land"].includes(property.propertyType) ? `
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div style="text-align: center; padding: 10px; background: #f3f4f6; border-radius: 8px;">
                      <div style="font-weight: 600; color: #1f2937; font-size: 18px;">🛏️ ${property.bedrooms}</div>
                      <div style="color: #6b7280; font-size: 12px;">Bedrooms</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: #f3f4f6; border-radius: 8px;">
                      <div style="font-weight: 600; color: #1f2937; font-size: 18px;">🛁 ${property.bathrooms}</div>
                      <div style="color: #6b7280; font-size: 12px;">Bathrooms</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: #f3f4f6; border-radius: 8px;">
                      <div style="font-weight: 600; color: #1f2937; font-size: 18px;">📐 ${property.area}m²</div>
                      <div style="color: #6b7280; font-size: 12px;">Area</div>
                    </div>
                  </div>
                ` : `
                  <div style="text-align: center; padding: 10px; background: #f3f4f6; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-weight: 600; color: #1f2937; font-size: 18px;">📐 ${property.area}m²</div>
                    <div style="color: #6b7280; font-size: 12px;">Area</div>
                  </div>
                `}

                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 15px; font-size: 14px;">
                  ${property.description.substring(0, 200)}${property.description.length > 200 ? '...' : ''}
                </p>

                ${property.features && property.features.length > 0 ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #1f2937; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Key Features:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                      ${property.features.slice(0, 6).map(feature => `
                        <span style="background: #ede9fe; color: #7c3aed; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${feature}</span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${property.agent ? `
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
                    <h4 style="color: #1f2937; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Contact Agent:</h4>
                    <div style="color: #6b7280; font-size: 13px;">
                      <div><strong>${property.agent.name}</strong> - ${property.agent.title}</div>
                      <div>📧 ${property.agent.email}</div>
                      <div>📞 ${property.agent.phone}</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
          }).join('')}
        </div>

        <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%); border-radius: 12px; text-align: center;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <img src="${window.location.origin}/spurgeon-logo.png" alt="Spurgeon Property" style="height: 50px; margin-bottom: 15px;" />
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%); color: transparent; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 700; margin-bottom: 8px; letter-spacing: 1px;">SPURGEON PROPERTY</div>
            <p style="color: #6b7280; font-size: 14px; font-weight: 500; margin: 8px 0;">Your Gateway to Premium Properties</p>
            <div style="border-top: 1px solid #e5e7eb; margin: 15px 0; padding-top: 15px;">
              <p style="color: #374151; font-size: 12px; margin: 4px 0;">📧 info@spurgeonproperty.co.za</p>
              <p style="color: #374151; font-size: 12px; margin: 4px 0;">🌐 www.spurgeonproperty.co.za</p>
              <p style="color: #9ca3af; font-size: 10px; margin-top: 10px;">Premium Real Estate Services • South Africa</p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(catalogueContainer);

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate PDF with error handling
      const canvas = await html2canvas(catalogueContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: catalogueContainer.scrollWidth,
        height: catalogueContainer.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up
      if (document.body.contains(catalogueContainer)) {
        document.body.removeChild(catalogueContainer);
      }

      // Download the PDF
      const fileName = `${catalogueTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_catalogue.pdf`;
      pdf.save(fileName);

      toast({
        title: "Catalogue Generated",
        description: `PDF catalogue with ${selectedProperties.length} properties has been downloaded`,
      });

      setIsOpen(false);
      setSelectedProperties([]);
      setCatalogueTitle('Property Portfolio');
      setClientName('');

    } catch (error) {
      console.error('Catalogue generation error:', error);
      
      // Clean up any remaining containers
      const containers = document.querySelectorAll('[style*="-9999px"]');
      containers.forEach(container => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      });
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate the property catalogue",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <FileText className="h-4 w-4 mr-2" />
          Create Catalogue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Property Catalogue Generator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Catalogue Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <Label htmlFor="catalogue-title">Catalogue Title</Label>
              <Input
                id="catalogue-title"
                value={catalogueTitle}
                onChange={(e) => setCatalogueTitle(e.target.value)}
                placeholder="Property Portfolio"
              />
            </div>
            <div>
              <Label htmlFor="client-name">Client Name (Optional)</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client or Company Name"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">Houses</SelectItem>
                  <SelectItem value="apartment">Apartments</SelectItem>
                  <SelectItem value="townhouse">Townhouses</SelectItem>
                  <SelectItem value="villa">Villas</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Listing Type</Label>
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-medium">Select Properties ({selectedProperties.length} selected)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isLoading}
              >
                {selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading properties...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                      selectedProperties.includes(property.id)
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Checkbox
                      checked={selectedProperties.includes(property.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProperties(prev => [...prev, property.id]);
                        } else {
                          setSelectedProperties(prev => prev.filter(id => id !== property.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div 
                      className="flex-1 min-w-0 cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        const isCurrentlySelected = selectedProperties.includes(property.id);
                        if (isCurrentlySelected) {
                          setSelectedProperties(prev => prev.filter(id => id !== property.id));
                        } else {
                          setSelectedProperties(prev => [...prev, property.id]);
                        }
                      }}
                    >
                      <h4 className="font-medium text-sm truncate">{property.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.suburb}, {property.city}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span className="font-medium text-purple-600">{formatPrice(property.price)}</span>
                        {!["commercial", "land"].includes(property.propertyType) && (
                          <>
                            <span className="flex items-center">
                              <Bed className="h-3 w-3 mr-1" />{property.bedrooms}
                            </span>
                            <span className="flex items-center">
                              <Bath className="h-3 w-3 mr-1" />{property.bathrooms}
                            </span>
                          </>
                        )}
                        <span className="flex items-center">
                          <Square className="h-3 w-3 mr-1" />{property.area}m²
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={generateCatalogue} 
              disabled={isGenerating || selectedProperties.length === 0}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Catalogue
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}