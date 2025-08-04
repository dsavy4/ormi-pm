import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Search,
  Grid,
  List,
  Clock,
  FolderOpen,
  HardDrive,
  BarChart3,
  FileText,
  Camera,
  Wrench,
  DollarSign,
  Scale,
  Eye,
  Download,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Filter,
  Calendar,
  User,
  Tag,
  Trash2,
  Share2,
  Edit,
  Copy,
  Star,
  Clock as TimeIcon,
  Grid3X3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { documentsApi } from '@/lib/api';

// Types
interface Document {
  id: string;
  name: string;
  fileType: string;
  size: number;
  category: string;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  lastModified: string;
  thumbnail?: string;
  preview?: string;
  url: string;
  status: 'active' | 'archived' | 'deleted';
  version: number;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
}

interface StorageAnalytics {
  accountId: string;
  totalStorage: number;
  storageBreakdown: {
    teamMembers: number;
    properties: number;
    tenants: number;
    maintenance: number;
    financial: number;
    marketing: number;
    legal: number;
    templates: number;
    shared: number;
  };
  fileCounts: {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  };
  usageTrends: {
    daily: StorageUsage[];
    monthly: StorageUsage[];
    yearly: StorageUsage[];
  };
  billingTier: 'basic' | 'professional' | 'enterprise';
  storageLimit: number;
  overageAmount: number;
  estimatedCost: number;
}

interface StorageUsage {
  date: string;
  storageUsed: number;
  filesAdded: number;
  filesDeleted: number;
}

type ViewMode = 'grid' | 'list' | 'timeline';

