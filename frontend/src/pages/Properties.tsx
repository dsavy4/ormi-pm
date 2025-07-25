import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Grid,
  List,
  Map,
  Building2,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  MapPinned,
  DollarSign,
  Home,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Archive,
  UserPlus,
  FileText,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Building,
  Tag,
  Calendar,
  Square,
  Zap,
  Shield,
  Wifi,
  Phone,
  Mail,
  Settings,
  ExternalLink,
  MoreHorizontal,
  SlidersHorizontal,
  BarChart3,
  Info,
  Grid3X3,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileSpreadsheet,
  Database,
  ChevronDown,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { propertiesApi, Property } from '@/lib/api';
import { cn } from '@/lib/utils';

// API and Types
import { 
  dashboardApi, 
  PropertyFilters, 
  PropertyInsights,
  PropertiesResponse,
  IncomeAnalytics,
  MonthlyIncomeData,
  IncomeGrowthMetrics,
  TopPerformingPropertyIncome
} from '@/lib/api';

// Map components (dynamic import for better bundle splitting)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Chart components
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend 
} from 'recharts';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Filter Options - These could come from backend config
const propertyTypes = ['All Types', 'Apartment Complex', 'Condominium', 'High-Rise', 'Single Family', 'Duplex', 'Townhouse'];
const statusOptions = ['All Status', 'Active', 'Archived', 'Under Maintenance'];
const tagOptions = ['All Tags', 'Premium', 'Luxury', 'High-demand', 'Waterfront', 'New Construction', 'Pet-friendly'];

// Sort Options
const sortOptions = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'occupancy-desc', label: 'Occupancy % High to Low' },
  { value: 'occupancy-asc', label: 'Occupancy % Low to High' },
  { value: 'income-desc', label: 'Monthly Net High to Low' },
  { value: 'income-asc', label: 'Monthly Net Low to High' },
  { value: 'units-desc', label: 'Most Units' },
  { value: 'units-asc', label: 'Fewest Units' },
  { value: 'value-desc', label: 'Market Value High to Low' },
  { value: 'value-asc', label: 'Market Value Low to High' },
  { value: 'recent', label: 'Most Recently Added' },
  { value: 'oldest', label: 'Oldest First' },
];

type ViewMode = 'grid' | 'list' | 'map';
type SortOption = 'name-asc' | 'name-desc' | 'occupancy-desc' | 'occupancy-asc' | 'income-desc' | 'income-asc' | 'units-desc' | 'units-asc' | 'value-desc' | 'value-asc' | 'recent' | 'oldest';
type ListSortColumn = 'name' | 'units' | 'netIncome' | 'occupancy' | 'leasesExpiring';

interface ConfirmationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  type: 'destructive' | 'warning' | 'info';
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

// SWR fetcher functions
const propertiesFetcher = (url: string) => {
  const [endpoint, params] = url.split('?');
  const filters = params ? Object.fromEntries(new URLSearchParams(params)) : {};
  return propertiesApi.getAll(filters);
};

const insightsFetcher = () => {
  return propertiesApi.getInsights();
};

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getOccupancyBadgeColor = (rate: number) => {
  if (rate >= 95) return 'bg-green-100 text-green-800 border-green-200';
  if (rate >= 85) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

// Step-based validation schemas
const step1Schema = z.object({
  name: z.string().min(1, 'Property name is required').max(100, 'Property name must be less than 100 characters'),
  propertyType: z.enum(['Multi-Family', 'Single-Family', 'Commercial', 'Condominium', 'Townhouse', 'Duplex'], {
    errorMap: () => ({ message: 'Please select a property type' })
  }),
  ownershipType: z.enum(['Owned', 'Managed', 'Third-Party'], {
    errorMap: () => ({ message: 'Please select ownership type' })
  }),
  tags: z.array(z.string()).default([]),
});

const step2Schema = z.object({
  address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
  unitSuite: z.string().optional(),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(2, 'State is required').max(50, 'State must be less than 50 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters').max(10, 'ZIP code must be less than 10 characters'),
  country: z.string().default('United States'),
});

const step3Schema = z.object({
  totalUnits: z.number().min(1, 'Total units must be at least 1').max(10000, 'Total units must be less than 10000'),
  yearBuilt: z.number().min(1800, 'Year built must be after 1800').max(new Date().getFullYear(), 'Year built cannot be in the future').optional(),
  sqft: z.number().min(0, 'Square footage must be positive').optional(),
  lotSize: z.number().min(0, 'Lot size must be positive').optional(),
  description: z.string().optional(),
});

const step4Schema = z.object({
  images: z.array(z.instanceof(File)).max(10, 'Maximum 10 images allowed').default([]),
});

const step5Schema = z.object({
  // Management settings
  propertyManager: z.string().optional(),
  rentDueDay: z.number().min(1).max(28).default(1),
  allowOnlinePayments: z.boolean().default(true),
  enableMaintenanceRequests: z.boolean().default(true),
});

// Combined schema for final validation
const propertyFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

type PropertyFormData = z.infer<typeof propertyFormSchema>;
type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type Step5Data = z.infer<typeof step5Schema>;

// Wizard step configuration
const WIZARD_STEPS = [
  {
    id: 1,
    title: 'Basic Info',
    description: 'Property name and type',
    icon: Building,
    schema: step1Schema,
  },
  {
    id: 2,
    title: 'Location',
    description: 'Address and location details',
    icon: MapPin,
    schema: step2Schema,
  },
  {
    id: 3,
    title: 'Property Details',
    description: 'Units, size, and description',
    icon: Settings,
    schema: step3Schema,
  },
  {
    id: 4,
    title: 'Media',
    description: 'Upload property images',
    icon: Camera,
    schema: step4Schema,
  },
  {
    id: 5,
    title: 'Review',
    description: 'Review and create property',
    icon: CheckCircle2,
    schema: step5Schema,
  },
];

// US States dropdown options
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida',
  'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
  'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const PROPERTY_TYPES = [
  'Multi-Family', 'Single-Family', 'Commercial', 'Condominium', 'Townhouse', 'Duplex'
];

const OWNERSHIP_TYPES = [
  'Owned', 'Managed', 'Third-Party'
];

const AVAILABLE_TAGS = [
  'Luxury', 'Affordable Housing', 'Student Housing', 'Senior Living', 'Pet-Friendly', 'Waterfront',
  'New Construction', 'Historic', 'Green Building', 'High-Rise', 'Gated Community'
];

// Property Dashboard Interfaces and Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'property_manager' | 'maintenance' | 'tenant';
}

interface PropertyManager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  properties: string[];
}

interface AdvancedFilters {
  search: string;
  status: string[];
  propertyType: string[];
  manager: string[];
  occupancyRange: [number, number];
  city: string[];
  state: string[];
  zipCode: string;
  ownershipType: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  includeArchived: boolean;
}

interface PropertyViewData {
  property: Property;
  manager?: PropertyManager;
  units: any[];
  recentActivity: any[];
  documents: any[];
}

// Enhanced Property interface with manager and status
interface EnhancedProperty extends Omit<Property, 'manager'> {
  manager?: PropertyManager;
  isArchived: boolean;
  status: 'Active' | 'Under Construction' | 'Vacant' | 'Fully Occupied' | 'Partially Occupied' | 'Maintenance Only' | 'Archived';
  archivedAt?: string;
  archivedBy?: string;
}

