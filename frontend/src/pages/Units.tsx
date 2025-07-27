import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  Home,
  Plus,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Users,
  Settings,
  Eye,
  Edit,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Key,
  Wrench,
  FileText,
  Camera,
  Upload,
  Download,
  MoreHorizontal,
  Bed,
  Bath,
  Square,
  Wifi,
  Car,
  PawPrint,
  Thermometer,
  Shield,
  Star,
  TrendingUp,
  Activity,
  Building2,
  Phone,
  Mail,
  Grid,
  List,
  Loader,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { unitsApi, propertiesApi, Unit } from '@/lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export function Units() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add error boundary for debugging
  console.log('Units component rendering...');

  // Fetch units data
  const { data: unitsData, error, isLoading, mutate } = useSWR(
    '/api/units',
    () => {
      console.log('Fetching units data...');
      return unitsApi.getAll();
    },
    {
      refreshInterval: 300000, // Refresh every 5 minutes instead of 30 seconds
      revalidateOnFocus: false, // Disable revalidation on focus to prevent flashing
      dedupingInterval: 60000, // Dedupe requests for 1 minute
      onError: (err) => {
        console.error('SWR error fetching units:', err);
      }
    }
  );

  // Fetch properties for the Add Unit modal
  const { data: propertiesData } = useSWR(
    '/api/properties',
    () => propertiesApi.getAll(),
    {
      revalidateOnFocus: false,
    }
  );

  // Extract data with proper typing
  const units = Array.isArray(unitsData) ? (unitsData as Unit[]) : [];
  const properties = (propertiesData as any)?.properties || [];

  console.log('Units data:', units);
  console.log('Properties data:', properties);
  console.log('Error:', error);
  console.log('Loading:', isLoading);

  const filteredUnits = units.filter((unit: Unit) => {
    const unitNumber = unit.unitNumber || '';
    const propertyName = unit.property?.name || '';
    const leaseStatus = unit.leaseStatus || '';
    
    const matchesSearch = unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || leaseStatus.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u: Unit) => u.leaseStatus === 'LEASED').length;
  const vacantUnits = units.filter((u: Unit) => u.leaseStatus === 'VACANT').length;
  const totalRent = units.reduce((sum: number, u: Unit) => sum + (u.monthlyRent || 0), 0);
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-12 w-12 text-ormi-primary mx-auto mb-4 animate-spin" />
          <p className="text-lg font-medium text-gray-900">Loading units...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Failed to load units</p>
          <p className="text-sm text-gray-500 mt-1">Please try again later</p>
          <Button onClick={() => mutate()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unit Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage individual units with detailed tracking and analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="btn-ormi">
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Unit</DialogTitle>
              </DialogHeader>
              <AddUnitForm properties={properties} onSuccess={() => {
                setShowAddModal(false);
                mutate();
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : totalUnits}
                </p>
              </div>
              <Home className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : occupiedUnits}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vacant</p>
                <p className="text-2xl font-bold text-orange-600">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : vacantUnits}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-8 w-20" /> : `$${totalRent.toLocaleString()}`}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : `${occupancyRate.toFixed(1)}%`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter Controls */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search units or properties..."
              className="pl-10 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Status</option>
            <option value="vacant">Vacant</option>
            <option value="leased">Occupied</option>
            <option value="pending">Pending</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Units Grid */}
      {!isLoading && viewMode === 'grid' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit: Unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </motion.div>
      )}

      {/* Units List */}
      {!isLoading && viewMode === 'list' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredUnits.map((unit: Unit) => (
            <UnitListItem key={unit.id} unit={unit} />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No units found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first unit'
            }
          </p>
        </div>
      )}
    </motion.div>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Image fallback logic: unit image > property image > placeholder
  const getImageUrl = () => {
    if (!imageError && unit.imageUrl) return unit.imageUrl;
    if (!imageError && unit.property?.imageUrl) return unit.property.imageUrl;
    return '/images/placeholder-unit.svg';
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Reset image states when unit changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [unit.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LEASED': return 'bg-green-600';
      case 'VACANT': return 'bg-orange-600';
      case 'PENDING': return 'bg-yellow-600';
      case 'MAINTENANCE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LEASED': return 'Occupied';
      case 'VACANT': return 'Vacant';
      case 'PENDING': return 'Pending';
      case 'MAINTENANCE': return 'Maintenance';
      default: return status;
    }
  };

  return (
    <Card className="card-hover overflow-hidden">
      <div className="relative">
        {imageLoading && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <img 
          src={getImageUrl()} 
          alt={`Unit ${unit.unitNumber}`} 
          className={`w-full h-48 object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <div className="absolute top-4 right-4">
          <Badge className={getStatusColor(unit.leaseStatus)}>
            {getStatusText(unit.leaseStatus)}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="bg-white/90">
            {unit.bedrooms && unit.bathrooms 
              ? `${unit.bedrooms}BR/${unit.bathrooms}BA`
              : 'Unit'
            }
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
            <p className="text-sm text-gray-600">{unit.property?.name || 'Property'}</p>
            <p className="text-xs text-gray-500">{unit.property?.address || ''}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        {unit.bedrooms && unit.bathrooms && unit.sqft && (
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <Bed className="h-4 w-4 text-gray-600" />
              </div>
              <p className="text-sm font-medium">{unit.bedrooms} BR</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Bath className="h-4 w-4 text-gray-600" />
              </div>
              <p className="text-sm font-medium">{unit.bathrooms} BA</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Square className="h-4 w-4 text-gray-600" />
              </div>
              <p className="text-sm font-medium">{unit.sqft} sqft</p>
            </div>
          </div>
        )}

        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-gray-900">${unit.monthlyRent.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Monthly Rent</p>
        </div>

        {unit.tenant && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {unit.tenant.firstName?.[0]}{unit.tenant.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{unit.tenant.firstName} {unit.tenant.lastName}</p>
                <p className="text-xs text-gray-600">
                  {unit.leaseEnd ? `Lease ends ${new Date(unit.leaseEnd).toLocaleDateString()}` : 'Active tenant'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {unit.maintenanceRequests && unit.maintenanceRequests.length > 0 && (
              <div className="flex items-center text-orange-600">
                <Wrench className="h-4 w-4 mr-1" />
                <span className="text-xs">{unit.maintenanceRequests.length}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-xs">{new Date(unit.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Less' : 'More'}
          </Button>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Security Deposit</p>
                <p className="font-medium">${unit.securityDeposit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">{new Date(unit.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {unit.notes && (
              <div>
                <p className="text-gray-600 text-sm mb-2">Notes</p>
                <p className="text-xs text-gray-700">{unit.notes}</p>
              </div>
            )}

            {unit.maintenanceRequests && unit.maintenanceRequests.length > 0 && (
              <div>
                <p className="text-gray-600 text-sm mb-2">Recent Maintenance</p>
                <div className="space-y-1">
                  {unit.maintenanceRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between text-xs">
                      <span className="truncate">{request.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UnitListItem({ unit }: { unit: Unit }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Image fallback logic: unit image > property image > placeholder
  const getImageUrl = () => {
    if (!imageError && unit.imageUrl) return unit.imageUrl;
    if (!imageError && unit.property?.imageUrl) return unit.property.imageUrl;
    return '/images/placeholder-unit.svg';
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Reset image states when unit changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [unit.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LEASED': return 'bg-green-600';
      case 'VACANT': return 'bg-orange-600';
      case 'PENDING': return 'bg-yellow-600';
      case 'MAINTENANCE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LEASED': return 'Occupied';
      case 'VACANT': return 'Vacant';
      case 'PENDING': return 'Pending';
      case 'MAINTENANCE': return 'Maintenance';
      default: return status;
    }
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {imageLoading && (
                <div className="w-16 h-16 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <img 
                src={getImageUrl()} 
                alt={`Unit ${unit.unitNumber}`} 
                className={`w-16 h-16 object-cover rounded-lg ${imageLoading ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
              <p className="text-sm text-gray-600">{unit.property?.name || 'Property'}</p>
              <div className="flex items-center space-x-4 mt-1">
                {unit.bedrooms && unit.bathrooms && (
                  <span className="text-sm text-gray-600">{unit.bedrooms}BR/{unit.bathrooms}BA</span>
                )}
                {unit.sqft && (
                  <span className="text-sm text-gray-600">{unit.sqft} sqft</span>
                )}
                <Badge className={getStatusColor(unit.leaseStatus)}>
                  {getStatusText(unit.leaseStatus)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-gray-600">Monthly Rent</p>
              <p className="text-lg font-bold text-gray-900">${unit.monthlyRent.toLocaleString()}</p>
            </div>
            {unit.tenant && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Tenant</p>
                <p className="text-sm font-medium">{unit.tenant.firstName} {unit.tenant.lastName}</p>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Unit Form Component
function AddUnitForm({ properties, onSuccess }: { properties: any[], onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    propertyId: '',
    unitNumber: '',
    monthlyRent: '',
    securityDeposit: '',
    leaseStatus: 'VACANT' as 'VACANT' | 'LEASED' | 'PENDING' | 'MAINTENANCE',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    notes: '',
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate required fields
      const newErrors: Record<string, string> = {};
      if (!formData.propertyId) newErrors.propertyId = 'Property is required';
      if (!formData.unitNumber) newErrors.unitNumber = 'Unit number is required';
      if (!formData.monthlyRent) newErrors.monthlyRent = 'Monthly rent is required';
      if (!formData.securityDeposit) newErrors.securityDeposit = 'Security deposit is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Prepare data for API
      const unitData = {
        propertyId: formData.propertyId,
        unitNumber: formData.unitNumber,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
        leaseStatus: formData.leaseStatus,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        sqft: formData.sqft ? parseInt(formData.sqft) : undefined,
        notes: formData.notes || undefined,
        imageUrl: formData.imageUrl || undefined,
      };

      await unitsApi.create(unitData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create unit:', error);
      setErrors({ submit: 'Failed to create unit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property *
          </label>
          <select
            value={formData.propertyId}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ormi-blue"
          >
            <option value="">Select a property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} - {property.address}
              </option>
            ))}
          </select>
          {errors.propertyId && <p className="text-sm text-red-600 mt-1">{errors.propertyId}</p>}
        </div>

        {/* Unit Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number *
          </label>
          <Input
            value={formData.unitNumber}
            onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
            placeholder="e.g., A-101, 1A, 201"
          />
          {errors.unitNumber && <p className="text-sm text-red-600 mt-1">{errors.unitNumber}</p>}
        </div>

        {/* Monthly Rent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Rent *
          </label>
          <Input
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
            placeholder="e.g., 2500"
            min="0"
            step="0.01"
          />
          {errors.monthlyRent && <p className="text-sm text-red-600 mt-1">{errors.monthlyRent}</p>}
        </div>

        {/* Security Deposit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Security Deposit *
          </label>
          <Input
            type="number"
            value={formData.securityDeposit}
            onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
            placeholder="e.g., 2500"
            min="0"
            step="0.01"
          />
          {errors.securityDeposit && <p className="text-sm text-red-600 mt-1">{errors.securityDeposit}</p>}
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bedrooms
          </label>
          <Input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            placeholder="e.g., 2"
            min="0"
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bathrooms
          </label>
          <Input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            placeholder="e.g., 1"
            min="0"
            step="0.5"
          />
        </div>

        {/* Square Feet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Square Feet
          </label>
          <Input
            type="number"
            value={formData.sqft}
            onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
            placeholder="e.g., 850"
            min="0"
          />
        </div>

        {/* Occupancy Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Occupancy Status
          </label>
          <select
            value={formData.leaseStatus}
            onChange={(e) => setFormData({ ...formData, leaseStatus: e.target.value as 'VACANT' | 'LEASED' | 'PENDING' | 'MAINTENANCE' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ormi-blue"
          >
            <option value="VACANT">Vacant</option>
            <option value="LEASED">Occupied</option>
            <option value="PENDING">Pending</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL (Optional)
        </label>
        <Input
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/unit-image.jpg"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional notes about this unit..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ormi-blue"
        />
      </div>

      {errors.submit && (
        <p className="text-sm text-red-600">{errors.submit}</p>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
          Create Unit
        </Button>
      </div>
    </form>
  );
}

export default Units; 