// Document Categories
const DOCUMENT_CATEGORIES = [
  {
    id: 'leases',
    name: 'Leases & Contracts',
    icon: FileText,
    color: 'blue',
    allowedTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  {
    id: 'maintenance',
    name: 'Maintenance Records',
    icon: Wrench,
    color: 'orange',
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    maxFileSize: 25 * 1024 * 1024, // 25MB
  },
  {
    id: 'financial',
    name: 'Financial Documents',
    icon: DollarSign,
    color: 'green',
    allowedTypes: ['pdf', 'xlsx', 'csv', 'doc', 'docx'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  {
    id: 'photos',
    name: 'Photos & Media',
    icon: Camera,
    color: 'purple',
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  {
    id: 'legal',
    name: 'Legal Documents',
    icon: Scale,
    color: 'red',
    allowedTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 15 * 1024 * 1024, // 15MB
  },
];

export default function Documents() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showStorageAnalytics, setShowStorageAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getAll().then((res: any) => res.data),
  });

  const { data: storageAnalytics } = useQuery({
    queryKey: ['storage-analytics'],
    queryFn: () => documentsApi.getStorageUsage().then((res: any) => res.data),
  });

  // Mutations
  const uploadDocumentMutation = useMutation({
    mutationFn: (data: any) => documentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
      setShowUploadDialog(false);
      setUploadProgress({});
      setUploading(false);
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
      setUploading(false);
    },
  });

  const handleViewModeChange = (value: string) => {
    if (value) setViewMode(value as ViewMode);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const categoryData = DOCUMENT_CATEGORIES.find(c => c.id === category);
    if (!categoryData) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[categoryData.color] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getFileTypeIcon = (fileType: string) => {
    const icons: Record<string, any> = {
      pdf: FileText,
      doc: FileText,
      docx: FileText,
      xlsx: FileText,
      csv: FileText,
      jpg: Camera,
      jpeg: Camera,
      png: Camera,
      gif: Camera,
      mp4: Camera,
      mov: Camera,
    };
    return icons[fileType.toLowerCase()] || FileText;
  };

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploading(true);
    
    acceptedFiles.forEach(file => {
      const fileId = `${file.name}-${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0;
          if (current >= 100) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [fileId]: current + 10 };
        });
      }, 200);
      
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory);
      
      uploadDocumentMutation.mutate(formData);
    });
  }, [selectedCategory, uploadDocumentMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: true
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Document Management</h1>
            </div>
            
            {/* Storage Usage Indicator */}
            {storageAnalytics && (
              <div className="flex items-center gap-2 ml-4">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(storageAnalytics.totalStorage)} / {formatBytes(storageAnalytics.storageLimit)}
                  </span>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${(storageAnalytics.totalStorage / storageAnalytics.storageLimit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            <Button variant="outline" onClick={() => setShowStorageAnalytics(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Storage Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        {/* Filters and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {DOCUMENT_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* View Mode Toggle */}
          <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="timeline" aria-label="Timeline view">
              <Clock className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredDocuments.length} of {documents.length} documents
          </p>
        </div>

        {/* Documents Grid/List/Timeline */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((document: Document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredDocuments.map((document: Document) => (
              <DocumentListItem key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {groupDocumentsByDate(filteredDocuments).map(group => (
              <DocumentTimelineGroup key={group.date} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadDialog 
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        uploadProgress={uploadProgress}
        uploading={uploading}
      />

      {/* Storage Analytics Dialog */}
      <StorageAnalyticsDialog 
        open={showStorageAnalytics}
        onOpenChange={setShowStorageAnalytics}
        analytics={storageAnalytics}
      />
    </div>
  );
}

// Document Card Component
function DocumentCard({ document }: { document: Document }) {
  const FileTypeIcon = getFileTypeIcon(document.fileType);
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {document.thumbnail ? (
          <img
            src={document.thumbnail}
            alt={document.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <FileTypeIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* File Type Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            {document.fileType.toUpperCase()}
          </Badge>
        </div>
        
        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{document.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(document.size)} • {formatDate(document.uploadedAt)}
            </p>
          </div>
        </div>
        
        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Document List Item Component
function DocumentListItem({ document }: { document: Document }) {
  const FileTypeIcon = getFileTypeIcon(document.fileType);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <FileTypeIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{document.name}</h3>
              <Badge variant="outline" className={`text-xs ${getCategoryColor(document.category)}`}>
                {document.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {formatBytes(document.size)} • {formatDate(document.uploadedAt)} • {document.uploadedBy}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Document Timeline Group Component
function DocumentTimelineGroup({ group }: { group: { date: string; documents: Document[] } }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TimeIcon className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-sm">{formatDate(group.date)}</h3>
        <Badge variant="outline" className="text-xs">
          {group.documents.length} documents
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {group.documents.map(document => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    </div>
  );
}

// Upload Dialog Component
function UploadDialog({ 
  open, 
  onOpenChange, 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  uploadProgress, 
  uploading 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
  uploadProgress: Record<string, number>;
  uploading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to browse. You can upload multiple files at once.
          </DialogDescription>
        </DialogHeader>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (Max 50MB per file)
          </p>
        </div>
        
        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="space-y-2 mt-4">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{fileId.split('-')[0]}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Storage Analytics Dialog Component
function StorageAnalyticsDialog({ 
  open, 
  onOpenChange, 
  analytics 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  analytics?: StorageAnalytics;
}) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!analytics) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Storage Analytics</DialogTitle>
          <DialogDescription>
            Monitor your storage usage and costs across all document categories.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Storage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(analytics.totalStorage)}</div>
                <p className="text-xs text-muted-foreground">
                  {((analytics.totalStorage / analytics.storageLimit) * 100).toFixed(1)}% of limit
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.fileCounts.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across {Object.keys(analytics.storageBreakdown).length} categories
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.estimatedCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overageAmount > 0 ? `+$${analytics.overageAmount.toFixed(2)} overage` : 'Within limit'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Storage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Storage by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.storageBreakdown).map(([category, size]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(size / analytics.totalStorage) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {formatBytes(size)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing & Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Plan</span>
                  <Badge variant="outline">{analytics.billingTier}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Storage Limit</span>
                  <span>{formatBytes(analytics.storageLimit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Used Storage</span>
                  <span>{formatBytes(analytics.totalStorage)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Available</span>
                  <span>{formatBytes(analytics.storageLimit - analytics.totalStorage)}</span>
                </div>
                {analytics.overageAmount > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span>Overage Cost</span>
                    <span>+${analytics.overageAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
function getFileTypeIcon(fileType: string) {
  const icons: Record<string, any> = {
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    xlsx: FileText,
    csv: FileText,
    jpg: Camera,
    jpeg: Camera,
    png: Camera,
    gif: Camera,
    mp4: Camera,
    mov: Camera,
  };
  return icons[fileType.toLowerCase()] || FileText;
}

function getCategoryColor(category: string) {
  const categoryData = DOCUMENT_CATEGORIES.find(c => c.id === category);
  if (!categoryData) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[categoryData.color] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

function groupDocumentsByDate(documents: Document[]) {
  const groups: Record<string, Document[]> = {};
  
  documents.forEach(doc => {
    const date = new Date(doc.uploadedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(doc);
  });
  
  return Object.entries(groups)
    .map(([date, docs]) => ({ date, documents: docs }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
} 