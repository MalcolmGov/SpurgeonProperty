import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const defaultImages = [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800"
  ];

  const galleryImages = images && images.length > 0 ? images : defaultImages;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={galleryImages[currentImageIndex]}
          alt={`${title} - Image ${currentImageIndex + 1}`}
          className="w-full h-96 object-cover"
        />
        
        {/* Gallery Controls */}
        {galleryImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {/* View All Photos Button */}
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              View all {galleryImages.length} photos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={() => setIsGalleryOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
              
              <img
                src={galleryImages[currentImageIndex]}
                alt={`${title} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {galleryImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Thumbnail Gallery */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {galleryImages.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative rounded-lg overflow-hidden hover:opacity-80 transition-opacity ${
                currentImageIndex === index ? 'ring-2 ring-purple-primary' : ''
              }`}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-20 object-cover"
              />
              {index === 3 && galleryImages.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                  +{galleryImages.length - 4}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