export function Properties() {
  // State Management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showIncomeAnalytics, setShowIncomeAnalytics] = useState(false);
  const [viewTransition, setViewTransition] = useState(false);
  const [highlightedProperty, setHighlightedProperty] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    type: 'info'
  });
  
  // New dashboard state
  const [showManagerAssignment, setShowManagerAssignment] = useState(false);
  const [showPropertyView, setShowPropertyView] = useState(false);
  const [showPropertyEdit, setShowPropertyEdit] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyViewData, setPropertyViewData] = useState<PropertyViewData | null>(null);
  const [availableManagers, setAvailableManagers] = useState<PropertyManager[]>([]);
  const [selectedManager, setSelectedManager] = useState<PropertyManager | null>(null);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  
  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    search: '',
    status: [],
    propertyType: [],
    manager: [],
    occupancyRange: [0, 100],
    city: [],
    state: [],
    zipCode: '',
    ownershipType: [],
    dateRange: {},
    includeArchived: false,
  });
  
  // Existing filter state with enhanced options
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    status: 'All Status',
    propertyType: 'All Types',
    tags: [],
    location: '',
    occupancyMin: 0,
    occupancyMax: 100,
    incomeMin: 0,
    incomeMax: 200000,
    page: 1,
    limit: 20,
    sortBy: 'name-asc',
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || '');
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Update filters with debounced search
  const activeFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  // Debounced search for advanced filters
  const [debouncedAdvancedSearch, setDebouncedAdvancedSearch] = useState(advancedFilters.search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAdvancedSearch(advancedFilters.search || '');
    }, 300);
    return () => clearTimeout(timer);
  }, [advancedFilters.search]);

  // Create SWR key for properties with advanced filters
  const propertiesKey = useMemo(() => {
    const params = new URLSearchParams();
    
    // Add advanced filters to params
    const effectiveFilters = {
      ...advancedFilters,
      search: debouncedAdvancedSearch
    };
    
    // Add search
    if (effectiveFilters.search) {
      params.append('search', effectiveFilters.search);
    }
    
    // Add array filters
    effectiveFilters.status.forEach(status => params.append('status', status));
    effectiveFilters.propertyType.forEach(type => params.append('propertyType', type));
    effectiveFilters.manager.forEach(manager => params.append('manager', manager));
    effectiveFilters.city.forEach(city => params.append('city', city));
    effectiveFilters.state.forEach(state => params.append('state', state));
    effectiveFilters.ownershipType.forEach(type => params.append('ownershipType', type));
    
    // Add other filters
    if (effectiveFilters.zipCode) {
      params.append('zipCode', effectiveFilters.zipCode);
    }
    
    if (effectiveFilters.occupancyRange[0] !== 0 || effectiveFilters.occupancyRange[1] !== 100) {
      params.append('occupancyMin', effectiveFilters.occupancyRange[0].toString());
      params.append('occupancyMax', effectiveFilters.occupancyRange[1].toString());
    }
    
    if (effectiveFilters.dateRange.from) {
      params.append('dateFrom', effectiveFilters.dateRange.from.toISOString());
    }
    if (effectiveFilters.dateRange.to) {
      params.append('dateTo', effectiveFilters.dateRange.to.toISOString());
    }
    
    if (effectiveFilters.includeArchived) {
      params.append('includeArchived', 'true');
    }
    
    // Add pagination
    params.append('page', '1');
    params.append('limit', '20');
    
    return `/api/properties?${params.toString()}`;
  }, [advancedFilters, debouncedAdvancedSearch]);

  // Data fetching with SWR
  const { 
    data: propertiesData, 
    error: propertiesError, 
    isLoading: propertiesLoading,
    mutate: mutateProperties 
  } = useSWR<PropertiesResponse>(propertiesKey, propertiesFetcher);

  const { 
    data: insights, 
    error: insightsError, 
    isLoading: insightsLoading 
  } = useSWR<PropertyInsights>('/api/properties/insights', () => propertiesApi.getInsights());

  // Computed values
  const properties = propertiesData?.properties || [];
  const pagination = propertiesData?.pagination;

  // Helper Functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Enhanced Selection Functions
  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Navigation and Highlighting Functions
  const scrollToProperty = (propertyId: string) => {
    const element = document.getElementById(`property-${propertyId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  // Specialized scroll function for top performer to prevent flashing
  const scrollToTopPerformer = useCallback((propertyId: string) => {
    // Clear any existing highlights to prevent conflicts
    setHighlightedProperty(null);
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const element = document.getElementById(`property-${propertyId}`);
      if (element) {
        // Ensure the element is visible and not transitioning
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible) {
          // Use native smooth scroll with optimized timing
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
        
        // Apply highlight after a short delay to avoid conflicts
        setTimeout(() => {
          setHighlightedProperty(propertyId);
          // Auto-remove highlight after 3 seconds
          setTimeout(() => setHighlightedProperty(null), 3000);
        }, isVisible ? 100 : 800); // Longer delay if scrolling
      }
    });
  }, []);

  const highlightProperty = (propertyId: string) => {
    setHighlightedProperty(propertyId);
    setTimeout(() => setHighlightedProperty(null), 3000);
  };

  // Enhanced Bulk Actions with Real API Integration
  const handleBulkArchive = async () => {
    const propertyNames = selectedProperties.map(id => 
      properties.find(p => p.id === id)?.name
    ).filter(Boolean).join(', ');

    setConfirmDialog({
      isOpen: true,
      title: 'Archive Properties',
      message: `Are you sure you want to archive ${selectedProperties.length} ${selectedProperties.length === 1 ? 'property' : 'properties'}? ${propertyNames}`,
      confirmText: 'Archive',
      type: 'destructive',
      onConfirm: async () => {
        try {
          await propertiesApi.bulkArchive(selectedProperties);
          await mutateProperties(); // Refresh properties list
          setSelectedProperties([]);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to archive properties:', error);
          // Show error toast
        }
      }
    });
  };

  const handleBulkExport = async () => {
    try {
      const result = await propertiesApi.bulkExport(selectedProperties, 'csv');
      // Trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `properties-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSelectedProperties([]);
    } catch (error) {
      console.error('Failed to export properties:', error);
      // Show error toast
    }
  };

  const handleAssignManager = () => {
    setShowManagerAssignment(true);
  };

  const assignManager = async (managerId: string, propertyIds: string[]) => {
    try {
      // API call to assign manager to properties
      await fetch('/api/properties/assign-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          managerId,
          propertyIds,
        }),
      });
      
      // Refresh properties data
      await mutateProperties();
      
      // Clear selection
      setSelectedProperties([]);
      
      toast.success(`Manager assigned to ${propertyIds.length} properties`);
    } catch (error) {
      console.error('Failed to assign manager:', error);
      toast.error('Failed to assign manager');
      throw error;
    }
  };

  // AI Insights Click Handlers with Real Data
  const handleInsightClick = useCallback(async (insightType: string) => {
    switch (insightType) {
      case 'urgent-maintenance':
        setFilters(prev => ({ 
          ...prev, 
          urgentMaintenanceOnly: true,
          leasesExpiringOnly: false
        }));
        break;
      case 'expiring-leases':
        setFilters(prev => ({ 
          ...prev, 
          leasesExpiringOnly: true,
          urgentMaintenanceOnly: false
        }));
        break;
      case 'top-performer':
        if (insights?.topPerformingProperty) {
          // For top performer, we want to scroll and highlight without filtering
          // This prevents layout shifts and ensures smooth scrolling
          
          // First, ensure we're in grid view for best visibility
          if (viewMode !== 'grid') {
            setViewTransition(true);
            setViewMode('grid');
            // Wait for view transition to complete
            setTimeout(() => {
              setViewTransition(false);
              scrollToTopPerformer(insights.topPerformingProperty.id);
            }, 350);
          } else {
            // Already in grid view, scroll immediately
            scrollToTopPerformer(insights.topPerformingProperty.id);
          }
        }
        break;
    }
  }, [insights, viewMode, scrollToTopPerformer]);

  // View Mode and Filter Management
  const handleViewModeChange = (newMode: ViewMode) => {
    if (newMode === viewMode) return;
    setViewTransition(true);
    setTimeout(() => {
      setViewMode(newMode);
      setViewTransition(false);
    }, 300);
  };

  // Update clear all filters function
  const clearAllFilters = () => {
    setAdvancedFilters({
      search: '',
      status: [],
      propertyType: [],
      manager: [],
      occupancyRange: [0, 100],
      city: [],
      state: [],
      zipCode: '',
      ownershipType: [],
      dateRange: {},
      includeArchived: false,
    });
  };

  const clearAIFilter = (filterType: 'urgentMaintenanceOnly' | 'leasesExpiringOnly') => {
    setFilters(prev => ({ ...prev, [filterType]: false }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'a':
            if (properties.length > 0) {
              e.preventDefault();
              handleSelectAll();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [properties.length]);

  // Handle loading and error states
  if (propertiesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Properties</h3>
              <p className="text-muted-foreground mb-4">
                {propertiesError.message || 'An error occurred while loading properties.'}
              </p>
              <Button onClick={() => mutateProperties()}>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Property Management Functions
  const handleArchiveProperty = async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Property',
      message: `Are you sure you want to archive "${property.name}"? This will remove it from active listings but keep all data.`,
      confirmText: 'Archive',
      type: 'destructive',
      onConfirm: async () => {
        try {
          await fetch(`/api/properties/${propertyId}/archive`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          await mutateProperties();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          
          // Show success toast with undo option
          const toastId = toast.success(
            <div className="flex items-center justify-between gap-4">
              <span>Property archived successfully</span>
              <button 
                onClick={() => handleUnarchiveProperty(propertyId)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Undo
              </button>
            </div>
          );
          
        } catch (error) {
          console.error('Failed to archive property:', error);
          toast.error('Failed to archive property');
        }
      }
    });
  };

  const handleUnarchiveProperty = async (propertyId: string) => {
    try {
      await fetch(`/api/properties/${propertyId}/unarchive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      await mutateProperties();
      toast.success('Property restored from archive');
    } catch (error) {
      console.error('Failed to unarchive property:', error);
      toast.error('Failed to restore property');
    }
  };

  const handleViewProperty = async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    setSelectedProperty(property || null);
    setShowPropertyView(true);
    
    // For now, use the basic property data since the detailed API endpoint isn't implemented yet
    if (property) {
      setPropertyViewData({
        property,
        manager: undefined, // Will be enhanced later when we have proper manager data
        units: [],
        recentActivity: [],
        documents: []
      });
    }
  };

  const handleEditProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setShowPropertyEdit(true);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Property',
      message: `Are you sure you want to permanently delete "${property.name}"? This action cannot be undone and will remove all associated data.`,
      confirmText: 'Delete Permanently',
      type: 'destructive',
      onConfirm: async () => {
        try {
          await fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          await mutateProperties();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          toast.success('Property deleted successfully');
        } catch (error) {
          console.error('Failed to delete property:', error);
          toast.error('Failed to delete property');
        }
      }
    });
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return (
      (advancedFilters.search ? 1 : 0) +
      advancedFilters.status.length +
      advancedFilters.propertyType.length +
      advancedFilters.manager.length +
      advancedFilters.city.length +
      advancedFilters.state.length +
      (advancedFilters.zipCode ? 1 : 0) +
      advancedFilters.ownershipType.length +
      (advancedFilters.dateRange.from || advancedFilters.dateRange.to ? 1 : 0) +
      (advancedFilters.includeArchived ? 1 : 0) +
      (advancedFilters.occupancyRange[0] !== 0 || advancedFilters.occupancyRange[1] !== 100 ? 1 : 0)
    );
  }, [advancedFilters]);

  // Refs for advanced functionality
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                Properties
                <Badge variant="outline" className="text-sm">
                  {properties.length} {pagination && `of ${pagination.total}`}
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your property portfolio with advanced insights and controls
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Press ⌘K to search</span>
                <span>⌘A to select all</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleBulkExport}
                disabled={selectedProperties.length === 0}
              >
                <Download className="h-4 w-4" />
                Export Selected
              </Button>
              <Button
                onClick={() => setShowAddProperty(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            </div>
          </div>

          {/* AI-Powered Insights */}
          <motion.div variants={itemVariants}>
            {insightsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : insightsError ? (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive text-center">Failed to load insights</p>
                </CardContent>
              </Card>
            ) : insights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden"
                      onClick={() => handleInsightClick('expiring-leases')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <CardTitle className="text-lg">Leases Expiring</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {insights.leasesExpiringThisMonth}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-orange-600">
                        {insights.leasesExpiringThisMonth}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Leases expiring this month
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden"
                      onClick={() => handleInsightClick('top-performer')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">Top Performer</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {insights.topPerformingProperty?.occupancyRate?.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600 truncate">
                        {insights.topPerformingProperty?.name || 'N/A'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Highest occupancy rate
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden"
                      onClick={() => handleInsightClick('urgent-maintenance')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                        <CardTitle className="text-lg">Urgent Maintenance</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {insights.urgentMaintenanceCount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-red-600">
                        {insights.urgentMaintenanceCount}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Properties need attention
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow relative overflow-hidden group cursor-pointer"
                  onClick={() => setShowIncomeAnalytics(true)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">Total Monthly Net</CardTitle>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Info className="h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to view monthly rent income trends and breakdowns by property</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(insights.totalMonthlyIncome)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Monthly net income across all properties
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </motion.div>

          {/* Active Filters Display */}
          <AnimatePresence>
            {(filters.urgentMaintenanceOnly || filters.leasesExpiringOnly) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-2"
              >
                {filters.urgentMaintenanceOnly && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Urgent Maintenance
                    <button
                      onClick={() => clearAIFilter('urgentMaintenanceOnly')}
                      className="ml-1 hover:bg-red-700 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.leasesExpiringOnly && (
                  <Badge variant="outline" className="flex items-center gap-1 border-orange-300 text-orange-700">
                    <Calendar className="h-3 w-3" />
                    Expiring Leases
                    <button
                      onClick={() => clearAIFilter('leasesExpiringOnly')}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Filters */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search properties, addresses, neighborhoods..."
                      value={advancedFilters.search}
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, search: e.target.value}))}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Advanced Filters Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(true)}
                    className="flex items-center gap-2 relative"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Advanced Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                  
                  {/* Clear Filters Button */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {advancedFilters.search && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        Search: {advancedFilters.search}
                        <button
                          onClick={() => setAdvancedFilters(prev => ({...prev, search: ''}))}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {advancedFilters.status.map(status => (
                      <Badge key={status} variant="secondary" className="flex items-center gap-1">
                        Status: {status}
                        <button
                          onClick={() => setAdvancedFilters(prev => ({
                            ...prev, 
                            status: prev.status.filter(s => s !== status)
                          }))}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {advancedFilters.propertyType.map(type => (
                      <Badge key={type} variant="secondary" className="flex items-center gap-1">
                        Type: {type}
                        <button
                          onClick={() => setAdvancedFilters(prev => ({
                            ...prev, 
                            propertyType: prev.propertyType.filter(t => t !== type)
                          }))}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {advancedFilters.includeArchived && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Archive className="h-3 w-3" />
                        Including Archived
                        <button
                          onClick={() => setAdvancedFilters(prev => ({...prev, includeArchived: false}))}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Toolbar: Sort and View Options */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {properties.length} properties {pagination && `(${pagination.total} total)`}
                </div>
                
                {/* Bulk Actions */}
                <AnimatePresence>
                  {selectedProperties.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2"
                    >
                      <Badge variant="secondary">
                        {selectedProperties.length} selected
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAssignManager}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Assign Manager
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkExport}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkArchive}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => setFilters(prev => ({...prev, sortBy: value as SortOption}))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="map" aria-label="Map view">
                    <MapPin className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </motion.div>

          {/* Properties Content */}
          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              {propertiesLoading || viewTransition ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton className="h-80 w-full" key={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Grid View */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {properties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          isHighlighted={highlightedProperty === property.id}
                          isSelected={selectedProperties.includes(property.id)}
                          onSelect={() => handleSelectProperty(property.id)}
                          onView={handleViewProperty}
                          onEdit={handleEditProperty}
                          onArchive={handleArchiveProperty}
                          onDelete={handleDeleteProperty}
                          formatCurrency={formatCurrency}
                          getOccupancyBadgeColor={getOccupancyBadgeColor}
                        />
                      ))}
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-4">
                      {/* List Header */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground">
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              checked={selectedProperties.length === properties.length && properties.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300"
                            />
                          </div>
                          <div className="col-span-3">Property Name</div>
                          <div className="col-span-2">Units</div>
                          <div className="col-span-2">Net Income</div>
                          <div className="col-span-2">Occupancy</div>
                          <div className="col-span-2">Actions</div>
                        </div>
                      </div>

                      {/* List Items */}
                      {properties.map((property) => (
                        <PropertyListItem
                          key={property.id}
                          property={property}
                          isSelected={selectedProperties.includes(property.id)}
                          onSelect={() => handleSelectProperty(property.id)}
                          isHighlighted={highlightedProperty === property.id}
                          onView={handleViewProperty}
                          onEdit={handleEditProperty}
                          onArchive={handleArchiveProperty}
                          onDelete={handleDeleteProperty}
                          formatCurrency={formatCurrency}
                          getOccupancyBadgeColor={getOccupancyBadgeColor}
                        />
                      ))}
                    </div>
                  )}

                  {/* Map View */}
                  {viewMode === 'map' && (
                    <div className="h-96 lg:h-[600px] rounded-lg overflow-hidden border">
                      <MapContainer
                        center={[37.7749, -122.4194]}
                        zoom={11}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {properties.filter(p => p.coordinates).map((property) => (
                          <Marker
                            key={property.id}
                            position={[property.coordinates!.lat, property.coordinates!.lng]}
                          >
                            <Popup>
                              <div className="p-2 min-w-48">
                                <h3 className="font-semibold text-sm">{property.name}</h3>
                                <p className="text-xs text-muted-foreground">{property.address}</p>
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Units:</span>
                                    <span>{property.totalUnits}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Occupancy:</span>
                                    <span>{property.occupancyRate.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Net Income:</span>
                                    <span>{formatCurrency(property.netIncome)}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setViewMode('grid');
                                    setTimeout(() => {
                                      scrollToProperty(property.id);
                                      highlightProperty(property.id);
                                    }, 300);
                                  }}
                                  className="mt-2 w-full bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90 transition-colors"
                                >
                                  View Details
                                </button>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  )}

                  {/* Empty State */}
                  {properties.length === 0 && !propertiesLoading && (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                      <p className="text-muted-foreground mb-4">
                        {filters.search || filters.status !== 'All Status' || filters.propertyType !== 'All Types'
                          ? 'Try adjusting your filters or search criteria'
                          : 'Get started by adding your first property'
                        }
                      </p>
                      <div className="flex gap-2 justify-center">
                        {(filters.search || filters.status !== 'All Status' || filters.propertyType !== 'All Types') && (
                          <Button
                            variant="outline"
                            onClick={clearAllFilters}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Clear Filters
                          </Button>
                        )}
                        <Button
                          onClick={() => setShowAddProperty(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Property
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({...prev, page: Math.max(1, pagination.page - 1)}))}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({...prev, page: Math.min(pagination.pages, pagination.page + 1)}))}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Add Property Modal */}
        <AddPropertySheet 
          isOpen={showAddProperty} 
          onClose={() => setShowAddProperty(false)}
          onSuccess={() => {
            mutateProperties(); // Refresh properties list
            setShowAddProperty(false);
          }}
        />

        {/* Income Analytics Modal */}
        <IncomeAnalyticsModal
          isOpen={showIncomeAnalytics}
          onClose={() => setShowIncomeAnalytics(false)}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog 
          dialog={confirmDialog}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

        {/* Manager Assignment Sheet */}
        <ManagerAssignmentSheet 
          isOpen={showManagerAssignment}
          onClose={() => setShowManagerAssignment(false)}
          selectedProperties={selectedProperties}
          onAssignManager={assignManager}
        />

        {/* Property View Sheet */}
        <PropertyViewSheet 
          isOpen={showPropertyView}
          onClose={() => setShowPropertyView(false)}
          property={selectedProperty}
          propertyViewData={propertyViewData}
          onEdit={handleEditProperty}
          onArchive={handleArchiveProperty}
          formatCurrency={formatCurrency}
        />

        {/* Advanced Filters Sheet */}
        <AdvancedFiltersSheet 
          isOpen={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          onClearAll={clearAllFilters}
        />

        {/* Property Edit Sheet */}
        <PropertyEditSheet 
          isOpen={showPropertyEdit}
          onClose={() => setShowPropertyEdit(false)}
          property={selectedProperty as EnhancedProperty}
          onPropertyUpdated={(updatedProperty) => {
            mutateProperties();
            setSelectedProperty(updatedProperty as Property);
          }}
        />
      </div>
    </TooltipProvider>
  );
}

// PropertyImage Component
interface PropertyImageProps {
  property: Property;
  className?: string;
}

const PropertyImage: React.FC<PropertyImageProps> = ({ property, className }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}
      <img
        src={property.images?.[0] || '/api/placeholder/400/300'}
        alt={property.name}
        className={`w-full h-full object-cover rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

// PropertyCard Component
interface PropertyCardProps {
  property: Property;
  isHighlighted: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onView: (propertyId: string) => void;
  onEdit: (propertyId: string) => void;
  onArchive: (propertyId: string) => void;
  onDelete: (propertyId: string) => void;
  formatCurrency: (amount: number) => string;
  getOccupancyBadgeColor: (rate: number) => string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isHighlighted,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onArchive,
  onDelete,
  formatCurrency,
  getOccupancyBadgeColor
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      id={`property-${property.id}`}
      className={`group relative bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg hover:shadow-black/5 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        // Use transform instead of ring for highlights to prevent layout shifts
        transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHighlighted 
          ? '0 0 0 2px rgb(59 130 246), 0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          : undefined,
        zIndex: isHighlighted ? 10 : 'auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Highlight overlay for additional visual feedback */}
      {isHighlighted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-blue-50/50 rounded-xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)'
          }}
        />
      )}

      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm border">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Property Rating */}
      <div className="absolute top-3 right-3 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{property.rating || 4.5}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Property Health Score: {property.propertyHealth}/100</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Property Image */}
      <PropertyImage property={property} className="h-48 mb-4" />

      {/* Property Content */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {property.address}, {property.city}, {property.state}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {property.tags?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs shrink-0">
              {tag}
            </Badge>
          ))}
          {property.tags && property.tags.length > 3 && (
            <Badge variant="outline" className="text-xs shrink-0">
              +{property.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Units</div>
            <div className="text-lg font-semibold">{property.totalUnits}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Occupancy</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{property.occupancyRate.toFixed(1)}%</div>
              <div className={`w-2 h-2 rounded-full ${getOccupancyBadgeColor(property.occupancyRate).includes('green') ? 'bg-green-500' : getOccupancyBadgeColor(property.occupancyRate).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>

        {/* Income */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Monthly Net Income</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(property.netIncome)}
          </div>
        </div>

        {/* Alerts */}
        <div className="flex gap-2 flex-wrap">
          {property.urgentMaintenanceRequests > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {property.urgentMaintenanceRequests}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{property.urgentMaintenanceRequests} urgent maintenance requests</p>
              </TooltipContent>
            </Tooltip>
          )}
          {property.leasesExpiringNext30Days > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                  <Calendar className="h-3 w-3 mr-1" />
                  {property.leasesExpiringNext30Days}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{property.leasesExpiringNext30Days} leases expiring soon</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => onView(property.id)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => onEdit(property.id)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(property.id)}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(property.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

// PropertyListItem Component
interface PropertyListItemProps {
  property: Property;
  isSelected: boolean;
  onSelect: () => void;
  isHighlighted: boolean;
  onView: (propertyId: string) => void;
  onEdit: (propertyId: string) => void;
  onArchive: (propertyId: string) => void;
  onDelete: (propertyId: string) => void;
  formatCurrency: (amount: number) => string;
  getOccupancyBadgeColor: (rate: number) => string;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({
  property,
  isSelected,
  onSelect,
  isHighlighted,
  onView,
  onEdit,
  onArchive,
  onDelete,
  formatCurrency,
  getOccupancyBadgeColor
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      id={`property-${property.id}`}
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        // Use transform instead of ring for highlights to prevent layout shifts
        transform: isHighlighted ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isHighlighted 
          ? '0 0 0 2px rgb(59 130 246), 0 10px 25px -5px rgba(0, 0, 0, 0.1)' 
          : undefined,
        zIndex: isHighlighted ? 10 : 'auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Highlight overlay for additional visual feedback */}
      {isHighlighted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-blue-50/30 rounded-lg pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.03) 100%)'
          }}
        />
      )}

      <div className="grid grid-cols-12 gap-4 items-center relative z-10">
        {/* Selection */}
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
        </div>

        {/* Property Info */}
        <div className="col-span-3">
          <div className="flex items-center gap-3">
            <PropertyImage property={property} className="w-12 h-12 rounded-lg" />
            <div>
              <h3 className="font-semibold text-sm line-clamp-1">{property.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {property.address}, {property.city}
              </p>
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="col-span-2">
          <div className="text-sm font-medium">{property.totalUnits}</div>
          <div className="text-xs text-muted-foreground">
            {property.occupiedUnits} occupied
          </div>
        </div>

        {/* Net Income */}
        <div className="col-span-2">
          <div className="text-sm font-medium text-green-600">
            {formatCurrency(property.netIncome)}
          </div>
          <div className="text-xs text-muted-foreground">per month</div>
        </div>

        {/* Occupancy */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{property.occupancyRate.toFixed(1)}%</div>
            <div className={`w-2 h-2 rounded-full ${getOccupancyBadgeColor(property.occupancyRate).includes('green') ? 'bg-green-500' : getOccupancyBadgeColor(property.occupancyRate).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`} />
          </div>
          <Progress value={property.occupancyRate} className="w-full h-1" />
        </div>

        {/* Actions */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => onView(property.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => onEdit(property.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(property.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onDelete(property.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
};



// AddPropertySheet Component - Professional Multi-Step Wizard
interface AddPropertySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPropertySheet: React.FC<AddPropertySheetProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      propertyType: 'Multi-Family',
      ownershipType: 'Owned',
      tags: [],
      address: '',
      unitSuite: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      totalUnits: 1,
      yearBuilt: undefined,
      sqft: undefined,
      lotSize: undefined,
      description: '',
      propertyManager: '',
      rentDueDay: 1,
      allowOnlinePayments: true,
      enableMaintenanceRequests: true,
      images: [],
    },
  });

  const formValues = form.watch();
  const formErrors = form.formState.errors;

  // Check if current step is valid
  const isCurrentStepValid = useMemo(() => {
    const currentStepConfig = WIZARD_STEPS.find(step => step.id === currentStep);
    if (!currentStepConfig) return false;

    try {
      currentStepConfig.schema.parse(formValues);
      return true;
    } catch (error) {
      return false;
    }
  }, [currentStep, formValues]);

  // Track form dirty state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Image upload handlers
  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    const currentImages = form.getValues('images') || [];
    const newImages = [...currentImages, ...acceptedFiles].slice(0, 10);
    form.setValue('images', newImages);
    
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10));
    
    setIsDirty(true);
  }, [form]);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeImage = (index: number) => {
    const images = form.getValues('images') || [];
    const newImages = images.filter((_, i) => i !== index);
    form.setValue('images', newImages);
    
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setIsDirty(true);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const images = form.getValues('images') || [];
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    form.setValue('images', newImages);

    const newPreviews = [...imagePreviews];
    const [removedPreview] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, removedPreview);
    setImagePreviews(newPreviews);
    setIsDirty(true);
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length && isCurrentStepValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allow navigation to previous steps or current step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!isCurrentStepValid || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Create property data
      const propertyData = {
        name: data.name,
        propertyType: data.propertyType,
        ownershipType: data.ownershipType,
        tags: data.tags,
        address: data.address,
        unitSuite: data.unitSuite,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        totalUnits: data.totalUnits,
        yearBuilt: data.yearBuilt,
        sqft: data.sqft,
        lotSize: data.lotSize,
        description: data.description,
        propertyManager: data.propertyManager,
        rentDueDay: data.rentDueDay,
        allowOnlinePayments: data.allowOnlinePayments,
        enableMaintenanceRequests: data.enableMaintenanceRequests,
      };

      // Create property
      const property = await propertiesApi.create(propertyData);

      // Upload images if any
      if (data.images && data.images.length > 0) {
        await Promise.all(
          data.images.map(file => propertiesApi.uploadImage(property.id, file))
        );
      }

      // Success handling
      toast.success('🎉 Property created successfully!');
      onSuccess();
      
      // Reset form and state
      form.reset();
      setImagePreviews([]);
      setCurrentStep(1);
      setIsDirty(false);
      onClose();

      // Show "Add Units" prompt after a delay
      setTimeout(() => {
        toast((t) => (
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium">Property Created Successfully!</span>
            </div>
            <p className="text-sm text-gray-600">Would you like to add units to "{data.name}" now?</p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = '/units';
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Units
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toast.dismiss(t.id)}
                className="text-xs"
              >
                Later
              </Button>
            </div>
          </div>
        ), { duration: 10000 });
      }, 1500);

    } catch (error) {
      console.error('Failed to create property:', error);
      toast.error('Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      // Show confirmation dialog for dirty form
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        form.reset();
        setImagePreviews([]);
        setCurrentStep(1);
        setIsDirty(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
      form.reset();
      setImagePreviews([]);
      setCurrentStep(1);
      setIsDirty(false);
    }
  }, [isOpen, form]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isDirty]);

  const currentStepConfig = WIZARD_STEPS.find(step => step.id === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === WIZARD_STEPS.length;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:w-[45%] md:w-[40%] flex flex-col h-full p-0 gap-0">
        {/* Header with Progress */}
        <div className="border-b bg-white">
          {/* Header */}
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Create New Property
            </SheetTitle>
            <SheetDescription>
              Step {currentStep} of {WIZARD_STEPS.length}: {currentStepConfig?.description}
            </SheetDescription>
          </SheetHeader>

          {/* Progress Indicator */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              {WIZARD_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="relative">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      disabled={step.id > currentStep}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 transform hover:scale-105 ${
                        step.id < currentStep 
                          ? 'bg-primary border-primary text-white cursor-pointer hover:bg-primary/90 shadow-lg shadow-primary/25' :
                        step.id === currentStep 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' :
                        'bg-white border-gray-300 text-gray-400 cursor-not-allowed hover:scale-100'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                      {step.id === currentStep && (
                        <div className="absolute -inset-2 rounded-full border-2 border-primary/20"></div>
                      )}
                    </button>
                    
                    {/* Step label */}
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 text-center">
                      <div className={`text-xs font-medium transition-colors duration-200 ${
                        step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="flex-1 mx-4 mt-2">
                      <div className={`h-1 rounded-full transition-all duration-500 ease-in-out ${
                        step.id < currentStep 
                          ? 'bg-primary' 
                          : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Enhanced step info */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 mb-4">{currentStepConfig?.description}</p>
              
              {/* Progress bar */}
              <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
                  style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
                />
                {/* Add subtle pulsing animation to the end of the progress bar */}
                <div 
                  className="absolute top-0 h-full w-4 bg-primary/30 rounded-full transition-all duration-500 ease-in-out animate-pulse"
                  style={{ 
                    left: `${Math.max(0, (currentStep / WIZARD_STEPS.length) * 100 - 4)}%`,
                    opacity: currentStep < WIZARD_STEPS.length ? 1 : 0
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Step {currentStep} of {WIZARD_STEPS.length}</span>
                <span>{Math.round((currentStep / WIZARD_STEPS.length) * 100)}% Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <Step1BasicInfo 
                form={form} 
                formErrors={formErrors} 
                formValues={formValues}
              />
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <Step2Location 
                form={form} 
                formErrors={formErrors} 
                formValues={formValues}
              />
            )}

            {/* Step 3: Property Details */}
            {currentStep === 3 && (
              <Step3PropertyDetails 
                form={form} 
                formErrors={formErrors} 
                formValues={formValues}
              />
            )}

            {/* Step 4: Media */}
            {currentStep === 4 && (
              <Step4Media 
                form={form}
                imagePreviews={imagePreviews}
                getImageRootProps={getImageRootProps}
                getImageInputProps={getImageInputProps}
                isImageDragActive={isImageDragActive}
                removeImage={removeImage}
                reorderImages={reorderImages}
              />
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <Step5Review 
                form={form} 
                formErrors={formErrors} 
                formValues={formValues}
                imagePreviews={imagePreviews}
                onEditStep={setCurrentStep}
              />
            )}

            {/* Bottom padding to ensure content is not hidden behind sticky footer */}
            <div className="h-16" />
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="border-t bg-white p-6 flex-shrink-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isCurrentStepValid && !isLastStep && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-700 font-medium">Complete required fields to continue</span>
                </div>
              )}
              
              {isCurrentStepValid && !isLastStep && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Step completed</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={isFirstStep ? handleClose : handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-md"
              >
                {isFirstStep ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </>
                )}
              </Button>
              
              {isLastStep ? (
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting || !isCurrentStepValid}
                  className="flex items-center gap-2 px-8 py-2.5 font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Property...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Property
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  className="flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ConfirmationDialog Component
interface ConfirmationDialogProps {
  dialog: ConfirmationDialog;
  onClose: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ dialog, onClose }) => {
  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {dialog.type === 'destructive' && (
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            )}
            {dialog.type === 'warning' && (
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            )}
            {dialog.type === 'info' && (
              <div className="p-2 bg-blue-100 rounded-full">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold">{dialog.title}</h3>
          </div>
          <p className="text-muted-foreground mb-6">{dialog.message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={dialog.type === 'destructive' ? 'destructive' : 'default'}
              onClick={dialog.onConfirm}
            >
              {dialog.confirmText}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 

// IncomeAnalyticsModal Component
interface IncomeAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IncomeAnalyticsModal: React.FC<IncomeAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch income analytics data
  const { 
    data: incomeData, 
    isLoading, 
    error
  } = useSWR<IncomeAnalytics>(
    isOpen ? `/api/income-analytics/${selectedMonths}` : null,
    () => propertiesApi.getIncomeAnalytics(selectedMonths)
  );

  const handleRefresh = () => {
    mutate(isOpen ? `/api/income-analytics/${selectedMonths}` : null);
  };

  const handleExportData = async (format: 'csv' | 'pdf') => {
    if (!incomeData) return;
    
    setIsExporting(true);
    try {
      const result = await propertiesApi.exportIncomeData(format, selectedMonths);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export income data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Monthly Income Analytics</h2>
                <p className="text-sm text-gray-600">Financial performance and trending insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select 
                value={selectedMonths.toString()} 
                onValueChange={(value) => setSelectedMonths(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Income Data</h3>
              <p className="text-gray-600 mb-4">Unable to fetch income analytics at this time.</p>
              <Button onClick={handleRefresh}>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : incomeData ? (
            <div className="p-6 space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Monthly Income */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Current Month</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {formatCurrency(incomeData.growthMetrics.currentMonth)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {incomeData.growthMetrics.isPositive ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            incomeData.growthMetrics.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(incomeData.growthMetrics.growthRate)}
                          </span>
                          <span className="text-xs text-gray-500">vs last month</span>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Year to Date */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Year to Date</p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(incomeData.totalYearToDate)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {formatPercentage(incomeData.yearOverYearGrowth)}
                          </span>
                          <span className="text-xs text-gray-500">vs last year</span>
                        </div>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Collection Efficiency */}
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Collection Rate</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {incomeData.collectionEfficiency.toFixed(1)}%
                        </p>
                        <div className="mt-2">
                          <Progress 
                            value={incomeData.collectionEfficiency} 
                            className="h-2 bg-purple-100"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Monthly Income Trends</CardTitle>
                      <CardDescription>
                        Rental income performance over the last {selectedMonths} months
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Average: {formatCurrency(incomeData.averageMonthlyIncome)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incomeData.monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="monthName" 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-semibold">{label}</p>
                                  {payload.map((entry, index) => (
                                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                                      {entry.name}: {formatCurrency(entry.value as number)}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="totalIncome" 
                          fill="#3B82F6" 
                          radius={[4, 4, 0, 0]}
                          name="Total Income"
                        />
                        <Bar 
                          dataKey="collectedIncome" 
                          fill="#10B981" 
                          radius={[4, 4, 0, 0]}
                          name="Collected"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Top Performing Properties
                  </CardTitle>
                  <CardDescription>
                    Properties contributing most to your monthly income
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incomeData.topPerformingProperties.map((item, index) => (
                      <div 
                        key={item.property.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                            {index === 0 ? '🏆' : index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.property.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.property.city}, {item.property.state} • {item.property.totalUnits} units
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(item.monthlyIncome)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.percentageOfTotal.toFixed(1)}% of total
                              </p>
                            </div>
                            <div className="w-20">
                              <Progress 
                                value={item.percentageOfTotal} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Data
                  </CardTitle>
                  <CardDescription>
                    Download your income analytics for reporting or record keeping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleExportData('csv')}
                      disabled={isExporting}
                      className="flex items-center gap-2"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4" />
                      )}
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportData('pdf')}
                      disabled={isExporting}
                      className="flex items-center gap-2"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      Export PDF
                    </Button>
                    <div className="text-sm text-gray-500 ml-auto">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Income Data Available</h3>
              <p className="text-gray-600">
                Income analytics will appear here once you have rental income data.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 

// Step 1: Basic Info Component
interface Step1Props {
  form: any;
  formErrors: any;
  formValues: PropertyFormData;
}

const Step1BasicInfo: React.FC<Step1Props> = ({ form, formErrors, formValues }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full">
            <Building className="h-16 w-16 text-blue-600" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Basic Information</h2>
        <p className="text-gray-600 max-w-md mx-auto">Let's start with the essential details about your property. This information helps us understand your property type and categorization.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Property Name *</label>
          <Input
            {...form.register('name')}
            placeholder="e.g., Sunset Apartments, Oak Street Complex"
            className={`h-12 text-base transition-all duration-200 ${
              formErrors.name 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
            }`}
          />
          {formErrors.name && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.name.message}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Property Type *</label>
            <Select 
              value={form.watch('propertyType')} 
              onValueChange={(value) => form.setValue('propertyType', value as any)}
            >
              <SelectTrigger className={`h-12 text-base transition-all duration-200 ${
                formErrors.propertyType 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
              }`}>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{type}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.propertyType && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{formErrors.propertyType.message}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Ownership Type *</label>
            <Select 
              value={form.watch('ownershipType')} 
              onValueChange={(value) => form.setValue('ownershipType', value as any)}
            >
              <SelectTrigger className={`h-12 text-base transition-all duration-200 ${
                formErrors.ownershipType 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
              }`}>
                <SelectValue placeholder="Select ownership" />
              </SelectTrigger>
              <SelectContent>
                {OWNERSHIP_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded">
                        {type === 'Owned' && <Home className="h-4 w-4 text-green-600" />}
                        {type === 'Managed' && <Users className="h-4 w-4 text-green-600" />}
                        {type === 'Third-Party' && <Building2 className="h-4 w-4 text-green-600" />}
                      </div>
                      <span className="font-medium">{type}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.ownershipType && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{formErrors.ownershipType.message}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Tags (Optional)</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {form.watch('tags').map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => {
                    const tags = form.getValues('tags');
                    form.setValue('tags', tags.filter((_: string, i: number) => i !== index));
                  }}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Select 
            value="" 
            onValueChange={(value) => {
              const tags = form.getValues('tags');
              if (!tags.includes(value)) {
                form.setValue('tags', [...tags, value]);
              }
            }}
          >
            <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-500 hover:border-gray-300">
              <SelectValue placeholder="Add tags to categorize your property" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_TAGS.filter(tag => !form.watch('tags').includes(tag)).map(tag => (
                <SelectItem key={tag} value={tag} className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-100 rounded">
                      <Tag className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">{tag}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-2">Tags help organize and filter your properties across your portfolio</p>
        </div>
      </div>
    </div>
  );
};

// Step 2: Location Component
const Step2Location: React.FC<Step1Props> = ({ form, formErrors, formValues }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-full">
            <MapPin className="h-16 w-16 text-green-600" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">2</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Location Details</h2>
        <p className="text-gray-600 max-w-md mx-auto">Specify the exact location of your property. Accurate address information is essential for legal documents and tenant communications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Street Address *</label>
          <Input
            {...form.register('address')}
            placeholder="e.g., 123 Main Street"
            className={`h-12 text-base transition-all duration-200 ${
              formErrors.address 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
            }`}
          />
          {formErrors.address && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.address.message}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Unit/Suite Number (Optional)</label>
          <Input
            {...form.register('unitSuite')}
            placeholder="e.g., Suite 100, Building A"
            className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-all duration-200"
          />
          <p className="text-sm text-gray-500 mt-2">Add if your property has a specific unit or suite number</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">City *</label>
            <Input
              {...form.register('city')}
              placeholder="e.g., San Francisco"
              className={`h-12 text-base transition-all duration-200 ${
                formErrors.city 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
              }`}
            />
            {formErrors.city && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {formErrors.city.message}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">State *</label>
            <Select 
              value={form.watch('state')} 
              onValueChange={(value) => form.setValue('state', value)}
            >
              <SelectTrigger className={`h-12 text-base transition-all duration-200 ${
                formErrors.state 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
              }`}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {US_STATES.map(state => (
                  <SelectItem key={state} value={state} className="py-2">
                    <span className="font-medium">{state}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.state && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{formErrors.state.message}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">ZIP Code *</label>
            <Input
              {...form.register('zipCode')}
              placeholder="e.g., 94105"
              className={`h-12 text-base transition-all duration-200 ${
                formErrors.zipCode 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
              }`}
            />
            {formErrors.zipCode && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {formErrors.zipCode.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Country</label>
          <Input
            {...form.register('country')}
            placeholder="Country"
            className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-all duration-200"
          />
          <p className="text-sm text-gray-500 mt-2">Defaults to United States</p>
        </div>
      </div>
    </div>
  );
};

// Step 3: Property Details Component
const Step3PropertyDetails: React.FC<Step1Props> = ({ form, formErrors, formValues }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Details</h2>
        <p className="text-sm text-gray-600">Tell us more about the physical characteristics of your property.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Units *</label>
            <Input
              type="number"
              {...form.register('totalUnits', { valueAsNumber: true })}
              placeholder="e.g., 24"
              min="1"
              className={`transition-colors ${formErrors.totalUnits ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
            />
            {formErrors.totalUnits && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.totalUnits.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">How many rentable units are in this property?</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
            <Input
              type="number"
              {...form.register('yearBuilt', { valueAsNumber: true })}
              placeholder="e.g., 1995"
              min="1800"
              max={new Date().getFullYear()}
              className={`transition-colors ${formErrors.yearBuilt ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
            />
            {formErrors.yearBuilt && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.yearBuilt.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">When was the property originally built?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Square Footage</label>
            <Input
              type="number"
              {...form.register('sqft', { valueAsNumber: true })}
              placeholder="e.g., 15000"
              min="0"
              className={`transition-colors ${formErrors.sqft ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
            />
            {formErrors.sqft && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.sqft.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Total rentable square footage</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lot Size (sq ft)</label>
            <Input
              type="number"
              {...form.register('lotSize', { valueAsNumber: true })}
              placeholder="e.g., 25000"
              min="0"
              className={`transition-colors ${formErrors.lotSize ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
            />
            {formErrors.lotSize && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.lotSize.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Size of the entire lot/parcel</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Description</label>
          <textarea
            {...form.register('description')}
            placeholder="Describe your property's features, amenities, and unique characteristics..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">Optional: Add details about amenities, recent upgrades, neighborhood, etc.</p>
        </div>
      </div>
    </div>
  );
};

// Step 4: Media Component
interface Step4Props {
  form: any;
  imagePreviews: string[];
  getImageRootProps: any;
  getImageInputProps: any;
  isImageDragActive: boolean;
  removeImage: (index: number) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
}

const Step4Media: React.FC<Step4Props> = ({ 
  form, 
  imagePreviews, 
  getImageRootProps, 
  getImageInputProps, 
  isImageDragActive, 
  removeImage, 
  reorderImages 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Images</h2>
        <p className="text-sm text-gray-600">Upload high-quality photos to showcase your property.</p>
      </div>

      <div className="space-y-4">
        {/* Upload Area */}
        <div
          {...getImageRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isImageDragActive 
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getImageInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {isImageDragActive ? (
              <>
                <Upload className="h-10 w-10 text-blue-500" />
                <p className="text-lg font-medium text-blue-600">Drop your images here</p>
              </>
            ) : (
              <>
                <Camera className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">Drag & drop images here</p>
                  <p className="text-sm text-gray-500">or click to select files</p>
                </div>
              </>
            )}
            <div className="text-xs text-gray-500 space-y-1">
              <p>Accepted formats: PNG, JPG, JPEG, GIF</p>
              <p>Maximum size: 10MB per image | Maximum: 10 images</p>
            </div>
          </div>
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Uploaded Images ({imagePreviews.length}/10)
              </h3>
              <p className="text-xs text-gray-500">Drag to reorder • First image will be the cover photo</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        if (fromIndex !== index) {
                          reorderImages(fromIndex, index);
                        }
                      }}
                    />
                    
                    {/* Cover photo indicator */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Cover
                      </div>
                    )}
                    
                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    {/* Drag handle */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-4 h-4 bg-black bg-opacity-50 rounded flex items-center justify-center cursor-move">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">Image {index + 1}</p>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-800 mb-1">💡 Tips for great property photos:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Take photos during the day with natural lighting</li>
                <li>• Include exterior, common areas, and representative unit interiors</li>
                <li>• Make sure the first image is the best overall view</li>
                <li>• Show unique features and amenities</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 5: Review Component
interface Step5Props {
  form: any;
  formErrors: any;
  formValues: PropertyFormData;
  imagePreviews: string[];
  onEditStep: (step: number) => void;
}

const Step5Review: React.FC<Step5Props> = ({ form, formErrors, formValues, imagePreviews, onEditStep }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Review & Create</h2>
        <p className="text-sm text-gray-600">Please review all details before creating your property.</p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Basic Information
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Property Name:</span>
              <p className="font-medium">{formValues.name || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600">Property Type:</span>
              <p className="font-medium">{formValues.propertyType}</p>
            </div>
            <div>
              <span className="text-gray-600">Ownership Type:</span>
              <p className="font-medium">{formValues.ownershipType}</p>
            </div>
            <div>
              <span className="text-gray-600">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formValues.tags && formValues.tags.length > 0 ? (
                  formValues.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                  ))
                ) : (
                  <span className="text-gray-400 italic">None</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="text-sm space-y-2">
            <p className="font-medium">
              {formValues.address || 'Address not specified'}
              {formValues.unitSuite && `, ${formValues.unitSuite}`}
            </p>
            <p className="text-gray-600">
              {formValues.city || 'City not specified'}, {formValues.state || 'State not specified'} {formValues.zipCode || 'ZIP not specified'}
            </p>
            <p className="text-gray-600">{formValues.country}</p>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Property Details
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Units:</span>
              <p className="font-medium">{formValues.totalUnits || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600">Year Built:</span>
              <p className="font-medium">{formValues.yearBuilt || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600">Square Footage:</span>
              <p className="font-medium">{formValues.sqft ? `${formValues.sqft.toLocaleString()} sq ft` : 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600">Lot Size:</span>
              <p className="font-medium">{formValues.lotSize ? `${formValues.lotSize.toLocaleString()} sq ft` : 'Not specified'}</p>
            </div>
          </div>
          {formValues.description && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">Description:</span>
              <p className="text-sm text-gray-900 mt-1">{formValues.description}</p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Property Images ({imagePreviews.length})
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(4)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          {imagePreviews.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {imagePreviews.slice(0, 4).map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-16 object-cover rounded border"
                  />
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
              {imagePreviews.length > 4 && (
                <div className="w-full h-16 bg-gray-200 rounded border flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{imagePreviews.length - 4} more</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No images uploaded</p>
          )}
        </div>

        {/* Management Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            Management Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Property Manager:</span>
              <p className="font-medium">{formValues.propertyManager || 'Not assigned'}</p>
            </div>
            <div>
              <span className="text-gray-600">Rent Due Day:</span>
              <p className="font-medium">
                {formValues.rentDueDay}
                {formValues.rentDueDay === 1 ? 'st' : formValues.rentDueDay === 2 ? 'nd' : formValues.rentDueDay === 3 ? 'rd' : 'th'} of the month
              </p>
            </div>
            <div>
              <span className="text-gray-600">Online Payments:</span>
              <p className="font-medium">{formValues.allowOnlinePayments ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <span className="text-gray-600">Maintenance Requests:</span>
              <p className="font-medium">{formValues.enableMaintenanceRequests ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </div>

        {/* Final checks */}
        {Object.keys(formErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Please fix the following errors:</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(formErrors).map(([field, error]: [string, any]) => (
                <li key={field}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Manager Assignment Sheet Component
interface ManagerAssignmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperties: string[];
  onAssignManager: (managerId: string, propertyIds: string[]) => void;
}

const ManagerAssignmentSheet: React.FC<ManagerAssignmentSheetProps> = ({ 
  isOpen, 
  onClose, 
  selectedProperties, 
  onAssignManager 
}) => {
  const [managers, setManagers] = useState<PropertyManager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState<PropertyManager | null>(null);
  
  // Fetch available managers
  useEffect(() => {
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);
  
  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      // API call to fetch users with property_manager role
      const response = await fetch('/api/users?role=property_manager', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      setManagers(data);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      toast.error('Failed to load managers');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAssign = async () => {
    if (!selectedManager) return;
    
    try {
      await onAssignManager(selectedManager.id, selectedProperties);
      toast.success(`Manager assigned to ${selectedProperties.length} properties`);
      onClose();
    } catch (error) {
      console.error('Failed to assign manager:', error);
      toast.error('Failed to assign manager');
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Assign Manager
          </SheetTitle>
          <SheetDescription>
            Assign a property manager to {selectedProperties.length} selected {selectedProperties.length === 1 ? 'property' : 'properties'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search managers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Managers List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredManagers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No managers found</p>
                <p className="text-sm">Try adjusting your search or add new managers</p>
              </div>
            ) : (
              filteredManagers.map((manager) => (
                <button
                  key={manager.id}
                  onClick={() => setSelectedManager(manager)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                    selectedManager?.id === manager.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={manager.avatar} alt={manager.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {manager.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">{manager.name}</h4>
                    <p className="text-sm text-gray-500">{manager.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Managing {manager.properties.length} properties
                    </p>
                  </div>
                  {selectedManager?.id === manager.id && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedManager}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Manager
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Property View Sheet Component
interface PropertyViewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  propertyViewData: PropertyViewData | null;
  onEdit: (propertyId: string) => void;
  onArchive: (propertyId: string) => void;
  formatCurrency: (amount: number) => string;
}

const PropertyViewSheet: React.FC<PropertyViewSheetProps> = ({ 
  isOpen, 
  onClose, 
  property, 
  propertyViewData, 
  onEdit, 
  onArchive, 
  formatCurrency 
}) => {
  if (!property) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:w-[800px] max-w-[90vw] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold">{property.name}</SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(property.id)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onArchive(property.id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Property
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Map
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Property Images */}
          {property.images && property.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {property.images.slice(0, 6).map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${property.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Total Units</span>
                </div>
                <div className="text-2xl font-bold">{property.totalUnits}</div>
                <div className="text-sm text-gray-500">
                  {property.occupiedUnits} occupied, {property.vacantUnits} vacant
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Occupancy Rate</span>
                </div>
                <div className="text-2xl font-bold">{property.occupancyRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">
                  {property.occupancyRate >= 90 ? 'Excellent' : property.occupancyRate >= 80 ? 'Good' : 'Needs Attention'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Monthly Income</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(property.netIncome)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(property.avgRentPerUnit)} per unit
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Health Score</span>
                </div>
                <div className="text-2xl font-bold">{property.propertyHealth}/100</div>
                <div className="text-sm text-gray-500">
                  {property.propertyHealth >= 85 ? 'Excellent' : property.propertyHealth >= 70 ? 'Good' : 'Needs Attention'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Manager Information */}
          {propertyViewData?.manager && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Property Manager</h3>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={propertyViewData.manager.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {propertyViewData.manager.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{propertyViewData.manager.name}</h4>
                    <p className="text-sm text-gray-600">{propertyViewData.manager.email}</p>
                    <p className="text-sm text-gray-500">
                      Managing {propertyViewData.manager.properties.length} properties
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Property Details */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Property Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Property Type</span>
                  </div>
                  <p className="text-sm text-gray-600">{property.propertyType || 'Not specified'}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Year Built</span>
                  </div>
                  <p className="text-sm text-gray-600">{property.yearBuilt || 'Not specified'}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Total Units</span>
                  </div>
                  <p className="text-sm text-gray-600">{property.totalUnits}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Market Value</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {property.marketValue ? formatCurrency(property.marketValue) : 'Not specified'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Neighborhood</span>
                  </div>
                  <p className="text-sm text-gray-600">{property.neighborhood || 'Not specified'}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {property.rating ? `${property.rating}/5 (${property.reviews} reviews)` : 'No ratings yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Description */}
          {property.description && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Description</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Amenities</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tags */}
          {property.tags && property.tags.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-blue-600 border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Maintenance & Lease Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Maintenance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Requests</span>
                    <Badge variant="outline">{property.maintenanceRequests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Urgent</span>
                    <Badge variant="destructive">{property.urgentMaintenanceRequests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Inspection</span>
                    <span className="text-sm text-gray-600">
                      {property.lastInspection ? new Date(property.lastInspection).toLocaleDateString() : 'Not scheduled'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Leases</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expiring This Month</span>
                    <Badge variant="outline">{property.leasesExpiringThisMonth}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expiring Next 30 Days</span>
                    <Badge variant="outline">{property.leasesExpiringNext30Days}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tenant Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">
                        {property.tenantSatisfaction ? `${property.tenantSatisfaction}/5` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Financial Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Financial Summary</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Monthly Rent</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(property.monthlyRent)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Net Income</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(property.netIncome)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Avg Rent/Unit</p>
                  <p className="text-lg font-semibold">{formatCurrency(property.avgRentPerUnit)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Monthly Expenses</p>
                  <p className="text-lg font-semibold text-red-600">
                    {property.expenses ? formatCurrency(property.expenses) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Alerts and Issues */}
          {(property.urgentMaintenanceRequests > 0 || property.leasesExpiringNext30Days > 0) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold">Alerts & Issues</h3>
                </div>
                <div className="space-y-3">
                  {property.urgentMaintenanceRequests > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">Urgent Maintenance</p>
                        <p className="text-sm text-red-600">
                          {property.urgentMaintenanceRequests} urgent requests require attention
                        </p>
                      </div>
                    </div>
                  )}
                  {property.leasesExpiringNext30Days > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800">Expiring Leases</p>
                        <p className="text-sm text-orange-600">
                          {property.leasesExpiringNext30Days} leases expiring within 30 days
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Recent Activity */}
          {propertyViewData?.recentActivity && propertyViewData.recentActivity.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {propertyViewData.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Advanced Filters Sheet Component
interface AdvancedFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearAll: () => void;
}

const AdvancedFiltersSheet: React.FC<AdvancedFiltersSheetProps> = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  onClearAll 
}) => {
  const [managers, setManagers] = useState<PropertyManager[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch filter data when sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchFilterData();
    }
  }, [isOpen]);

  const fetchFilterData = async () => {
    setIsLoadingData(true);
    try {
      // Use mock data since API endpoints aren't implemented yet
      setManagers([
        {
          id: 'manager-1',
          name: 'John Smith',
          email: 'john.smith@ormi.com',
          avatar: '',
          properties: []
        },
        {
          id: 'manager-2', 
          name: 'Sarah Johnson',
          email: 'sarah.johnson@ormi.com',
          avatar: '',
          properties: []
        },
        {
          id: 'manager-3',
          name: 'Mike Davis',
          email: 'mike.davis@ormi.com', 
          avatar: '',
          properties: []
        }
      ]);
      
      setCities(['San Francisco', 'Los Angeles', 'Seattle', 'Austin', 'Denver']);
      setStates(['CA', 'WA', 'TX', 'CO', 'NY']);
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: keyof AdvancedFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const propertyStatuses = [
    'Active', 'Under Construction', 'Vacant', 'Fully Occupied', 
    'Partially Occupied', 'Maintenance Only', 'Archived'
  ];

  const propertyTypes = [
    'Multi-Family', 'Single-Family', 'Condo', 'Commercial', 
    'Office', 'Mixed Use', 'Duplex', 'Storage', 'Land'
  ];

  const ownershipTypes = ['Owned', 'Managed', 'Third-Party'];

  const occupancyRanges = [
    { label: '0-25%', min: 0, max: 25 },
    { label: '26-50%', min: 26, max: 50 },
    { label: '51-75%', min: 51, max: 75 },
    { label: '76-100%', min: 76, max: 100 },
  ];

  const activeFiltersCount = 
    filters.status.length + 
    filters.propertyType.length + 
    filters.manager.length + 
    filters.city.length + 
    filters.state.length + 
    (filters.zipCode ? 1 : 0) + 
    filters.ownershipType.length + 
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) + 
    (filters.includeArchived ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Filter properties by status, type, location, and more
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Keyword Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Keyword Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, address, tags, or description..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Property Status */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Property Status</label>
            <div className="grid grid-cols-2 gap-2">
              {propertyStatuses.map((status) => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => toggleArrayValue('status', status)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Property Type</label>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.propertyType.includes(type)}
                    onChange={() => toggleArrayValue('propertyType', type)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Assigned Manager */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Assigned Manager</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.manager.includes('unassigned')}
                  onChange={() => toggleArrayValue('manager', 'unassigned')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Unassigned</span>
              </label>
              {managers.map((manager) => (
                <label key={manager.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.manager.includes(manager.id)}
                    onChange={() => toggleArrayValue('manager', manager.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={manager.avatar} />
                      <AvatarFallback className="text-xs">
                        {manager.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{manager.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Occupancy Rate</label>
            <div className="space-y-2">
              {occupancyRanges.map((range) => (
                <label key={range.label} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="occupancy"
                    checked={filters.occupancyRange[0] === range.min && filters.occupancyRange[1] === range.max}
                    onChange={() => updateFilter('occupancyRange', [range.min, range.max])}
                    className="border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{range.label}</span>
                </label>
              ))}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="occupancy"
                  checked={filters.occupancyRange[0] === 0 && filters.occupancyRange[1] === 100}
                  onChange={() => updateFilter('occupancyRange', [0, 100])}
                  className="border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">All</span>
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Location</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Cities</label>
                <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                  {cities.map((city) => (
                    <label key={city} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.city.includes(city)}
                        onChange={() => toggleArrayValue('city', city)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">States</label>
                <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                  {states.map((state) => (
                    <label key={state} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.state.includes(state)}
                        onChange={() => toggleArrayValue('state', state)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{state}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">ZIP Code</label>
              <Input
                placeholder="Enter ZIP code"
                value={filters.zipCode}
                onChange={(e) => updateFilter('zipCode', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Ownership Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Ownership Type</label>
            <div className="space-y-2">
              {ownershipTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ownershipType.includes(type)}
                    onChange={() => toggleArrayValue('ownershipType', type)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Include Archived */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Include Archived Properties</label>
            <input
              type="checkbox"
              checked={filters.includeArchived}
              onChange={(e) => updateFilter('includeArchived', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t space-x-3">
          <Button variant="outline" onClick={onClearAll} disabled={activeFiltersCount === 0}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Property Edit Sheet Component
interface PropertyEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  property: EnhancedProperty | null;
  onPropertyUpdated: (property: EnhancedProperty) => void;
}

const PropertyEditSheet: React.FC<PropertyEditSheetProps> = ({ 
  isOpen, 
  onClose, 
  property,
  onPropertyUpdated 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    yearBuilt: '',
    squareFootage: '',
    totalUnits: '',
    description: '',
    notes: '',
    tags: [] as string[],
    managerId: '',
    ownershipType: '',
    images: [] as string[],
    amenities: [] as string[],
    neighborhood: '',
    marketValue: '',
    purchasePrice: '',
    purchaseDate: '',
    expenses: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<PropertyManager[]>([]);

  // Pre-populate form when property changes
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        type: property.propertyType || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zipCode: property.zipCode || '',
        country: 'United States',
        yearBuilt: property.yearBuilt ? String(property.yearBuilt) : '',
        squareFootage: '',
        totalUnits: property.totalUnits ? String(property.totalUnits) : '',
        description: property.description || '',
        notes: property.notes || '',
        tags: property.tags || [],
        managerId: typeof property.manager === 'string' ? property.manager : property.manager?.id || '',
        ownershipType: '',
        images: property.images || [],
        amenities: property.amenities || [],
        neighborhood: property.neighborhood || '',
        marketValue: property.marketValue ? String(property.marketValue) : '',
        purchasePrice: property.purchasePrice ? String(property.purchasePrice) : '',
        purchaseDate: property.purchaseDate || '',
        expenses: property.expenses ? String(property.expenses) : ''
      });
      setCurrentStep(0);
    }
  }, [property]);

  // Fetch managers when sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);

  const fetchManagers = async () => {
    // For now, use mock manager data since the API endpoint isn't implemented yet
    setManagers([
      {
        id: 'manager-1',
        name: 'John Smith',
        email: 'john.smith@ormi.com',
        avatar: '',
        properties: []
      },
      {
        id: 'manager-2', 
        name: 'Sarah Johnson',
        email: 'sarah.johnson@ormi.com',
        avatar: '',
        properties: []
      },
      {
        id: 'manager-3',
        name: 'Mike Davis',
        email: 'mike.davis@ormi.com', 
        avatar: '',
        properties: []
      }
    ]);
  };

  const handleSubmit = async () => {
    if (!property) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
          squareFootage: formData.squareFootage ? parseInt(formData.squareFootage) : null,
          totalUnits: formData.totalUnits ? parseInt(formData.totalUnits) : null
        })
      });

      if (response.ok) {
        const updatedProperty = await response.json();
        onPropertyUpdated(updatedProperty);
        toast.success("Property updated successfully");
        onClose();
      } else {
        throw new Error('Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error("Failed to update property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Basic Information",
      icon: <Building className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Property Name</label>
            <Input
              placeholder="Enter property name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Property Type</label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                <SelectItem value="Single-Family">Single-Family</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                <SelectItem value="Duplex">Duplex</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Assigned Manager</label>
            <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={manager.avatar} />
                        <AvatarFallback className="text-xs">
                          {manager.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {manager.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Ownership Type</label>
            <Select value={formData.ownershipType} onValueChange={(value) => setFormData({ ...formData, ownershipType: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select ownership type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owned">Owned</SelectItem>
                <SelectItem value="Managed">Managed</SelectItem>
                <SelectItem value="Third-Party">Third-Party</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Location",
      icon: <MapPin className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Street Address</label>
            <Input
              placeholder="Enter street address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="Enter city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <Input
                placeholder="Enter state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">ZIP Code</label>
              <Input
                placeholder="Enter ZIP code"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Input
                placeholder="Enter country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Details",
      icon: <Info className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Year Built</label>
              <Input
                type="number"
                placeholder="e.g., 1995"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Square Footage</label>
              <Input
                type="number"
                placeholder="e.g., 2500"
                value={formData.squareFootage}
                onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Total Units</label>
            <Input
              type="number"
              placeholder="e.g., 12"
              value={formData.totalUnits}
              onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Enter property description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full min-h-[100px] p-3 border rounded-md resize-none"
            />
          </div>
        </div>
      )
    },
    {
      title: "Review",
      icon: <CheckCircle2 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Property Summary</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Type:</strong> {formData.type}</p>
              <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</p>
              <p><strong>Manager:</strong> {
                managers.find(m => m.id === formData.managerId)?.name || 'Unassigned'
              }</p>
              <p><strong>Ownership:</strong> {formData.ownershipType}</p>
              {formData.yearBuilt && <p><strong>Year Built:</strong> {formData.yearBuilt}</p>}
              {formData.squareFootage && <p><strong>Square Footage:</strong> {formData.squareFootage}</p>}
              {formData.totalUnits && <p><strong>Total Units:</strong> {formData.totalUnits}</p>}
            </div>
          </div>
        </div>
      )
    }
  ];

  const canProceed = (step: number) => {
    switch (step) {
      case 0:
        return formData.name && formData.type;
      case 1:
        return formData.address && formData.city && formData.state;
      case 2:
        return true; // Details are optional
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Property
          </SheetTitle>
          <SheetDescription>
            Update property information and settings
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${
                    index === currentStep
                      ? 'bg-primary border-primary text-white'
                      : index < currentStep
                      ? 'bg-primary border-primary text-white'
                      : 'border-gray-300 text-gray-300'
                  }`}
                  onClick={() => index < currentStep && setCurrentStep(index)}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{steps[currentStep].title}</h3>
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Property'}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed(currentStep)}
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Properties;