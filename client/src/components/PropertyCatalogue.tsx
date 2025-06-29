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
  const [isGeneratingPython, setIsGeneratingPython] = useState(false);
  
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
            <h1 style="color: #8b5cf6; font-size: 32px; margin: 0; font-weight: 700; letter-spacing: 1px;">${catalogueTitle}</h1>
            ${clientName ? `<p style="color: #6b7280; font-size: 16px; margin: 10px 0;">Prepared for: ${clientName}</p>` : ''}
          </div>
        </div>

        <div>
          ${selectedProps.map((property, index) => {
            // Fix: featuredImage is the full path, not an index
            let imageName = '';
            if (property.featuredImage && typeof property.featuredImage === 'string') {
              imageName = property.featuredImage;
            } else if (property.images && property.images.length > 0) {
              imageName = property.images[0]; // Use first image as fallback
            }
            
            // Construct image URL
            let imageUrl = '';
            if (imageName) {
              if (imageName.startsWith('/uploads/')) {
                imageUrl = `${window.location.origin}${imageName}`;
              } else if (imageName.startsWith('property-')) {
                imageUrl = `${window.location.origin}/uploads/${imageName}`;
              } else {
                imageUrl = `${window.location.origin}/uploads/${imageName}`;
              }
            }
            
            // Add page break after every property (except the last one)
            const pageBreak = (index < selectedProps.length - 1) ? 
              '<div style="page-break-after: always; height: 1px;"></div>' : '';

            return `
            <div style="page-break-before: ${index > 0 ? 'always' : 'auto'}; page-break-after: auto; page-break-inside: avoid; min-height: 95vh; margin-bottom: 20px;">
              <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                ${property.images && property.images.length > 0 && imageUrl ? `
                  <div style="position: relative; height: 300px; background: #f8f9fa;">
                    <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="${property.title}" crossorigin="anonymous" />
                    <div style="position: absolute; top: 20px; left: 20px; background: rgba(139, 92, 246, 0.9); color: white; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 20px;">
                      ${formatPrice(property.price)}
                    </div>
                    <div style="position: absolute; top: 20px; right: 20px; background: rgba(139, 92, 246, 0.9); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; text-transform: capitalize;">
                      ${property.propertyType}
                    </div>
                  </div>
                ` : `
                  <div style="height: 300px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; flex-direction: column;">
                    <div style="font-size: 64px; margin-bottom: 15px;">🏠</div>
                    <div style="font-size: 16px; color: #6b7280;">No Image Available</div>
                  </div>
                `}
              
                <div style="padding: 30px;">
                  <h3 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 15px 0; line-height: 1.3;">${property.title}</h3>
                  
                  <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px; margin-bottom: 18px;">
                    <span style="margin-right: 8px;">📍</span>
                    ${property.address}, ${property.suburb}, ${property.city}, ${property.province}
                  </div>

                  ${!["commercial", "land"].includes(property.propertyType) ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 18px;">
                      <div style="text-align: center; padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="font-weight: 600; color: #1f2937; font-size: 18px;">🛏️ ${property.bedrooms}</div>
                        <div style="color: #64748b; font-size: 12px; margin-top: 3px;">Bedrooms</div>
                      </div>
                      <div style="text-align: center; padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="font-weight: 600; color: #1f2937; font-size: 18px;">🛁 ${property.bathrooms}</div>
                        <div style="color: #64748b; font-size: 12px; margin-top: 3px;">Bathrooms</div>
                      </div>
                      <div style="text-align: center; padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="font-weight: 600; color: #1f2937; font-size: 18px;">📐 ${property.area || 0}m²</div>
                        <div style="color: #64748b; font-size: 12px; margin-top: 3px;">Area</div>
                      </div>
                    </div>
                  ` : `
                    <div style="display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 18px; max-width: 200px;">
                      <div style="text-align: center; padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="font-weight: 600; color: #1f2937; font-size: 18px;">📐 ${property.area || 0}m²</div>
                        <div style="color: #64748b; font-size: 12px; margin-top: 3px;">Area</div>
                      </div>
                    </div>
                  `}

                  <p style="color: #4b5563; line-height: 1.5; margin-bottom: 18px; font-size: 14px;">
                    ${property.description.length > 250 ? property.description.substring(0, 250) + '...' : property.description}
                  </p>

                  ${property.features && property.features.length > 0 ? `
                    <div style="margin-bottom: 18px;">
                      <h4 style="color: #1f2937; font-size: 15px; font-weight: 600; margin-bottom: 10px;">Key Features:</h4>
                      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${property.features.slice(0, 6).map(feature => `
                          <span style="background: #f3f0ff; color: #7c3aed; padding: 5px 10px; border-radius: 5px; font-size: 12px; border: 1px solid #e9d5ff;">${feature}</span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                  ${property.agent ? `
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 18px; margin-top: 18px;">
                      <h4 style="color: #1f2937; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Contact Agent:</h4>
                      <div style="color: #6b7280; font-size: 13px; line-height: 1.4;">
                        <div style="margin-bottom: 3px;"><strong>${property.agent.name}</strong> - ${property.agent.title}</div>
                        <div style="margin-bottom: 3px;">📧 ${property.agent.email}</div>
                        <div>📞 ${property.agent.phone}</div>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
          }).join('')}
        </div>

        <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%); border-radius: 12px; text-align: center;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <img src="${window.location.origin}/spurgeon-logo.png" alt="Spurgeon Property" style="height: 50px; margin-bottom: 15px;" />
            <h2 style="color: #8b5cf6; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: 1px;">Your Gateway to Premium Properties</h2>
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

  const generatePythonCatalogue = async () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Properties Selected",
        description: "Please select at least one property for the catalogue",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPython(true);

    try {
      const response = await fetch('/api/properties/catalogue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyIds: selectedProperties,
          title: catalogueTitle || 'Property Catalogue',
          clientName: clientName,
          format: 'python-pdf'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${catalogueTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'catalogue'}_professional.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Professional PDF catalogue generated successfully!",
        });

        setIsOpen(false);
        setSelectedProperties([]);
        setCatalogueTitle('Property Portfolio');
        setClientName('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate professional PDF');
      }
    } catch (error) {
      console.error('Python catalogue generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate professional PDF catalogue",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPython(false);
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

          {/* Generate Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={generateCatalogue} 
              disabled={isGenerating || isGeneratingPython || selectedProperties.length === 0}
              variant="outline"
            >
              {isGenerating ? (
                <>Generating HTML...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  HTML Catalogue
                </>
              )}
            </Button>
            <Button 
              onClick={generatePythonCatalogue} 
              disabled={isGenerating || isGeneratingPython || selectedProperties.length === 0}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              {isGeneratingPython ? (
                <>Generating Professional...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Professional PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}