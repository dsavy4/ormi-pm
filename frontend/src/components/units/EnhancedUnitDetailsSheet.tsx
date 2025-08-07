import React, { useState, useEffect, useRef } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building, 
  User, 
  Home, 
  Wrench, 
  Clock, 
  AlertCircle, 
  Edit, 
  X, 
  FileText, 
  Download, 
  ArrowUpRight, 
  Loader2, 
  Info, 
  BarChart3 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EnhancedUnitDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  unit: any;
  onUpdate: () => void;
}

export const EnhancedUnitDetailsSheet: React.FC<EnhancedUnitDetailsSheetProps> = ({ 
  isOpen, 
  onClose, 
  unit, 
  onUpdate 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load unit details when sheet opens
  useEffect(() => {
    if (isOpen && unit) {
      loadUnitDetails();
    }
  }, [isOpen, unit]);

  const loadUnitDetails = async () => {
    try {
      // TODO: Load real data from API
      // const { data } = await unitsApi.getDetails(unit.id);
      // setUploadedDocuments(data.documents || []);
      // setMaintenanceHistory(data.maintenance || []);
    } catch (error) {
      console.error('Failed to load unit details:', error);
    }
  };

  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload to Cloudflare R2
      console.log('Uploading document:', file.name);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: '#'
      };
      
      setUploadedDocuments(prev => [newDoc, ...prev]);
      toast.success(`Document "${file.name}" uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEditUnit = () => {
    // TODO: Implement edit unit functionality
    toast.info('Edit unit functionality coming soon');
  };

  const handleCreateMaintenanceRequest = () => {
    // TODO: Implement maintenance request creation
    toast.info('Maintenance request creation coming soon');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'text-green-600 dark:text-green-400';
      case 'vacant': return 'text-blue-600 dark:text-blue-400';
      case 'maintenance': return 'text-amber-600 dark:text-amber-400';
      case 'reserved': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <User className="h-4 w-4" />;
      case 'vacant': return <Home className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!unit) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[45%] md:w-[40%] lg:w-[35%] flex flex-col h-full p-0 gap-0">
        {/* Header */}
        <div className="border-b bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-xl font-semibold text-foreground">
                  Unit {unit.number}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Building A • Floor {unit.floor || 'N/A'}
                </SheetDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getStatusColor(unit.status)}`}
            >
              {getStatusIcon(unit.status)}
              <span>
                {unit.status === 'occupied' ? 'Occupied' : 
                 unit.status === 'vacant' ? 'Available' : 
                 unit.status === 'maintenance' ? 'Maintenance' : 
                 unit.status === 'reserved' ? 'Reserved' : 'No Status'}
              </span>
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${unit.monthlyRent?.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Monthly Rent</p>
              </div>
              {unit.tenant && (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{unit.tenant.name}</p>
                  <p className="text-xs text-muted-foreground">Current Tenant</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleEditUnit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Unit
            </Button>
            {!unit.tenant ? (
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Add Tenant
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Manage Tenant
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleCreateMaintenanceRequest} className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Unit Information Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Unit Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unit Number</span>
                  <span className="font-medium text-foreground">{unit.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Floor</span>
                  <span className="font-medium text-foreground">{unit.floor || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bedrooms</span>
                  <span className="font-medium text-foreground">{unit.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bathrooms</span>
                  <span className="font-medium text-foreground">{unit.bathrooms}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Square Footage</span>
                  <span className="font-medium text-foreground">
                    {unit.squareFootage ? `${unit.squareFootage} sqft` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Building</span>
                  <span className="font-medium text-foreground">Building A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unit Type</span>
                  <span className="font-medium text-foreground">Apartment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Parking</span>
                  <span className="font-medium text-foreground">1 Space</span>
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Amenities</span>
              <div className="flex flex-wrap gap-2">
                {unit.amenities && unit.amenities.length > 0 ? (
                  unit.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="pt-4 border-t">
              <h5 className="font-medium text-foreground mb-3">Financial Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Rent</span>
                    <span className="font-medium text-foreground">${unit.monthlyRent?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Security Deposit</span>
                    <span className="font-medium text-foreground">${unit.securityDeposit?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pet Deposit</span>
                    <span className="font-medium text-foreground">$0</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Utilities</span>
                    <span className="font-medium text-foreground">Not Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Late Fee</span>
                    <span className="font-medium text-foreground">$50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Grace Period</span>
                    <span className="font-medium text-foreground">5 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Tenant */}
            {unit.tenant && (
              <div className="pt-4 border-t">
                <h5 className="font-medium text-foreground mb-3">Current Tenant</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name</span>
                      <span className="font-medium text-foreground">{unit.tenant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="font-medium text-foreground">{unit.tenant.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="font-medium text-foreground">{unit.tenant.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Move-in Date</span>
                      <span className="font-medium text-foreground">Jan 1, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Lease Term</span>
                      <span className="font-medium text-foreground">12 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Next Payment</span>
                      <span className="font-medium text-foreground">May 1, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Documents & Files
            </h4>
            <div className="space-y-3">
              {uploadedDocuments.length > 0 ? (
                uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No documents uploaded</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={handleUploadDocument}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                      {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <FileText className="h-4 w-4" />
                      View All Documents
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Maintenance & History
            </h4>
            <div className="space-y-3">
              {maintenanceHistory.length > 0 ? (
                maintenanceHistory.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{maintenance.title}</p>
                      <p className="text-sm text-muted-foreground">{maintenance.date}</p>
                    </div>
                    <Badge variant={maintenance.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {maintenance.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">No maintenance history</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateMaintenanceRequest}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Wrench className="h-4 w-4" />
                    Create Work Order
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t bg-card p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row gap-2 order-2 sm:order-1">
              <Button 
                variant="outline" 
                onClick={handleEditUnit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Unit
              </Button>
              <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}; 