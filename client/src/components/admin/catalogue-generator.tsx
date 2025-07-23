import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FileText, Download, Image, Loader2, ExternalLink } from 'lucide-react';

interface CatalogueResponse {
  success: boolean;
  message: string;
  filename: string;
  downloadUrl: string;
}

export function CatalogueGenerator() {
  const { toast } = useToast();
  const [generatingHTML, setGeneratingHTML] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const generateHTMLMutation = useMutation({
    mutationFn: () => fetch('/api/admin/catalogue/html', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    }).then(res => {
      if (!res.ok) throw new Error('Failed to generate HTML catalogue');
      return res.json();
    }),
    onMutate: () => setGeneratingHTML(true),
    onSettled: () => setGeneratingHTML(false),
    onSuccess: (data: CatalogueResponse) => {
      toast({
        title: "Success!",
        description: data.message,
        variant: "default",
      });
      
      // Open HTML catalogue in new tab
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate HTML catalogue",
        variant: "destructive",
      });
    }
  });

  const generatePDFMutation = useMutation({
    mutationFn: () => fetch('/api/admin/catalogue/pdf', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    }).then(res => {
      if (!res.ok) throw new Error('Failed to generate PDF catalogue');
      return res.json();
    }),
    onMutate: () => setGeneratingPDF(true),
    onSettled: () => setGeneratingPDF(false),
    onSuccess: (data: CatalogueResponse) => {
      toast({
        title: "Success!",
        description: data.message,
        variant: "default",
      });
      
      // Trigger PDF download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate PDF catalogue",
        variant: "destructive",
      });
    }
  });

  const handleGenerateHTML = () => {
    generateHTMLMutation.mutate();
  };

  const handleGeneratePDF = () => {
    generatePDFMutation.mutate();
  };

  const openHTMLCatalogue = () => {
    window.open('/spurgeon_catalogue.html', '_blank');
  };

  const downloadPDFCatalogue = () => {
    window.open('/spurgeon_professional_catalogue.pdf', '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
          Professional Property Catalogues
        </h2>
        <p className="text-muted-foreground mt-2">
          Generate modern, eye-catching property catalogues optimized for social media marketing and professional sharing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* HTML Catalogue Card */}
        <Card className="border-2 hover:border-purple-200 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">HTML Web Catalogue</CardTitle>
                  <CardDescription className="text-sm">
                    Modern web-based catalogue for social media
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Web
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✨ Responsive design for all devices</p>
              <p>🎨 Modern gradients and animations</p>
              <p>📱 Perfect for social media sharing</p>
              <p>🔗 Direct web links for easy distribution</p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleGenerateHTML}
                disabled={generatingHTML}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {generatingHTML ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
                    Generate HTML
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={openHTMLCatalogue}
                className="border-purple-200 hover:bg-purple-50"
                title="View HTML Catalogue"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PDF Catalogue Card */}
        <Card className="border-2 hover:border-orange-200 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Professional PDF</CardTitle>
                  <CardDescription className="text-sm">
                    High-quality PDF for printing and sharing
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                Print
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📄 Professional typography and layout</p>
              <p>🖨️ Optimized for high-quality printing</p>
              <p>🎯 Property cards with detailed specs</p>
              <p>🏢 Branded with Spurgeon Property colors</p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={downloadPDFCatalogue}
                className="border-orange-200 hover:bg-orange-50"
                title="Download PDF Catalogue"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Guide */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">How to Use Your Catalogues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">HTML Catalogue Best For:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Social media posts and stories</li>
                <li>• Website integration</li>
                <li>• Email marketing campaigns</li>
                <li>• Mobile viewing and sharing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">PDF Catalogue Best For:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Client presentations</li>
                <li>• Professional brochures</li>
                <li>• Print marketing materials</li>
                <li>• Email attachments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}