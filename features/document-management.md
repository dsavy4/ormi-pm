# 📄 **DOCUMENT MANAGEMENT - FEATURE SPECIFICATION**

## 🎯 **OVERVIEW**
Document Management provides enterprise-grade document storage, organization, and management for property management operations. This system includes advanced file organization, version control, collaboration tools, and storage analytics for billing purposes.

**🌐 ROUTE: `/documents`**

---

## 🗂️ **ACCOUNT-BASED R2 STORAGE STRUCTURE**

### **Organized Storage Hierarchy**
```
ormi-storage/
├── {accountId}/
│   ├── team-members/
│   │   ├── {teamMemberId}/
│   │   │   ├── avatars/
│   │   │   │   ├── {timestamp}-avatar.jpg
│   │   │   │   └── {timestamp}-avatar.png
│   │   │   ├── documents/
│   │   │   │   ├── contracts/
│   │   │   │   ├── certifications/
│   │   │   │   ├── performance-reviews/
│   │   │   │   └── training-materials/
│   │   │   └── media/
│   │   │       ├── photos/
│   │   │       └── videos/
│   │   └── ...
│   ├── properties/
│   │   ├── {propertyId}/
│   │   │   ├── photos/
│   │   │   │   ├── exterior/
│   │   │   │   ├── interior/
│   │   │   │   ├── amenities/
│   │   │   │   └── maintenance/
│   │   │   ├── documents/
│   │   │   │   ├── leases/
│   │   │   │   ├── contracts/
│   │   │   │   ├── permits/
│   │   │   │   ├── insurance/
│   │   │   │   ├── maintenance-records/
│   │   │   │   └── financial-documents/
│   │   │   ├── units/
│   │   │   │   ├── {unitId}/
│   │   │   │   │   ├── photos/
│   │   │   │   │   ├── leases/
│   │   │   │   │   ├── maintenance/
│   │   │   │   │   └── inspections/
│   │   │   │   └── ...
│   │   │   └── media/
│   │   │       ├── virtual-tours/
│   │   │       ├── drone-footage/
│   │   │       └── marketing-materials/
│   │   └── ...
│   ├── tenants/
│   │   ├── {tenantId}/
│   │   │   ├── applications/
│   │   │   ├── leases/
│   │   │   ├── payments/
│   │   │   ├── maintenance-requests/
│   │   │   ├── communications/
│   │   │   └── legal-documents/
│   │   └── ...
│   ├── maintenance/
│   │   ├── {requestId}/
│   │   │   ├── photos/
│   │   │   ├── invoices/
│   │   │   ├── work-orders/
│   │   │   └── before-after/
│   │   └── ...
│   ├── financial/
│   │   ├── invoices/
│   │   ├── receipts/
│   │   ├── tax-documents/
│   │   ├── bank-statements/
│   │   └── reports/
│   ├── marketing/
│   │   ├── brochures/
│   │   ├── flyers/
│   │   ├── social-media/
│   │   └── advertising/
│   ├── legal/
│   │   ├── contracts/
│   │   ├── compliance/
│   │   ├── insurance/
│   │   └── litigation/
│   ├── templates/
│   │   ├── lease-templates/
│   │   ├── contract-templates/
│   │   ├── form-templates/
│   │   └── report-templates/
│   └── shared/
│       ├── company-policies/
│       ├── training-materials/
│       ├── procedures/
│       └── resources/
└── ...
```

### **Storage Analytics & Billing**
```typescript
interface StorageAnalytics {
  accountId: string;
  totalStorage: number; // in bytes
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
```

---

## 📋 **CORE DOCUMENT MANAGEMENT FEATURES**

### **Document Upload & Organization**

#### **Multi-File Upload System**
- **Drag-and-Drop Interface**: Professional drag-and-drop with visual feedback
- **Bulk Upload**: Upload multiple files simultaneously
- **Progress Tracking**: Real-time upload progress with pause/resume
- **File Validation**: Type, size, and content validation
- **Auto-Organization**: Intelligent file categorization
- **Metadata Extraction**: Automatic metadata extraction from documents

#### **Smart File Organization**
- **Auto-Categorization**: AI-powered file categorization
- **Tagging System**: Custom tags and labels
- **Folder Structure**: Hierarchical folder organization
- **Search & Filter**: Advanced search with filters
- **Version Control**: Document versioning and history
- **Duplicate Detection**: Smart duplicate file detection

