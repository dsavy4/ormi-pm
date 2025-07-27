import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  Download, 
  FileText, 
  Image, 
  File, 
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  FileX,
  FilePlus,
  FolderOpen,
  Share2,
  Lock,
  Unlock,
  Star,
  Bookmark,
  MoreHorizontal,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

// API
import { tenantApi } from '@/lib/api';

interface Document {
  id: string;
  name: string;
  type: 'LEASE' | 'RECEIPT' | 'CONTRACT' | 'NOTICE' | 'INSPECTION' | 'OTHER';
  status: 'PENDING_SIGNATURE' | 'SIGNED' | 'EXPIRED' | 'ACTIVE';
  size: number;
  uploadedAt: string;
  expiresAt?: string;
  signedAt?: string;
  url: string;
  isSigned: boolean;
  isExpired: boolean;
  isImportant: boolean;
  category: string;
  tags: string[];
}

const documentTypes = [
  { value: 'LEASE', label: 'Lease Agreement', icon: '📄', color: 'bg-blue-100 text-blue-800' },
  { value: 'RECEIPT', label: 'Payment Receipt', icon: '🧾', color: 'bg-green-100 text-green-800' },
  { value: 'CONTRACT', label: 'Service Contract', icon: '📋', color: 'bg-purple-100 text-purple-800' },
  { value: 'NOTICE', label: 'Notice/Letter', icon: '📢', color: 'bg-orange-100 text-orange-800' },
  { value: 'INSPECTION', label: 'Inspection Report', icon: '🔍', color: 'bg-red-100 text-red-800' },
  { value: 'OTHER', label: 'Other', icon: '📁', color: 'bg-gray-100 text-gray-800' },
];

const statuses = [
  { value: 'PENDING_SIGNATURE', label: 'Pending Signature', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'SIGNED', label: 'Signed', color: 'bg-green-100 text-green-800' },
  { value: 'EXPIRED', label: 'Expired', color: 'bg-red-100 text-red-800' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-blue-100 text-blue-800' },
];

export function DocumentManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  // Fetch documents
  const { 
    data: documentsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['tenant-documents'],
    queryFn: () => tenantApi.getDocuments(),
    staleTime: 5 * 60 * 1000,
  });

  const documents = documentsData?.data || [];

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => tenantApi.uploadDocuments(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-documents'] });
      setShowUploadDialog(false);
      setUploadingFiles([]);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadingFiles(files);
  };

  const handleUpload = async () => {
    if (uploadingFiles.length > 0) {
      await uploadMutation.mutateAsync(uploadingFiles);
    }
  };

  const downloadDocument = (document: Document) => {
    // Create a temporary link element
    const a = (document as any).createElement('a');
    a.href = `#${document.id}`; // Replace with actual download URL
    a.download = document.name;
    (document as any).body.appendChild(a);
    a.click();
    (document as any).body.removeChild(a);
  };

  const handleSignDocument = async (document: Document) => {
    // This would integrate with an e-signature service like DocuSign
    console.log('Signing document:', document.id);
  };

  const getDocumentIcon = (type: string) => {
    return documentTypes.find(t => t.value === type)?.icon || '📁';
  };

  const getDocumentTypeColor = (type: string) => {
    return documentTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Document Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Access and manage your lease documents, receipts, and important files
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              All document types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signature</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.status === 'PENDING_SIGNATURE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require your signature
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed Documents</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.status === 'SIGNED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed signatures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Documents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.status === 'EXPIRED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                <div className="text-sm text-gray-500">
                  {filteredDocuments.length} of {documents.length} documents
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documents Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getDocumentIcon(document.type)}</span>
                      <div>
                        <CardTitle className="text-sm font-medium line-clamp-1">
                          {document.name}
                        </CardTitle>
                        <Badge className={getDocumentTypeColor(document.type)}>
                          {documentTypes.find(t => t.value === document.type)?.label}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => downloadDocument(document)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedDocument(document)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {document.status === 'PENDING_SIGNATURE' && (
                          <DropdownMenuItem onClick={() => handleSignDocument(document)}>
                            <FileCheck className="mr-2 h-4 w-4" />
                            Sign Document
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Size</span>
                    <span>{formatFileSize(document.size)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <Badge className={getStatusColor(document.status)}>
                      {statuses.find(s => s.value === document.status)?.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Uploaded</span>
                    <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {document.expiresAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Expires</span>
                      <span className={document.isExpired ? 'text-red-600' : ''}>
                        {new Date(document.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadDocument(document)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    {document.status === 'PENDING_SIGNATURE' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSignDocument(document)}
                      >
                        <FileCheck className="h-4 w-4 mr-1" />
                        Sign
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDocumentIcon(document.type)}</span>
                        <div>
                          <div className="font-medium">{document.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDocumentTypeColor(document.type)}>
                        {documentTypes.find(t => t.value === document.type)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(document.status)}>
                        {statuses.find(s => s.value === document.status)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(document.size)}</TableCell>
                    <TableCell>{new Date(document.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {document.expiresAt ? (
                        <span className={document.isExpired ? 'text-red-600' : ''}>
                          {new Date(document.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => downloadDocument(document)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedDocument(document)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {document.status === 'PENDING_SIGNATURE' && (
                            <DropdownMenuItem onClick={() => handleSignDocument(document)}>
                              <FileCheck className="mr-2 h-4 w-4" />
                              Sign Document
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </motion.div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Upload important documents to your tenant portal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <Button variant="outline">
                      <FilePlus className="h-4 w-4 mr-2" />
                      Select Files
                    </Button>
                  </label>
                  <input
                    id="document-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Upload PDF, DOC, or image files
                </p>
              </div>
            </div>
            {uploadingFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files:</h4>
                {uploadingFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={uploadingFiles.length === 0 || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getDocumentIcon(selectedDocument.type)}</span>
                <div>
                  <h3 className="font-semibold">{selectedDocument.name}</h3>
                  <Badge className={getDocumentTypeColor(selectedDocument.type)}>
                    {documentTypes.find(t => t.value === selectedDocument.type)?.label}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={getStatusColor(selectedDocument.status)}>
                    {statuses.find(s => s.value === selectedDocument.status)?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span>{formatFileSize(selectedDocument.size)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Uploaded:</span>
                  <span>{new Date(selectedDocument.uploadedAt).toLocaleDateString()}</span>
                </div>
                {selectedDocument.expiresAt && (
                  <div>
                    <span className="text-gray-500">Expires:</span>
                    <span className={selectedDocument.isExpired ? 'text-red-600' : ''}>
                      {new Date(selectedDocument.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => downloadDocument(selectedDocument)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {selectedDocument.status === 'PENDING_SIGNATURE' && (
                  <Button
                    className="flex-1"
                    onClick={() => handleSignDocument(selectedDocument)}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Sign Document
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 