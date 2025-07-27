import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  Camera, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Phone
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

// API
import { tenantApi } from '@/lib/api';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'APPLIANCE' | 'STRUCTURAL' | 'OTHER';
  location: string;
  photos: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
  assignedTo?: string;
  notes?: string;
}

const priorities = [
  { value: 'LOW', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
  { value: 'MEDIUM', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

const categories = [
  { value: 'PLUMBING', label: 'Plumbing', icon: '🚰' },
  { value: 'ELECTRICAL', label: 'Electrical', icon: '⚡' },
  { value: 'HVAC', label: 'HVAC', icon: '❄️' },
  { value: 'APPLIANCE', label: 'Appliance', icon: '🔌' },
  { value: 'STRUCTURAL', label: 'Structural', icon: '🏗️' },
  { value: 'OTHER', label: 'Other', icon: '🔧' },
];

export function MaintenanceRequest() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'OTHER' as const,
    location: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const submitMutation = useMutation({
    mutationFn: (data: FormData) => tenantApi.submitMaintenanceRequest(data),
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'OTHER',
        location: '',
      });
      setPhotos([]);
    },
    onError: (error: any) => {
      console.error('Maintenance request submission error:', error);
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', formData.location);

      photos.forEach((photo, index) => {
        formDataToSend.append(`photos`, photo);
      });

      await submitMutation.mutateAsync(formDataToSend);
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '🔧';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Submit Maintenance Request
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Report maintenance issues and track their progress
        </p>
      </motion.div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Request Submitted Successfully
            </DialogTitle>
            <DialogDescription>
              Your maintenance request has been submitted and will be reviewed by your property manager. You'll receive updates on the progress.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccess(false)}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Request Details</CardTitle>
              <CardDescription>
                Provide detailed information about the maintenance issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Issue Title</label>
                  <Input
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="mr-2">{category.icon}</span>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <Badge className={priority.color}>
                              {priority.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="e.g., Kitchen sink, Bedroom window, etc."
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Detailed Description</label>
                  <Textarea
                    placeholder="Provide a detailed description of the issue, including when it started and any relevant details..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">Photos (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline">
                            <Camera className="h-4 w-4 mr-2" />
                            Upload Photos
                          </Button>
                        </label>
                        <input
                          id="photo-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Upload photos to help describe the issue
                      </p>
                    </div>
                  </div>

                  {/* Photo Preview */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !formData.title || !formData.description}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Request
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Priority Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Priority Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorities.map((priority) => (
                <div key={priority.value} className="flex items-center justify-between">
                  <span className="text-sm">{priority.label}</span>
                  <Badge className={priority.color}>
                    {priority.value}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Better Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <span className="text-sm">Be specific about the location and issue</span>
              </div>
              <div className="flex items-start gap-2">
                <Camera className="h-4 w-4 text-blue-500 mt-0.5" />
                <span className="text-sm">Photos help technicians understand the problem</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Urgent issues are addressed within 24 hours</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Immediate Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For emergency maintenance issues, contact your property manager directly.
              </p>
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Contact Manager
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 