#### **Document Types & Categories**
```typescript
interface DocumentCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  allowedTypes: string[];
  maxFileSize: number;
  requiredFields: string[];
  autoTags: string[];
}

const DOCUMENT_CATEGORIES = [
  {
    id: 'leases',
    name: 'Leases & Contracts',
    icon: FileText,
    color: 'blue',
    allowedTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    requiredFields: ['tenantName', 'propertyId', 'startDate', 'endDate'],
    autoTags: ['legal', 'contract', 'lease']
  },
  {
    id: 'maintenance',
    name: 'Maintenance Records',
    icon: Wrench,
    color: 'orange',
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    maxFileSize: 25 * 1024 * 1024, // 25MB
    requiredFields: ['propertyId', 'issueType', 'priority'],
    autoTags: ['maintenance', 'repair', 'service']
  },
  {
    id: 'financial',
    name: 'Financial Documents',
    icon: DollarSign,
    color: 'green',
    allowedTypes: ['pdf', 'xlsx', 'csv', 'doc', 'docx'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    requiredFields: ['documentType', 'amount', 'date'],
    autoTags: ['financial', 'billing', 'payment']
  },
  {
    id: 'photos',
    name: 'Photos & Media',
    icon: Camera,
    color: 'purple',
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    requiredFields: ['propertyId', 'category'],
    autoTags: ['photo', 'media', 'visual']
  },
  {
    id: 'legal',
    name: 'Legal Documents',
    icon: Scale,
    color: 'red',
    allowedTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 15 * 1024 * 1024, // 15MB
    requiredFields: ['documentType', 'expiryDate'],
    autoTags: ['legal', 'compliance', 'regulatory']
  }
];
```

### **Advanced Document Viewer**

#### **Multi-Format Support**
- **PDF Viewer**: Full-featured PDF viewer with annotations
- **Image Viewer**: High-resolution image viewing with zoom
- **Video Player**: Video playback with controls
- **Document Editor**: In-browser document editing
- **Spreadsheet Viewer**: Excel/CSV file viewing
- **CAD Viewer**: Building plans and blueprints

#### **Collaboration Features**
- **Comments & Annotations**: Add comments and annotations
- **Version History**: Track document changes
- **Approval Workflows**: Document approval processes
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Change Tracking**: Track who made what changes
- **Audit Trail**: Complete document activity history

### **Search & Discovery**

#### **Advanced Search System**
```typescript
interface DocumentSearch {
  query: string;
  filters: {
    category: string[];
    tags: string[];
    dateRange: { from: Date; to: Date };
    fileType: string[];
    size: { min: number; max: number };
    author: string[];
    status: string[];
  };
  sortBy: 'relevance' | 'date' | 'name' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  includeArchived: boolean;
  searchInContent: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  category: string;
  tags: string[];
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  lastModified: Date;
  thumbnail?: string;
  preview?: string;
  relevance: number;
}
```

#### **Smart Search Features**
- **Full-Text Search**: Search within document content
- **OCR Integration**: Search scanned documents
- **Fuzzy Matching**: Handle typos and variations
- **Semantic Search**: Understand search intent
- **Saved Searches**: Save and reuse search queries
- **Search Suggestions**: Intelligent search suggestions

---

## 🎨 **PROFESSIONAL UX DESIGN**

### **Document Dashboard**

#### **Main Interface Layout**
```tsx
// Document Dashboard with exact Properties.tsx styling
<div className="min-h-screen bg-background">
  {/* Header with storage analytics */}
  <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
    <div className="flex h-16 items-center px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Document Management</h1>
        </div>
        
        {/* Storage Usage Indicator */}
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
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-80"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {documentCategories.map(category => (
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
      <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
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

    {/* Document Grid/List */}
    <div className="grid gap-4">
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map(document => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
      
      {viewMode === 'list' && (
        <div className="space-y-2">
          {documents.map(document => (
            <DocumentListItem key={document.id} document={document} />
          ))}
        </div>
      )}
      
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          {groupedDocuments.map(group => (
            <DocumentTimelineGroup key={group.date} group={group} />
          ))}
        </div>
      )}
    </div>
  </div>
</div>
```

### **Document Card Component**
```tsx
const DocumentCard = ({ document }: { document: Document }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {document.thumbnail ? (
          <Image
            src={document.thumbnail}
            alt={document.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <FileText className="h-12 w-12 text-gray-400" />
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
};
```

