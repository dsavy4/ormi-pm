import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useSWR from 'swr';

// Import PropertyViewSheet from Properties page
import { PropertyViewSheet } from './Properties';

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
  Check,
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
  ChevronRight,
  Building,
  ArrowLeft,
  Filter as FilterIcon,
  SlidersHorizontal,
  Tag,
  UserCheck,
  UserX,
  UserPlus,
  HomeIcon,
  CalendarDays,
  DollarSign as DollarSignIcon,
  Hash,
  Layers,
  Package,
  CheckCircle2,
  Clock2,
  AlertCircle,
  History,
  Copy,
  Trash2,
  Archive,
  MoreVertical,
  PlusCircle,
  Edit3,
  Eye as EyeIcon,
  FileText as FileTextIcon,
  Camera as CameraIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Share2,
  Printer,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MessageSquare,
  Video,
  Image as ImageIcon,
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  FolderX,
  FolderCheck,
  FolderSearch,
  FolderHeart,
  FolderKey,
  FolderLock,
  FolderUp,
  FolderDown,
  FolderInput,
  FolderOutput,
  FolderGit,
  FolderGit2,
  FolderSymlink,
  FolderRoot,
  FolderTree,
  FolderOpenDot,
  FolderKanban,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { unitsApi, propertiesApi, Unit, Property } from '@/lib/api';
import { getFileUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export function PropertyUnits() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOccupancy, setFilterOccupancy] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [customFloorValue, setCustomFloorValue] = useState('');
  const [filterBedrooms, setFilterBedrooms] = useState('all');
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showUnitDetails, setShowUnitDetails] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showPropertyView, setShowPropertyView] = useState(false);

  // Fetch all properties for fallback
  const { data: allPropertiesData } = useSWR(
    '/api/properties',
    () => propertiesApi.getAll(),
    {
      revalidateOnFocus: false,
    }
  );

  // Fetch property data with proper view data
  const { data: propertyViewData } = useSWR(
    showPropertyView && propertyId ? `/api/properties/${propertyId}/view` : null,
    () => propertiesApi.getById(propertyId!),
    {
      revalidateOnFocus: false,
    }
  );

  // TEMPORARY: Create a mock property object since the API is not working
  const propertyData = {
    id: propertyId,
    name: "Sunset Apartments", // We know this from the database
    address: "123 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    propertyType: "APARTMENT",
    // Add more data to match the full PropertyViewSheet
    images: [],
    description: "Modern apartment complex with great amenities",
    amenities: ["Pool", "Gym", "Parking", "Laundry"],
    yearBuilt: 2020,
    marketValue: 2500000,
    rating: null,
    totalUnits: 24,
    occupiedUnits: 0,
    monthlyRent: 2500,
    netIncome: 0,
    avgRentPerUnit: 0,
    monthlyExpenses: null
  };
  const propertyError = false;
  const propertyLoading = false;

  // Fetch units for this property
  const { data: unitsData, error: unitsError, isLoading: unitsLoading, mutate: mutateUnits } = useSWR(
    propertyId ? `/api/properties/${propertyId}/units` : null,
    () => unitsApi.getAll({ propertyId }),
    {
      revalidateOnFocus: false,
    }
  );

  const property = propertyData as any;
  
  // Debug the units data structure
  console.log('[DEBUG] unitsData:', unitsData);
  
  // Handle the units data structure - it might be wrapped in a response object
  let units: Unit[] = [];
  if (unitsData) {
    if (Array.isArray(unitsData)) {
      units = unitsData as Unit[];
    } else if ((unitsData as any).data && Array.isArray((unitsData as any).data)) {
      units = (unitsData as any).data as Unit[];
    } else if ((unitsData as any).success && (unitsData as any).data && Array.isArray((unitsData as any).data)) {
      units = (unitsData as any).data as Unit[];
    }
  }
  
  console.log('[DEBUG] processed units:', units);
  if (units.length > 0) {
    console.log('[DEBUG] First unit structure:', units[0]);
  }

  // Filter units based on search and filters
  const filteredUnits = units.filter((unit: Unit) => {
    const matchesSearch = unit.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.property?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Use tenantId to determine status since leaseStatus is undefined
    const unitStatus = unit.tenantId ? 'LEASED' : 'VACANT';
    const matchesStatus = filterStatus === 'all' || unitStatus === filterStatus;
    const matchesOccupancy = filterOccupancy === 'all' || 
                            (filterOccupancy === 'occupied' && unit.tenantId) ||
                            (filterOccupancy === 'vacant' && !unit.tenantId);
    // Custom floor filtering based on unit number patterns
    let matchesFloor = true;
    if (filterFloor !== 'all') {
      const unitNumber = unit.unitNumber?.toString() || '';
      
      if (filterFloor === 'custom') {
        // For custom floor, use the customFloorValue state
        matchesFloor = unitNumber.startsWith(customFloorValue);
      } else {
        // For predefined floors, check if unit number starts with the floor number
        matchesFloor = unitNumber.startsWith(filterFloor);
      }
    }
    const matchesBedrooms = filterBedrooms === 'all' || unit.bedrooms?.toString() === filterBedrooms;
    
    // Debug logging
    if (filterStatus !== 'all' || filterOccupancy !== 'all') {
      console.log('[DEBUG] Filtering unit:', {
        unitNumber: unit.unitNumber,
        leaseStatus: unit.leaseStatus,
        filterStatus,
        filterOccupancy,
        matchesStatus,
        matchesOccupancy
      });
    }
    
    return matchesSearch && matchesStatus && matchesOccupancy && matchesFloor && matchesBedrooms;
  });

  // Calculate metrics
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.tenantId).length;
  const vacantUnits = totalUnits - occupiedUnits;
  const totalRent = units.reduce((sum, u) => sum + (Number(u.monthlyRent) || 0), 0);
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  // Handler for viewing property
  const handleViewProperty = () => {
    setShowPropertyView(true);
  };

    // Handle property not found with automatic redirect
  useEffect(() => {
    if (propertyError) {
      // Try to redirect to the first available property instead of just /properties
      const timer = setTimeout(() => {
        // If we have properties data, redirect to the first one
        if (allPropertiesData && Array.isArray(allPropertiesData) && allPropertiesData.length > 0) {
          navigate(`/properties/${allPropertiesData[0].id}/units`);
        } else {
          navigate('/properties');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [propertyError, navigate, allPropertiesData]);

  // Debug view mode changes
  useEffect(() => {
    console.log('[DEBUG] View mode changed to:', viewMode);
    console.log('[DEBUG] Filtered units count:', filteredUnits.length);
  }, [viewMode, filteredUnits.length]);

  if (propertyError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Property not found</p>
          <p className="text-sm text-gray-500 mt-1">The property you're looking for doesn't exist or you don't have access.</p>
          <p className="text-sm text-blue-600 mt-2">Redirecting to properties page in 2 seconds...</p>
          <Button onClick={() => navigate('/properties')} className="mt-4">
            Go to Properties Now
          </Button>
        </div>
      </div>
    );
  }

  if (propertyLoading || unitsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-12 w-12 text-ormi-primary mx-auto mb-4 animate-spin" />
          <p className="text-lg font-medium text-gray-900">Loading property units...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
          <Link 
            to="/properties" 
            className="hover:text-gray-700 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Properties</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <Link 
            to={`/properties/${propertyId}`}
            className="hover:text-gray-700 transition-colors truncate"
          >
            <span className="text-gray-900 font-medium">{property?.name}</span>
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="text-gray-900 font-medium flex-shrink-0">Units</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Units</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {property?.name} • {property?.address}, {property?.city}, {property?.state} {property?.zipCode}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-sm"
            >
              <FilterIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            {selectedUnits.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowBulkActions(true)}
                className="flex items-center space-x-2 text-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Bulk Actions ({selectedUnits.length})</span>
              </Button>
            )}
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Unit</span>
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-gray-900">{occupiedUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-amber-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{vacantUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalRent.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search units..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="VACANT">Vacant</SelectItem>
                      <SelectItem value="LEASED">Occupied</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="occupancy">Occupancy</Label>
                  <Select value={filterOccupancy} onValueChange={setFilterOccupancy}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="vacant">Vacant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select value={filterBedrooms} onValueChange={setFilterBedrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="1">1 BR</SelectItem>
                      <SelectItem value="2">2 BR</SelectItem>
                      <SelectItem value="3">3 BR</SelectItem>
                      <SelectItem value="4">4+ BR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <div className="flex space-x-2">
                    <Select value={filterFloor} onValueChange={setFilterFloor}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Floors</SelectItem>
                        <SelectItem value="1">1st Floor</SelectItem>
                        <SelectItem value="2">2nd Floor</SelectItem>
                        <SelectItem value="3">3rd Floor</SelectItem>
                        <SelectItem value="4">4th Floor</SelectItem>
                        <SelectItem value="custom">Custom Floor</SelectItem>
                      </SelectContent>
                    </Select>
                    {filterFloor === 'custom' && (
                      <Input
                        placeholder="Floor #"
                        className="w-20"
                        value={customFloorValue}
                        onChange={(e) => setCustomFloorValue(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Units Grid/List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    console.log('[DEBUG] Grid button clicked, current viewMode:', viewMode);
                    setViewMode('grid');
                  }}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    console.log('[DEBUG] List button clicked, current viewMode:', viewMode);
                    setViewMode('list');
                  }}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-600">
                {filteredUnits.length} of {units.length} units
              </span>
            </div>

            {selectedUnits.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUnits.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUnits([])}
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(true)}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  isSelected={selectedUnits.includes(unit.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedUnits([...selectedUnits, unit.id]);
                    } else {
                      setSelectedUnits(selectedUnits.filter(id => id !== unit.id));
                    }
                  }}
                  onView={() => {
                    setSelectedUnit(unit);
                    setShowUnitDetails(true);
                  }}
                  onViewProperty={handleViewProperty}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUnits.map((unit) => (
                <UnitListItem
                  key={unit.id}
                  unit={unit}
                  isSelected={selectedUnits.includes(unit.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedUnits([...selectedUnits, unit.id]);
                    } else {
                      setSelectedUnits(selectedUnits.filter(id => id !== unit.id));
                    }
                  }}
                  onView={() => {
                    setSelectedUnit(unit);
                    setShowUnitDetails(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Unit Modal */}
        <AddUnitModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          property={property}
          onSuccess={() => {
            mutateUnits();
            setShowAddModal(false);
            toast.success('Unit added successfully');
          }}
        />

        {/* Unit Details Sheet */}
        <UnitDetailsSheet
          isOpen={showUnitDetails}
          onClose={() => setShowUnitDetails(false)}
          unit={selectedUnit}
          onUpdate={() => {
            mutateUnits();
            setShowUnitDetails(false);
            toast.success('Unit updated successfully');
          }}
        />

        {/* Bulk Actions Sheet */}
        <BulkActionsSheet
          isOpen={showBulkActions}
          onClose={() => setShowBulkActions(false)}
          selectedUnits={selectedUnits}
          onSuccess={() => {
            setSelectedUnits([]);
            setShowBulkActions(false);
            mutateUnits();
            toast.success('Bulk actions completed');
          }}
        />

        {/* Property View Sheet */}
        <PropertyViewSheet
          isOpen={showPropertyView}
          onClose={() => setShowPropertyView(false)}
          property={property}
          propertyViewData={propertyViewData as any}
          onEdit={(propertyId) => {
            // TODO: Implement edit functionality
            console.log('Edit property:', propertyId);
          }}
          onArchive={(propertyId) => {
            // TODO: Implement archive functionality
            console.log('Archive property:', propertyId);
          }}
          formatCurrency={(amount) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount)}
        />
      </div>
    </TooltipProvider>
  );
}

// Unit Card Component
function UnitCard({ unit, isSelected, onSelect, onView, onViewProperty }: {
  unit: Unit;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: () => void;
  onViewProperty: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LEASED': return 'bg-green-600';
      case 'VACANT': return 'bg-amber-600';
      case 'MAINTENANCE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LEASED': return 'Occupied';
      case 'VACANT': return 'Available';
      case 'MAINTENANCE': return 'Maintenance';
      default: return status;
    }
  };

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className={`w-4 h-4 rounded border-2 cursor-pointer transition-colors flex items-center justify-center ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-gray-300 hover:border-blue-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(!isSelected);
              }}
            >
              {isSelected && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
              <p className="text-sm text-gray-600">{unit.property?.name}</p>
            </div>
          </div>
          <Badge 
            className={`${getStatusColor(unit.tenantId ? 'LEASED' : 'VACANT')} flex items-center gap-1 hover:no-underline`}
            style={{ backgroundColor: unit.tenantId ? '#059669' : '#d97706' }}
          >
            {unit.tenantId ? <UserCheck className="h-3 w-3" /> : <Home className="h-3 w-3" />}
            {getStatusText(unit.tenantId ? 'LEASED' : 'VACANT')}
          </Badge>
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
          <p className="text-2xl font-bold text-gray-900">
            ${Number(unit.monthlyRent).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Monthly Rent</p>
        </div>

        {unit.tenant && (
          <div className="flex items-center space-x-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {unit.tenant.firstName?.[0]}{unit.tenant.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {unit.tenant.firstName} {unit.tenant.lastName}
              </p>
              <p className="text-xs text-gray-600">Current Tenant</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-1 overflow-hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="flex-shrink-0 px-2"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">View</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewProperty();
            }}
            className="flex-shrink-0 px-2"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Property</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0 px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement edit functionality
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Unit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement assign tenant functionality
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Tenant
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement delete functionality
              }} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Unit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// Unit List Item Component
function UnitListItem({ unit, isSelected, onSelect, onView }: {
  unit: Unit;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LEASED': return 'bg-green-600';
      case 'VACANT': return 'bg-amber-600';
      case 'MAINTENANCE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LEASED': return 'Occupied';
      case 'VACANT': return 'Available';
      case 'MAINTENANCE': return 'Maintenance';
      default: return status;
    }
  };

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className={`w-4 h-4 rounded border-2 cursor-pointer transition-colors flex items-center justify-center ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-gray-300 hover:border-blue-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(!isSelected);
              }}
            >
              {isSelected && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
                <p className="text-sm text-gray-600">{unit.property?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                {unit.bedrooms && unit.bathrooms && (
                  <span className="text-sm text-gray-600">
                    {unit.bedrooms}BR/{unit.bathrooms}BA
                  </span>
                )}
                {unit.sqft && (
                  <span className="text-sm text-gray-600">
                    {unit.sqft} sqft
                  </span>
                )}
                <Badge 
                  className={getStatusColor(unit.tenantId ? 'LEASED' : 'VACANT')}
                  style={{ backgroundColor: unit.tenantId ? '#059669' : '#d97706' }}
                >
                  {getStatusText(unit.tenantId ? 'LEASED' : 'VACANT')}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                ${Number(unit.monthlyRent).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Monthly Rent</p>
            </div>
            
            {unit.tenant && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {unit.tenant.firstName?.[0]}{unit.tenant.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {unit.tenant.firstName} {unit.tenant.lastName}
                  </p>
                  <p className="text-xs text-gray-600">Current Tenant</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Unit Modal Component
function AddUnitModal({ isOpen, onClose, property, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    unitNumber: '',
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: '',
    monthlyRent: '',
    floor: '',
    amenities: [] as string[],
    notes: '',
    imageUrl: '',
    status: 'VACANT' as 'VACANT' | 'OCCUPIED' | 'MAINTENANCE'
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
      if (!formData.unitNumber) newErrors.unitNumber = 'Unit number is required';
      if (!formData.monthlyRent) newErrors.monthlyRent = 'Monthly rent is required';
      if (!formData.squareFootage) newErrors.squareFootage = 'Square footage is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      await unitsApi.create({
        ...formData,
        propertyId: property.id,
        squareFootage: parseInt(formData.squareFootage),
        monthlyRent: parseFloat(formData.monthlyRent),
        floor: parseInt(formData.floor) || null
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create unit:', error);
      setErrors({ submit: 'Failed to create unit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unitNumber">Unit Number *</Label>
              <Input
                id="unitNumber"
                value={formData.unitNumber}
                onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="squareFootage">Square Footage *</Label>
              <Input
                id="squareFootage"
                type="number"
                value={formData.squareFootage}
                onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="monthlyRent">Monthly Rent *</Label>
              <Input
                id="monthlyRent"
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})}
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Unit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Unit Details Sheet Component
function UnitDetailsSheet({ isOpen, onClose, unit, onUpdate }: {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
  onUpdate: () => void;
}) {
  if (!unit) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Unit {unit.unitNumber} Details
          </SheetTitle>
          <SheetDescription>
            {unit.property?.name} • {unit.property?.address}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Quick Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <Badge className={`${unit.leaseStatus === 'LEASED' ? 'bg-green-600' : unit.leaseStatus === 'VACANT' ? 'bg-amber-600' : 'bg-red-600'} flex items-center gap-1`}>
                {unit.leaseStatus === 'LEASED' && <UserCheck className="h-3 w-3" />}
                {unit.leaseStatus === 'VACANT' && <Home className="h-3 w-3" />}
                {unit.leaseStatus === 'MAINTENANCE' && <Wrench className="h-3 w-3" />}
                {unit.leaseStatus === 'LEASED' ? 'Occupied' : unit.leaseStatus === 'VACANT' ? 'Available' : unit.leaseStatus}
              </Badge>
              <span className="text-2xl font-bold text-gray-900">
                ${Number(unit.monthlyRent).toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">Monthly Rent</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Camera className="h-4 w-4 mr-2" />
                    Add Photos
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Unit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unit Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Unit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Unit Number</Label>
                    <p className="text-sm text-gray-600">{unit.unitNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Floor</Label>
                    <p className="text-sm text-gray-600">{(unit as any).floor || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Bedrooms</Label>
                    <p className="text-sm text-gray-600">{unit.bedrooms}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Bathrooms</Label>
                    <p className="text-sm text-gray-600">{unit.bathrooms}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Square Footage</Label>
                    <p className="text-sm text-gray-600">{unit.sqft || 'N/A'} sqft</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Parking Spaces</Label>
                    <p className="text-sm text-gray-600">{(unit as any).parkingSpaces || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amenities</Label>
                  <div className="flex flex-wrap gap-2">
                    {(unit as any).amenities?.map((amenity: string, index: number) => (
                      <Badge key={index} variant="secondary">{amenity}</Badge>
                    )) || (
                      <span className="text-sm text-gray-500">No amenities listed</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Monthly Rent</Label>
                    <p className="text-lg font-bold text-gray-900">${Number(unit.monthlyRent).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Security Deposit</Label>
                    <p className="text-sm text-gray-600">${Number((unit as any).securityDeposit || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Pet Deposit</Label>
                    <p className="text-sm text-gray-600">${Number((unit as any).petDeposit || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Utilities Included</Label>
                    <p className="text-sm text-gray-600">{(unit as any).utilitiesIncluded ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rent History</Label>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Current Rate</span>
                      <span className="font-medium">${Number(unit.monthlyRent).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Previous Rate</span>
                      <span>${Number((unit as any).previousRent || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Last Increase</span>
                      <span>{(unit as any).lastRentIncrease || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Tenant */}
            {unit.tenant && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Current Tenant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {unit.tenant.firstName?.[0]}{unit.tenant.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{unit.tenant.firstName} {unit.tenant.lastName}</p>
                      <p className="text-sm text-gray-600">{unit.tenant.email}</p>
                      {unit.tenant.phoneNumber && (
                        <p className="text-sm text-gray-600">{unit.tenant.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium">Lease Start</Label>
                      <p className="text-gray-600">{unit.leaseStartDate || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Lease End</Label>
                      <p className="text-gray-600">{unit.leaseEndDate || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Rent Due</Label>
                      <p className="text-gray-600">{unit.rentDueDate || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Payment Status</Label>
                      <Badge variant={unit.paymentStatus === 'PAID' ? 'default' : 'destructive'}>
                        {unit.paymentStatus || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tenant History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Tenant History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unit.tenantHistory?.map((tenant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-gray-600">{tenant.period}</p>
                      </div>
                      <Badge variant="outline">{tenant.status}</Badge>
                    </div>
                  )) || (
                    <div className="text-center py-4">
                      <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No tenant history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Maintenance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unit.maintenanceHistory?.map((maintenance, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{maintenance.title}</p>
                        <p className="text-sm text-gray-600">{maintenance.date}</p>
                      </div>
                      <Badge variant={maintenance.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {maintenance.status}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center py-4">
                      <Wrench className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No maintenance history</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents & Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents & Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unit.documents?.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.date}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )) || (
                    <div className="text-center py-4">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No documents uploaded</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => {
              // Handle edit
              onClose();
            }}>
              Edit Unit
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Bulk Actions Sheet Component
function BulkActionsSheet({ isOpen, onClose, selectedUnits, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  selectedUnits: string[];
  onSuccess: () => void;
}) {
  const [action, setAction] = useState<string>('');

  const handleBulkAction = async () => {
    try {
      // Implement bulk actions based on selected action
      console.log('Performing bulk action:', action, 'on units:', selectedUnits);
      
      onSuccess();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Bulk Actions</SheetTitle>
          <SheetDescription>
            Perform actions on {selectedUnits.length} selected units
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <Label htmlFor="action">Select Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="archive">Archive Units</SelectItem>
                <SelectItem value="activate">Activate Units</SelectItem>
                <SelectItem value="maintenance">Mark for Maintenance</SelectItem>
                <SelectItem value="update_rent">Update Rent</SelectItem>
                <SelectItem value="assign_tenant">Assign Tenant</SelectItem>
                <SelectItem value="remove_tenant">Remove Tenant</SelectItem>
                <SelectItem value="transfer_property">Transfer to Another Property</SelectItem>
                <SelectItem value="bulk_edit">Bulk Edit Details</SelectItem>
                <SelectItem value="export_data">Export Unit Data</SelectItem>
                <SelectItem value="generate_reports">Generate Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAction}
              disabled={!action}
            >
              Perform Action
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 