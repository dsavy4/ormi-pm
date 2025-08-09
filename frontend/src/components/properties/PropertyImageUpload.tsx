import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { propertiesApi } from '@/lib/api';

interface PropertyImageUploadProps {
  propertyId: string;
  currentImages: string[];
  onImagesChange: (images: string[]) => void;
  className?: string;
}

export const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  propertyId,
  currentImages,
  onImagesChange,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await propertiesApi.uploadPropertyImages(propertyId, selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        console.log('[DEBUG] Upload response:', response);
        const newImages = response.data.images || [];
        console.log('[DEBUG] New images from response:', newImages);
        console.log('[DEBUG] Calling onImagesChange with:', newImages);
        onImagesChange(newImages);
        
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${selectedFiles.length} image(s).`,
        });
        
        setSelectedFiles([]);
      } else {
        toast({
          title: "Upload failed",
          description: response.error || "Failed to upload images. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading property images:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h4 className="font-semibold text-lg">Upload Property Images</h4>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          or click to select files
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Supports: JPEG, PNG, GIF, WebP (max 10MB each)
        </p>
      </div>

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium">Selected Files ({selectedFiles.length})</h5>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Upload button */}
      {selectedFiles.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