### **Upload Dialog with Progress**
```tsx
const UploadDialog = () => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  
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
    });
  }, []);
  
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
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
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
          <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
            Cancel
          </Button>
          <Button disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 📊 **STORAGE ANALYTICS & BILLING**

### **Storage Analytics Dashboard**
```tsx
const StorageAnalyticsDialog = () => {
  return (
    <Dialog open={showStorageAnalytics} onOpenChange={setShowStorageAnalytics}>
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
                <div className="text-2xl font-bold">{formatBytes(storageAnalytics.totalStorage)}</div>
                <p className="text-xs text-muted-foreground">
                  {((storageAnalytics.totalStorage / storageAnalytics.storageLimit) * 100).toFixed(1)}% of limit
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{storageAnalytics.fileCounts.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across {Object.keys(storageAnalytics.storageBreakdown).length} categories
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${storageAnalytics.estimatedCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {storageAnalytics.overageAmount > 0 ? `+$${storageAnalytics.overageAmount.toFixed(2)} overage` : 'Within limit'}
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
                {Object.entries(storageAnalytics.storageBreakdown).map(([category, size]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(size / storageAnalytics.totalStorage) * 100}%` }}
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
          
          {/* Usage Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  data={storageAnalytics.usageTrends.monthly}
                  xKey="date"
                  yKey="storageUsed"
                  color="primary"
                />
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
                  <Badge variant="outline">{storageAnalytics.billingTier}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Storage Limit</span>
                  <span>{formatBytes(storageAnalytics.storageLimit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Used Storage</span>
                  <span>{formatBytes(storageAnalytics.totalStorage)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Available</span>
                  <span>{formatBytes(storageAnalytics.storageLimit - storageAnalytics.totalStorage)}</span>
                </div>
                {storageAnalytics.overageAmount > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span>Overage Cost</span>
                    <span>+${storageAnalytics.overageAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Backend API Endpoints**
```typescript
// Document Management API Routes
app.get('/api/documents', (c) => documentController.getAll(c));
app.post('/api/documents', (c) => documentController.upload(c));
app.get('/api/documents/:id', (c) => documentController.getById(c));
app.put('/api/documents/:id', (c) => documentController.update(c));
app.delete('/api/documents/:id', (c) => documentController.delete(c));
app.post('/api/documents/:id/versions', (c) => documentController.createVersion(c));
app.get('/api/documents/:id/versions', (c) => documentController.getVersions(c));
app.post('/api/documents/:id/comments', (c) => documentController.addComment(c));
app.get('/api/documents/:id/comments', (c) => documentController.getComments(c));
app.post('/api/documents/bulk-upload', (c) => documentController.bulkUpload(c));
app.post('/api/documents/bulk-delete', (c) => documentController.bulkDelete(c));
app.get('/api/documents/search', (c) => documentController.search(c));
app.get('/api/documents/analytics', (c) => documentController.getAnalytics(c));
app.get('/api/documents/storage-usage', (c) => documentController.getStorageUsage(c));
app.post('/api/documents/:id/share', (c) => documentController.share(c));
app.get('/api/documents/shared', (c) => documentController.getShared(c));
```

### **R2 Storage Service Enhancement**
```typescript
class EnhancedStorageService {
  // Account-based storage methods
  async uploadDocument(
    file: Buffer,
    fileName: string,
    contentType: string,
    accountId: string,
    category: string,
    subcategory?: string
  ): Promise<{ url: string; key: string }> {
    const key = this.generateDocumentKey(accountId, category, subcategory, fileName);
    // Upload logic with account-based organization
  }
  
  async getStorageAnalytics(accountId: string): Promise<StorageAnalytics> {
    // Calculate storage usage by category
    const breakdown = await this.calculateStorageBreakdown(accountId);
    const fileCounts = await this.calculateFileCounts(accountId);
    const usageTrends = await this.calculateUsageTrends(accountId);
    
    return {
      accountId,
      totalStorage: Object.values(breakdown).reduce((a, b) => a + b, 0),
      storageBreakdown: breakdown,
      fileCounts,
      usageTrends,
      billingTier: await this.getBillingTier(accountId),
      storageLimit: await this.getStorageLimit(accountId),
      overageAmount: await this.calculateOverage(accountId),
      estimatedCost: await this.calculateCost(accountId)
    };
  }
  
  private generateDocumentKey(
    accountId: string, 
    category: string, 
    subcategory?: string, 
    fileName: string
  ): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (subcategory) {
      return `${accountId}/${category}/${subcategory}/${timestamp}-${sanitizedFileName}`;
    }
    return `${accountId}/${category}/${timestamp}-${sanitizedFileName}`;
  }
}
```

---

## 🏆 **DOORLOOP & APPFOLIO SUPERIORITY FEATURES**

### **Advanced Document Management**
1. **AI-Powered Organization**: Automatic categorization vs. manual organization
2. **Advanced Search**: Full-text search with OCR vs. basic filename search
3. **Version Control**: Complete version history vs. basic file storage
4. **Collaboration Tools**: Real-time collaboration vs. static documents
5. **Storage Analytics**: Detailed usage analytics vs. basic storage info
6. **Account-Based Organization**: Hierarchical storage vs. flat structure
7. **Advanced Viewer**: Multi-format viewer vs. basic PDF viewer
8. **Billing Integration**: Storage-based billing vs. fixed pricing
9. **Mobile Optimization**: Touch-optimized vs. desktop-only
10. **API Integration**: Full API access vs. limited integration

### **User Experience**
1. **Professional UI**: Enterprise-grade design vs. basic interface
2. **Multiple View Modes**: Grid/List/Timeline vs. single view
3. **Drag-and-Drop**: Professional upload interface vs. basic file picker
4. **Real-time Updates**: Live collaboration vs. static documents
5. **Advanced Filtering**: Smart filters vs. basic search
6. **Storage Monitoring**: Real-time analytics vs. no monitoring
7. **Bulk Operations**: Efficient bulk management vs. individual operations
8. **Mobile Excellence**: Perfect mobile experience vs. desktop focus
9. **Dark/Light Mode**: Complete theme support vs. light only
10. **Performance**: Sub-3 second load times vs. slow loading

---

## 🚀 **SUCCESS METRICS**

### **User Experience KPIs**
- **Document Upload Success Rate**: >99%
- **Search Accuracy**: >95%
- **User Satisfaction**: >4.5/5
- **Time to Find Documents**: <30 seconds
- **Mobile Usage**: >70% of users

### **Performance KPIs**
- **Upload Speed**: <5 seconds for 10MB files
- **Search Response Time**: <2 seconds
- **Storage Efficiency**: >90% compression ratio
- **API Response Time**: <200ms
- **Uptime**: >99.9%

### **Business Impact KPIs**
- **Storage Cost Reduction**: >40% through optimization
- **Document Retrieval Time**: >60% faster
- **Compliance Rate**: >95% document compliance
- **User Adoption**: >85% within 30 days
- **Storage Utilization**: >80% efficient usage

---

## 📋 **IMPLEMENTATION PRIORITY**

### **🔥 Phase 1 (Week 1) - Core Document Management**
1. **Document Dashboard**: Complete document management interface
2. **Upload System**: Professional drag-and-drop upload
3. **Basic CRUD**: Create, read, update, delete operations
4. **Storage Analytics**: Basic storage monitoring
5. **Mobile Responsive**: Perfect mobile experience
6. **Account-Based Storage**: R2 organization structure
7. **Search & Filter**: Basic search functionality
8. **Multiple View Modes**: Grid/List/Timeline views

### **🚀 Phase 2 (Week 2) - Advanced Features**
1. **Advanced Search**: Full-text search with OCR
2. **Version Control**: Document versioning system
3. **Collaboration Tools**: Comments and annotations
4. **Bulk Operations**: Efficient bulk management
5. **Advanced Analytics**: Detailed storage analytics
6. **Mobile App**: Native mobile experience

### **🎯 Phase 3 (Week 3) - AI & Integration**
1. **AI-Powered Features**: Automatic categorization
2. **Advanced Viewer**: Multi-format document viewer
3. **Billing Integration**: Storage-based billing system
4. **API Integration**: Full API access
5. **Security Features**: Advanced security and compliance
6. **Performance Optimization**: Advanced caching and optimization

---

## 🎉 **FINAL DELIVERABLE**

**Create the most advanced Document Management system in the property management industry that:**

✅ **Surpasses DoorLoop and AppFolio 100x fold** in functionality and UX
✅ **Implements account-based R2 storage** with hierarchical organization
✅ **Provides comprehensive storage analytics** with billing integration
✅ **Delivers professional UX** with perfect dark/light mode support
✅ **Enables advanced document features** with AI-powered organization
✅ **Supports mobile excellence** with touch-optimized interfaces
✅ **Integrates with Cloudflare R2** for scalable file storage
✅ **Implements advanced search** with full-text and OCR capabilities
✅ **Provides collaboration tools** with real-time editing
✅ **Delivers sub-3 second performance** with smooth animations
✅ **Uses exact Properties.tsx patterns** for all UI components
✅ **Implements professional upload** with drag-and-drop and progress tracking
✅ **Uses all ShadCN UI components** with exact styling patterns
✅ **Implements storage monitoring** with real-time analytics
✅ **Uses advanced filtering** with smart search capabilities
✅ **Implements comprehensive validation** with real-time feedback
✅ **Supports mobile integration** with offline capabilities
✅ **Includes version control** and collaboration features
✅ **Provides billing integration** with storage-based pricing
✅ **Implements security & compliance** features with audit logging
✅ **Uses `/documents` route** for document management

**🎯 GOAL: Create the definitive property management document management system that sets new industry standards and becomes the benchmark for professional document management software.**

**🔧 CRITICAL: Must use exact technical patterns from Properties.tsx for all UI components, styling, and interactions to ensure consistency and functionality.**

**🎨 CRITICAL: All colors, gradients, and styling must match Properties.tsx exactly, including dark/light mode compatibility, error states, and professional UX patterns.**

**📱 CRITICAL: Must support mobile devices with touch optimization, offline capabilities, and responsive design.**

**💾 CRITICAL: Must implement account-based R2 storage with comprehensive analytics and billing integration.**

**🔍 CRITICAL: Must provide advanced search capabilities with full-text search, OCR, and intelligent filtering.** 