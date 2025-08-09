import React, { useState } from 'react';
import { Trash2, Eye, Image as ImageIcon, Star, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { unitsApi } from '@/lib/api';
import { cn } from '@/utils/cn';

interface UnitImageGalleryProps {
  unitId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  canDelete?: boolean;
  className?: string;
}

export const UnitImageGallery: React.FC<UnitImageGalleryProps> = ({
  unitId,
  images,
  onImagesChange,
  canDelete = false,
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const setAsCover = async (imageUrl: string) => {
    const current = images || [];
    if (current[0] === imageUrl) return;
    const reordered = [imageUrl, ...current.filter((u) => u !== imageUrl)];
    onImagesChange(reordered);
    toast({ title: 'Cover set', description: 'This image is now the cover photo.' });
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    try {
      await unitsApi.deleteUnitImage(unitId, imageUrl);
      
      // Update local state
      const updatedImages = images.filter(img => img !== imageUrl);
      onImagesChange(updatedImages);
      
      toast({
        title: "Image deleted",
        description: "The image has been successfully removed.",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setImageToDelete(null);
    }
  };



  const getImageFileName = (imageUrl: string) => {
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      return pathParts[pathParts.length - 1] || 'unit-image';
    } catch {
      return 'unit-image';
    }
  };

  if (!images || images.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No images yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload some photos to showcase this unit
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">Unit Photos</h3>
              <Badge variant="secondary" className="text-xs">
                {images.length} {images.length === 1 ? 'photo' : 'photos'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className={`group relative aspect-square rounded-lg overflow-hidden border transition-all duration-200 hover:shadow-md ${
                  index === 0 
                    ? 'border-2 border-amber-500/80 ring-2 ring-amber-500/30 shadow-xl' // Enhanced cover image styling
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`Unit photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Cover indicator for first image */}
                {index === 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant="default" 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-lg border-0 px-2 py-1"
                    >
                      <Crown className="h-3 w-3 mr-1 text-amber-100" />
                      Cover
                    </Badge>
                  </div>
                )}

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-background/90 hover:bg-background text-foreground"
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {canDelete && (
                      <>
                        {/* Only show "Set as Cover" for non-cover images */}
                        {index !== 0 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0 bg-background/90 hover:bg-background text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAsCover(imageUrl);
                            }}
                            title="Set as cover"
                          >
                            <Crown className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 bg-destructive/90 hover:bg-destructive text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageToDelete(imageUrl);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ConfirmationDialog
                          isOpen={imageToDelete === imageUrl}
                          onClose={() => setImageToDelete(null)}
                          onConfirm={() => handleDeleteImage(imageUrl)}
                          title="Delete Photo"
                          description="Are you sure you want to delete this photo? This action cannot be undone."
                          confirmText={isDeleting ? 'Deleting...' : 'Delete'}
                          cancelText="Cancel"
                          variant="destructive"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Image number badge - only show for non-cover images */}
                {index !== 0 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs bg-background/90 text-foreground">
                      {index + 1}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full-screen image viewer */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Unit Photo</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="px-6 pb-6">
              <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                <img
                  src={selectedImage}
                  alt="Unit photo"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {getImageFileName(selectedImage)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {canDelete && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAsCover(selectedImage)}
                        title="Set as cover"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Make cover
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => setImageToDelete(selectedImage)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                      <ConfirmationDialog
                        isOpen={imageToDelete === selectedImage}
                        onClose={() => setImageToDelete(null)}
                        onConfirm={() => {
                          handleDeleteImage(selectedImage);
                          setSelectedImage(null);
                        }}
                        title="Delete Photo"
                        description="Are you sure you want to delete this photo? This action cannot be undone."
                        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
                        cancelText="Cancel"
                        variant="destructive"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
