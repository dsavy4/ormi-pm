import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Info, 
  BarChart3,
  DollarSign,
  Image as ImageIcon,
  Plus,
  Calendar
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { UnitImageGallery } from './UnitImageGallery';
import { UnitImageUpload } from './UnitImageUpload';

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
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [tenantHistory, setTenantHistory] = useState<any[]>([]);
  const [unitImages, setUnitImages] = useState<any[]>(unit?.images || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Load unit details when sheet opens
  useEffect(() => {
    if (isOpen && unit) {
      loadUnitDetails();
    }
  }, [isOpen, unit]);

  // Update images when unit prop changes
  useEffect(() => {
    console.log('[DEBUG] Unit images prop changed:', unit?.images);
    if (unit?.images) {
      console.log('[DEBUG] Setting unitImages state to:', unit.images);
      setUnitImages(unit.images);
    }
  }, [unit?.images]);

  const loadUnitDetails = async () => {
    try {
      const { unitsApi } = await import('@/lib/api');
      const resp = await unitsApi.getDetails(unit.id);
      const details = (resp as any)?.data ?? resp;
      console.log('[DEBUG] Loaded unit details:', details);
      console.log('[DEBUG] Details images:', details?.images);
      console.log('[DEBUG] Unit prop images:', unit?.images);
      
      setUploadedDocuments(details?.documents || []);
      setMaintenanceHistory(details?.maintenance || []);
      setTenantHistory(details?.tenantHistory || []);
      
      const newImages = details?.images || unit?.images || [];
      console.log('[DEBUG] Setting unitImages to:', newImages);
      setUnitImages(newImages);
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
      toast({
        title: "Document uploaded",
        description: `Document "${file.name}" uploaded successfully`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload document",
        variant: "destructive",
      });
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
    toast({
      title: "Coming soon",
      description: "Edit unit functionality coming soon",
      variant: "default",
    });
  };

  const handleCreateMaintenanceRequest = () => {
    // TODO: Implement maintenance request creation
    toast({
      title: "Coming soon",
      description: "Maintenance request creation coming soon",
      variant: "default",
    });
  };



  const getStatusType = (unit: any) => {
    if (unit.status === 'occupied') return 'occupied';
    if (unit.status === 'vacant') return 'vacant';
    if (unit.status === 'maintenance') return 'maintenance';
    if (unit.status === 'reserved') return 'reserved';
    return 'default';
  };

  if (!unit) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[92%] md:w-[65%] lg:w-[50%] xl:w-[45%] flex flex-col h-full p-0 gap-0">
        {/* Professional Header with Unit Identity */}
        <div className="border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
          {/* Header */}
          <div className="px-6 py-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/30 rounded-2xl shadow-lg">
                  <Home className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <StatusBadge 
                    status={getStatusType(unit)}
                    size="sm"
                    className="flex-shrink-0"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                  Unit {unit.number}
                  <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700">
                    {unit.bedrooms}BR • {unit.bathrooms}BA
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-base text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Building className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Building A • Floor {unit.floor || 'N/A'}</span>
                </SheetDescription>
              </div>
            </div>

            {/* Enhanced Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  ${unit.monthlyRent?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Monthly Rent</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {unit.squareFootage ? `${unit.squareFootage}` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Square Feet</div>
              </div>
              {unit.tenant && (
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    <User className="h-6 w-6 mx-auto mb-1" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{unit.tenant.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Action Section */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 rounded-2xl mx-6 mt-6 p-6 border border-gray-200 dark:border-slate-700">
          {/* Primary Action - Edit Unit */}
          <div className="flex justify-center mb-6">
            <Button 
              onClick={handleEditUnit}
              className="flex items-center gap-3 px-8 py-4 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Edit className="h-5 w-5" />
              Edit Unit
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-4">
            {!unit.tenant ? (
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                Manage Tenant
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleCreateMaintenanceRequest}
              className="h-12 font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600 hover:text-orange-700 dark:hover:text-orange-300 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Work Order
            </Button>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="flex-1 min-h-0">
          <Tabs defaultValue="overview" className="h-full flex flex-col" key={unit?.id}>
            {/* Tab Navigation */}
            <div className="border-b bg-background px-4 sm:px-6">
              <TabsList className="w-full grid grid-cols-3 h-12">
                <TabsTrigger value="overview" className="text-sm px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="details" className="text-sm px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Details
                </TabsTrigger>
                <TabsTrigger value="history" className="text-sm px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0">
              <TabsContent value="overview" className="h-full data-[state=inactive]:hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 sm:p-6 space-y-8">
                    {/* Professional Unit Information Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/30">
                      <h4 className="font-bold text-xl flex items-center gap-3 mb-6 text-gray-900 dark:text-white">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        Unit Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit Number</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{unit.number}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Floor</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{unit.floor || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{unit.bedrooms}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{unit.bathrooms}</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Square Footage</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{unit.squareFootage ? `${unit.squareFootage} sqft` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Building</span>
                            <span className="font-semibold text-gray-900 dark:text-white">Building A</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit Type</span>
                            <span className="font-semibold text-gray-900 dark:text-white">Apartment</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parking</span>
                            <span className="font-semibold text-gray-900 dark:text-white">1 Space</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800/30">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Amenities</span>
                        <div className="flex flex-wrap gap-2">
                          {unit.amenities && unit.amenities.length > 0 ? (
                            unit.amenities.map((amenity: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                                {amenity}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Financial Information Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800/30">
                      <h4 className="font-bold text-xl flex items-center gap-3 mb-6 text-gray-900 dark:text-white">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        Financial Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Rent</span>
                            <span className="font-semibold text-gray-900 dark:text-white">${unit.monthlyRent?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security Deposit</span>
                            <span className="font-semibold text-gray-900 dark:text-white">${unit.securityDeposit?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800/30">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pet Fee</span>
                            <span className="font-semibold text-gray-900 dark:text-white">${unit.petFee?.toLocaleString() || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Utilities Included</span>
                            <span className="font-medium text-foreground">{unit.utilitiesIncluded ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Parking Fee</span>
                            <span className="font-medium text-foreground">${unit.parkingFee?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Late Fee</span>
                            <span className="font-medium text-foreground">${unit.lateFee?.toLocaleString() || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Photos Section */}
                    <div className="space-y-6">
                      <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                        <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Photos & Media
                      </h4>
                      
                      <UnitImageGallery
                        unitId={unit.id}
                        images={unitImages}
                        onImagesChange={setUnitImages}
                        canDelete={true}
                        className="mb-6"
                      />
                      
                      <UnitImageUpload
                        unitId={unit.id}
                        currentImages={unitImages}
                        onImagesChange={setUnitImages}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="details" className="h-full data-[state=inactive]:hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 sm:p-6 space-y-8">
                    {/* Documents Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                        <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Documents & Files
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Upload new document</span>
                          <div className="flex items-center gap-2">
                            <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleUploadDocument} className="hidden" />
                            <Button variant="outline" size="sm" onClick={() => documentInputRef.current?.click()} className="flex items-center gap-2">
                              <ArrowUpRight className="h-4 w-4" />
                              Upload
                            </Button>
                          </div>
                        </div>
                        {uploadedDocuments.length > 0 ? (
                          <div className="space-y-2">
                            {uploadedDocuments.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">{doc.type || 'Document'}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Maintenance Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                        <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        Maintenance & Work Orders
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Create new work order</span>
                          <Button variant="outline" size="sm" onClick={handleCreateMaintenanceRequest} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            New Order
                          </Button>
                        </div>
                        {maintenanceHistory.length > 0 ? (
                          <div className="space-y-2">
                            {maintenanceHistory.slice(0, 5).map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Wrench className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{item.title || `Maintenance ${maintenanceHistory.indexOf(item) + 1}`}</p>
                                    <p className="text-xs text-muted-foreground">{item.status || 'Pending'}</p>
                                  </div>
                                </div>
                                <Badge variant={item.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                                      {item.status === 'COMPLETED' ? 'Completed' : 
                                       item.status === 'IN_PROGRESS' ? 'In Progress' : 
                                       item.status === 'PENDING' ? 'Pending' : 'Unknown'}
                                    </Badge>
                              </div>
                            ))}
                            {maintenanceHistory.length > 5 && (
                              <div className="text-center py-2">
                                <span className="text-sm text-muted-foreground">+{maintenanceHistory.length - 5} more work orders</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                            <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No maintenance requests yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="history" className="h-full data-[state=inactive]:hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 sm:p-6 space-y-8">
                    {/* Tenant History Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                        <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Tenant History
                      </h4>
                      <div className="space-y-3">
                        {/* Current Occupancy - Show First (DoorLoop Pattern) */}
                        {unit?.tenant ? (
                          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-800 dark:text-green-200">Current Occupancy</span>
                              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                Active
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm text-foreground">
                                  {unit.tenant.firstName} {unit.tenant.lastName}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Move-in:</span> {unit.tenant.moveInDate ? new Date(unit.tenant.moveInDate).toLocaleDateString() : 'N/A'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Lease End:</span> {unit.leaseEndDate ? new Date(unit.leaseEndDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Current Status</span>
                              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                                Vacant
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              No current tenant assigned to this unit.
                            </div>
                          </div>
                        )}

                        {/* Previous Tenants */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">Previous Tenants</h5>
                          {unit?.tenantHistory && unit.tenantHistory.length > 0 ? (
                            unit.tenantHistory.map((tenant, index) => (
                              <div key={index} className="bg-card border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {tenant.firstName} {tenant.lastName}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {tenant.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div>Move-in: {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : 'N/A'}</div>
                                  <div>Move-out: {tenant.moveOutDate ? new Date(tenant.moveOutDate).toLocaleDateString() : 'N/A'}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-4">
                              No previous tenant history available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Occupancy Timeline */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          Occupancy Timeline
                        </h4>
                        
                        {/* Timeline Component */}
                        <div className="space-y-4">
                          {/* Current Period - Highlighted */}
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-200 dark:bg-green-800"></div>
                            <div className="relative flex items-start gap-4 pl-8">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Current Period</span>
                                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                      Active
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      <span className="text-sm font-medium text-foreground">
                                        {unit?.tenant ? `${unit.tenant.firstName} ${unit.tenant.lastName}` : 'Vacant'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                      <div>
                                        <span className="font-medium">Start:</span> January 1, 2024
                                      </div>
                                      <div>
                                        <span className="font-medium">End:</span> December 31, 2024
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      <span className="font-medium">Rent:</span> ${unit?.monthlyRent?.toLocaleString()}/month
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Previous Periods */}
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="relative flex items-start gap-4 pl-8">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-card border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-foreground">Previous Period</span>
                                    <Badge variant="outline" className="text-xs">
                                      Completed
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      <span className="text-sm font-medium text-foreground">Sarah Johnson</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                      <div>
                                        <span className="font-medium">Start:</span> March 1, 2023
                                      </div>
                                      <div>
                                        <span className="font-medium">End:</span> December 31, 2023
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      <span className="font-medium">Rent:</span> $2,700/month
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Earlier Period */}
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="relative flex items-start gap-4 pl-8">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-card border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-foreground">Earlier Period</span>
                                    <Badge variant="outline" className="text-xs">
                                      Completed
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                      <span className="text-sm font-medium text-foreground">Michael Chen</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                      <div>
                                        <span className="font-medium">Start:</span> June 1, 2022
                                      </div>
                                      <div>
                                        <span className="font-medium">End:</span> February 28, 2023
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      <span className="font-medium">Rent:</span> $2,600/month
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Future Availability */}
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="relative flex items-start gap-4 pl-8">
                              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Future Availability</span>
                                    <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                      Available
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">
                                      Unit will be available for new tenants starting January 1, 2025
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      <span className="font-medium">Projected Rent:</span> $2,900/month
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Timeline Summary */}
                          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                            <h5 className="text-sm font-medium text-foreground mb-3">Timeline Summary</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div className="text-center">
                                <div className="text-lg font-semibold text-foreground">3</div>
                                <div className="text-muted-foreground">Total Tenants</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-foreground">$2,600</div>
                                <div className="text-muted-foreground">Lowest Rent</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-foreground">$2,900</div>
                                <div className="text-muted-foreground">Highest Rent</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-foreground">92%</div>
                                <div className="text-muted-foreground">Occupancy Rate</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>


      </SheetContent>
    </Sheet>
  );
}; 