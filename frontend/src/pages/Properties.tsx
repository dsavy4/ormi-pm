import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { useNavigate, useParams } from 'react-router-dom';
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
  AlertCircle,
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
  ArrowLeft,
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
  ChevronUp,
  RefreshCw,
  User,
  Bed,
  Bath,
  Wrench,
  Loader,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ProCheckbox } from '@/components/ui/pro-checkbox';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { PropertyImageGallery } from '@/components/properties/PropertyImageGallery';
import { PropertyImageUpload } from '@/components/properties/PropertyImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Skeleton, 
  UnitCardSkeleton, 
  UnitsListSkeleton, 
  PropertyCardSkeleton, 
  PropertiesGridSkeleton,
  SearchBarSkeleton,
  FilterBarSkeleton,
  PaginationSkeleton,
  LoadMoreSkeleton,
  StatsGridSkeleton
} from '@/components/ui/skeleton';

// Import new unit components
import { UnitCard } from '@/components/units/UnitCard';
import { EnhancedUnitDetailsSheet } from '@/components/units/EnhancedUnitDetailsSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmationDialog as UnsavedChangesDialog } from '@/components/ui/confirmation-dialog';

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
import { cn, getFileUrl } from '@/lib/utils';

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
  // Handle NaN, null, or undefined values
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0';
  }
  
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

// Helper function to convert property health score to star rating
const getStarRating = (healthScore: number): { stars: number; displayStars: string } => {
  if (healthScore >= 90) return { stars: 5, displayStars: '⭐⭐⭐⭐⭐' };
  if (healthScore >= 80) return { stars: 4, displayStars: '⭐⭐⭐⭐' };
  if (healthScore >= 70) return { stars: 3, displayStars: '⭐⭐⭐' };
  if (healthScore >= 60) return { stars: 2, displayStars: '⭐⭐' };
  if (healthScore >= 50) return { stars: 1, displayStars: '⭐' };
  return { stars: 0, displayStars: 'No Rating' };
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

// Dynamic validation schema for step 2 based on country
const createStep2Schema = (country: string) => z.object({
  address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
  unitSuite: z.string().optional(),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(2, country === 'Canada' ? 'Province/Territory is required' : 'State is required').max(50, country === 'Canada' ? 'Province/Territory must be less than 50 characters' : 'State must be less than 50 characters'),
  zipCode: z.string().min(5, country === 'Canada' ? 'Postal code must be at least 5 characters' : 'ZIP code must be at least 5 characters').max(10, country === 'Canada' ? 'Postal code must be less than 10 characters' : 'ZIP code must be less than 10 characters'),
  country: z.string().default('United States'),
});

// Default schema for initial validation
const step2Schema = createStep2Schema('United States');

const step3Schema = z.object({
  totalUnits: z.number().min(1, 'Total units must be at least 1').max(10000, 'Total units must be less than 10000'),
  yearBuilt: z.number().min(1800, 'Year built must be after 1800').max(new Date().getFullYear(), 'Year built cannot be in the future').optional(),
  sqft: z.number().min(0, 'Square footage must be positive').optional(),
  lotSize: z.number().min(0, 'Lot size must be positive').optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  neighborhood: z.string().optional(),
  notes: z.string().optional(),
});

const step4Schema = z.object({
  images: z.array(z.instanceof(File)).max(10, 'Maximum 10 images allowed').default([]),
});

const step5Schema = z.object({
  // Management settings
  propertyManager: z.string().optional(),
  rentDueDay: z.number().min(1, 'Rent due day is required').max(28, 'Rent due day must be between 1 and 28').default(1),
  allowOnlinePayments: z.boolean().default(true),
  enableMaintenanceRequests: z.boolean().default(true),
  // Financial data
  marketValue: z.number().min(0, 'Market value must be positive').nullable().optional(),
  purchasePrice: z.number().min(0, 'Purchase price must be positive').nullable().optional(),
  purchaseDate: z.string().optional(),
  expenses: z.number().min(0, 'Expenses must be positive').nullable().optional(),
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
    description: '',
    icon: Building,
    schema: step1Schema,
  },
  {
    id: 2,
    title: 'Location',
    description: '',
    icon: MapPin,
    schema: step2Schema,
  },
  {
    id: 3,
    title: 'Property Details',
    description: '',
    icon: Settings,
    schema: step3Schema,
  },
  {
    id: 4,
    title: 'Media',
    description: '',
    icon: Camera,
    schema: step4Schema,
  },
  {
    id: 5,
    title: 'Financial',
    description: '',
    icon: DollarSign,
    schema: step5Schema,
  },
  {
    id: 6,
    title: 'Review',
    description: '',
    icon: CheckCircle2,
    schema: propertyFormSchema,
  },
];

// US States dropdown options - Using abbreviations for consistency
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

// Canadian Provinces and Territories - Using abbreviations for consistency
const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' }
];

// Simplified countries - Focus on primary markets like DoorLoop
const COUNTRIES = [
  'United States',
  'Canada'
];

const PROPERTY_TYPES = [
  'Multi-Family', 'Single-Family', 'Commercial', 'Condominium', 'Townhouse', 'Duplex'
];

// Utility function to map database property types to form property types
const mapPropertyType = (dbType: string | undefined): string => {
  if (!dbType) return 'Multi-Family';
  
  const typeMap: { [key: string]: string } = {
    'APARTMENT': 'Multi-Family',
    'MULTI_FAMILY': 'Multi-Family',
    'SINGLE_FAMILY': 'Single-Family',
    'COMMERCIAL': 'Commercial',
    'CONDOMINIUM': 'Condominium',
    'TOWNHOUSE': 'Townhouse',
    'DUPLEX': 'Duplex',
    // Also handle the form format if it's already correct
    'Multi-Family': 'Multi-Family',
    'Single-Family': 'Single-Family',
    'Commercial': 'Commercial',
    'Condominium': 'Condominium',
    'Townhouse': 'Townhouse',
    'Duplex': 'Duplex',
  };
  
  return typeMap[dbType.toUpperCase()] || 'Multi-Family';
};

// Utility function to map form property types back to database format
const mapPropertyTypeToDb = (formType: string): string => {
  const reverseMap: { [key: string]: string } = {
    'Multi-Family': 'APARTMENT',
    'Single-Family': 'SINGLE_FAMILY',
    'Commercial': 'COMMERCIAL',
    'Condominium': 'CONDOMINIUM',
    'Townhouse': 'TOWNHOUSE',
    'Duplex': 'DUPLEX',
  };
  
  return reverseMap[formType] || 'APARTMENT';
};

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
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId?: string }>();
  
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
  const [filters, setFilters] = useState<PropertyFilters>(() => {
    // Load saved sort order from localStorage on component mount
    const savedSortBy = localStorage.getItem('ormi-properties-sort') || 'name-asc';
    return {
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
      sortBy: savedSortBy as SortOption,
    };
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
  
  // State for inline unit expansion
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [unitDetails, setUnitDetails] = useState<Record<string, any>>({});
  const [loadingUnits, setLoadingUnits] = useState<Set<string>>(new Set());

  // Handle Quick Add events
  useEffect(() => {
    const handleOpenAddProperty = () => {
      setShowAddProperty(true);
    };

    window.addEventListener('openAddProperty', handleOpenAddProperty);
    
    return () => {
      window.removeEventListener('openAddProperty', handleOpenAddProperty);
    };
  }, []);



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
    
    // Cache key for properties - stable and cacheable
    
    return `/api/properties?${params.toString()}`;
  }, [advancedFilters, debouncedAdvancedSearch]);

  // Data fetching with SWR and proper caching
  const { 
    data: propertiesData, 
    error: propertiesError, 
    isLoading: propertiesLoading,
    mutate: mutateProperties 
  } = useSWR<PropertiesResponse>(propertiesKey, propertiesFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 0 // No auto-refresh
  });

  // Insights data with proper caching
  const { 
    data: insights, 
    error: insightsError, 
    isLoading: insightsLoading,
    mutate: mutateInsights 
  } = useSWR<PropertyInsights>('/api/properties/insights', () => propertiesApi.getInsights(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 0 // No auto-refresh
  });

  // Force refresh function to clear cache and refetch
  const forceRefresh = () => {
    mutateProperties();
    mutateInsights();
    toast.success('Data refreshed successfully');
  };

  // Computed values
  const properties = (propertiesData as any)?.data || [];
  const pagination = (propertiesData as any)?.pagination;

  // Auto-open property view when propertyId is provided in URL
  useEffect(() => {
    if (propertyId && properties && properties.length > 0) {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        handleViewProperty(propertyId, false);
      }
    }
  }, [propertyId, properties]);

  // Client-side filtering and sorting
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties;
    
    // Apply search filter
    if (advancedFilters.search) {
      const searchTerm = advancedFilters.search.toLowerCase();
      filtered = properties.filter(property => {
        // Search in property name
        if (property.name.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in address
        if (property.address.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in city
        if (property.city?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in state
        if (property.state?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in property type
        if (property.propertyType?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in manager name (handle both string and object)
        if (typeof property.manager === 'string' && property.manager.toLowerCase().includes(searchTerm)) {
          return true;
        }
        if (typeof property.manager === 'object' && property.manager && 'name' in property.manager && (property.manager as any).name?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        return false;
      });
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'occupancy-desc':
          return (b.occupancyRate || 0) - (a.occupancyRate || 0);
        case 'occupancy-asc':
          return (a.occupancyRate || 0) - (b.occupancyRate || 0);
        case 'income-desc':
          return (b.monthlyNetIncome || 0) - (a.monthlyNetIncome || 0);
        case 'income-asc':
          return (a.monthlyNetIncome || 0) - (b.monthlyNetIncome || 0);
        case 'units-desc':
          return (b.totalUnits || 0) - (a.totalUnits || 0);
        case 'units-asc':
          return (a.totalUnits || 0) - (b.totalUnits || 0);
        case 'value-desc':
          return (b.marketValue || 0) - (a.marketValue || 0);
        case 'value-asc':
          return (a.marketValue || 0) - (b.marketValue || 0);
        case 'recent':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [properties, advancedFilters.search, filters.sortBy]);

  // Helper Functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Enhanced Selection Functions
  // Enhanced Selection Functions with Keyboard Shortcuts
  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length && properties.length > 0) {
      setSelectedProperties([]);
    } else {
      const allPropertyIds = properties.map(p => p.id);
      setSelectedProperties(allPropertyIds);
    }
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Enhanced keyboard shortcuts for selection
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle shortcuts when not in input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Ctrl+A: Toggle select all properties
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      e.stopPropagation();
      
      if (selectedProperties.length === properties.length && properties.length > 0) {
        setSelectedProperties([]);
        toast.success('Deselected all properties');
      } else {
        const allPropertyIds = properties.map(p => p.id);
        setSelectedProperties(allPropertyIds);
        toast.success('Selected all properties');
      }
    }

    // Ctrl+D: Deselect all properties
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      setSelectedProperties([]);
      toast.success('Deselected all properties');
    }

    // Escape: Clear selection
    if (e.key === 'Escape') {
      setSelectedProperties([]);
    }
  }, [selectedProperties.length, properties.length, properties]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Smart selection based on filters
  const handleSmartSelect = (filterType: 'occupied' | 'vacant' | 'maintenance' | 'expiring') => {
    let filteredProperties: string[] = [];
    
    switch (filterType) {
      case 'occupied':
        filteredProperties = properties
          .filter(p => p.occupancyRate > 0)
          .map(p => p.id);
        break;
      case 'vacant':
        filteredProperties = properties
          .filter(p => p.occupancyRate === 0)
          .map(p => p.id);
        break;
      case 'maintenance':
        filteredProperties = properties
          .filter(p => p.maintenanceRequests > 0)
          .map(p => p.id);
        break;
      case 'expiring':
        filteredProperties = properties
          .filter(p => p.leasesExpiring > 0)
          .map(p => p.id);
        break;
    }

    setSelectedProperties(filteredProperties);
    toast.success(`Selected ${filteredProperties.length} ${filterType} properties`);
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
    console.log('[DEBUG] View mode change requested:', newMode, 'current:', viewMode);
    
    // Handle empty string case (ToggleGroup issue)
    if (!newMode || (newMode as string) === '') {
      console.log('[DEBUG] Empty mode detected, keeping current mode:', viewMode);
      return;
    }
    
    // Always update the view mode, even if it's the same
    // This ensures the ToggleGroup stays in sync
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
      // Only handle if not in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
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

  // Debug view mode and filtered properties
  useEffect(() => {
    console.log('[DEBUG] View mode:', viewMode);
    console.log('[DEBUG] Filtered properties count:', filteredAndSortedProperties.length);
    console.log('[DEBUG] View transition:', viewTransition);
  }, [viewMode, filteredAndSortedProperties.length, viewTransition]);

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

  const handleViewProperty = async (propertyId: string, fetchDetails: boolean = false) => {
    const property = properties.find(p => p.id === propertyId);
    setSelectedProperty(property || null);
    setShowPropertyView(true);
    
    if (property) {
      // Set initial data with what we already have
      setPropertyViewData({
        property,
        manager: undefined, // Will be enhanced later when we have proper manager data
        units: property.units || [],
        recentActivity: [],
        documents: []
      });

      // Only fetch detailed data if explicitly requested or if we need fresh data
      if (fetchDetails) {
        try {
          // Use the API client to fetch detailed property data
          const { propertiesApi } = await import('@/lib/api');
          const detailedProperty = await propertiesApi.getById(propertyId);
          
          setPropertyViewData({
            property: detailedProperty,
            manager: undefined,
            units: detailedProperty.units || [],
            recentActivity: [],
            documents: []
          });
        } catch (error: any) {
          // Handle 404 errors - property doesn't exist in database
          if (error?.message?.includes('404') || error?.message?.includes('Property not found')) {
            console.log(`Property ${propertyId} not found in database`);
            
            // Remove the non-existent property from local state
            const updatedProperties = properties.filter(p => p.id !== propertyId);
            setProperties(updatedProperties);
            
            // Close the property view
            setShowPropertyView(false);
            setSelectedProperty(null);
            
            // Show user message and refresh data
            toast.error('Property not found. The property list has been refreshed.');
            await mutateProperties();
            return;
          } else {
            console.error('Failed to fetch property details:', error);
            toast.error('Failed to load detailed property information');
          }
        }
      }
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
              await propertiesApi.delete(propertyId);
          
          await mutateProperties();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          toast.success('Property deleted successfully');
        } catch (error: any) {
          console.error('Failed to delete property:', error);
          
          // Handle specific error cases using the new ApiError structure
          if (error.name === 'ApiError') {
            // Use the detailed error message from the API
                if (error.message?.includes('Cannot delete property with existing units')) {
                  // Offer cascade delete flow
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Delete Property with Units',
                    message: `"${property.name}" still has units. Do you want to delete the property and ALL its units and maintenance requests? This cannot be undone.`,
                    confirmText: 'Delete Property and All Units',
                    type: 'destructive',
                    onConfirm: async () => {
                      try {
                        await propertiesApi.deleteCascade(propertyId);
                        await mutateProperties();
                        toast.success('Property and related data deleted');
                      } catch (cascadeErr: any) {
                        console.error('Cascade delete failed:', cascadeErr);
                        toast.error(cascadeErr.message || 'Failed to cascade delete');
                      } finally {
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                      }
                    }
                  });
                  return; // prevent auto-close below; dialog now shows cascade option
            } else if (error.message?.includes('Cannot delete property with existing maintenance requests')) {
                  // Offer cascade delete flow as well
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Delete Property with Maintenance',
                    message: `"${property.name}" has maintenance requests. Delete property and ALL its units and maintenance requests? This cannot be undone.`,
                    confirmText: 'Delete Property and Maintenance',
                    type: 'destructive',
                    onConfirm: async () => {
                      try {
                        await propertiesApi.deleteCascade(propertyId);
                        await mutateProperties();
                        toast.success('Property and related data deleted');
                      } catch (cascadeErr: any) {
                        console.error('Cascade delete failed:', cascadeErr);
                        toast.error(cascadeErr.message || 'Failed to cascade delete');
                      } finally {
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                      }
                    }
                  });
                  return; // prevent auto-close below; dialog now shows cascade option
            } else if (error.message?.includes('Property not found')) {
              toast.error('Property not found or already deleted.');
            } else {
              // Show the specific error message from the API
              toast.error(error.message || 'Cannot delete property. Please check if it has units or maintenance requests.');
            }
          } else {
            // Fallback for non-ApiError errors
            toast.error('Failed to delete property. Please try again.');
          }
          
          // Always close the dialog after showing error
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Toggle unit expansion and load details
  const toggleUnitExpansion = async (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    
    if (newExpanded.has(unitId)) {
      // Collapse unit
      newExpanded.delete(unitId);
    } else {
      // Expand unit and load details if not already loaded
      newExpanded.add(unitId);
      if (!unitDetails[unitId]) {
        setLoadingUnits(prev => new Set(prev).add(unitId));
        try {
          // TODO: Replace with real API call
          const details = await mockLoadUnitDetails(unitId);
          setUnitDetails(prev => ({ ...prev, [unitId]: details }));
        } catch (error) {
          toast.error('Failed to load unit details');
        } finally {
          setLoadingUnits(prev => {
            const newSet = new Set(prev);
            newSet.delete(unitId);
            return newSet;
          });
        }
      }
    }
    
    setExpandedUnits(newExpanded);
  };
  // Mock function for loading unit details (replace with real API)
  const mockLoadUnitDetails = async (unitId: string): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      lastPayment: {
        date: '2024-01-15',
        amount: 2500
      },
      paymentHistory: [
        { date: '2024-01-15', amount: 2500, status: 'paid' },
        { date: '2023-12-15', amount: 2500, status: 'paid' }
      ],
      maintenanceRequests: [
        { id: '1', title: 'Leaky faucet', status: 'completed', date: '2024-01-10' }
      ],
      lastMaintenance: {
        date: '2024-01-10',
        description: 'Fixed leaky faucet in kitchen'
      },
      nextInspection: '2024-02-15'
    };
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
                <span>⌘D to deselect all</span>
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

          {/* Enhanced Selection Header & Bulk Actions */}
          <AnimatePresence>
            {selectedProperties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 shadow-lg">
                    <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Selection Info */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <ProCheckbox
                            checked={selectedProperties.length === properties.length}
                            onCheckedChange={handleSelectAll}
                            size="lg"
                            className="text-primary"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {selectedProperties.length} {selectedProperties.length === 1 ? 'Property' : 'Properties'} Selected
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedProperties.length === properties.length ? 'All properties selected' : `${properties.length - selectedProperties.length} remaining`}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Selection Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSmartSelect('occupied')}
                            className="text-xs"
                          >
                            Select Occupied
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSmartSelect('vacant')}
                            className="text-xs"
                          >
                            Select Vacant
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSmartSelect('maintenance')}
                            className="text-xs"
                          >
                            Select Maintenance
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSmartSelect('expiring')}
                            className="text-xs"
                          >
                            Select Expiring
                          </Button>
                        </div>
                      </div>

                      {/* Bulk Actions */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProperties([])}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Clear Selection
                        </Button>
                        
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
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkArchive}
                          className="flex items-center gap-2"
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </Button>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI-Powered Insights */}
          <motion.div variants={itemVariants}>
            {insightsLoading ? (
              <StatsGridSkeleton count={4} />
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
                                          {filteredAndSortedProperties.length} properties {pagination && `(${pagination.total} total)`}
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
                    onValueChange={(value) => {
                      const newSortBy = value as SortOption;
                      setFilters(prev => ({...prev, sortBy: newSortBy}));
                      // Save sort order to localStorage for persistence
                      localStorage.setItem('ormi-properties-sort', newSortBy);
                    }}
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
                <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
                  <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange} className="flex">
                    <ToggleGroupItem 
                      value="grid" 
                      aria-label="Grid view"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium"
                    >
                      <Grid3X3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="list" 
                      aria-label="List view"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium"
                    >
                      <List className="h-4 w-4" />
                      <span className="hidden sm:inline">List</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="map" 
                      aria-label="Map view"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">Map</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceRefresh}
                  disabled={propertiesLoading || insightsLoading}
                  className="ml-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
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
                    <>
                      {propertiesLoading ? (
                        <PropertiesGridSkeleton count={6} />
                      ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAndSortedProperties.map((property) => (
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
                    </>
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <>
                      {propertiesLoading ? (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg p-4 border">
                            <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground">
                              <div className="col-span-1">
                                <Skeleton className="h-4 w-4" />
                              </div>
                              <div className="col-span-3 flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <div className="col-span-2 flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-12" />
                              </div>
                              <div className="col-span-2 flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-20" />
                              </div>
                              <div className="col-span-2 flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-20" />
                              </div>
                              <div className="col-span-2 flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="border rounded-lg p-4">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-1">
                                    <Skeleton className="h-4 w-4" />
                                  </div>
                                  <div className="col-span-3">
                                    <Skeleton className="h-5 w-32 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                  </div>
                                  <div className="col-span-2">
                                    <Skeleton className="h-6 w-12" />
                                  </div>
                                  <div className="col-span-2">
                                    <Skeleton className="h-6 w-20" />
                                  </div>
                                  <div className="col-span-2">
                                    <Skeleton className="h-6 w-16" />
                                  </div>
                                  <div className="col-span-2">
                                    <div className="flex space-x-2">
                                      <Skeleton className="h-8 w-8 rounded" />
                                      <Skeleton className="h-8 w-8 rounded" />
                                      <Skeleton className="h-8 w-8 rounded" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                    <div className="space-y-4">
                      {/* Enhanced List Header */}
                      <div className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg p-4 border">
                        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground">
                          <div className="col-span-1">
                            <ProCheckbox
                              checked={selectedProperties.length === properties.length && properties.length > 0}
                              onCheckedChange={handleSelectAll}
                              size="md"
                            />
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Property Name
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Units
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Net Income
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Occupancy
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Actions
                          </div>
                        </div>
                      </div>

                      {/* Enhanced List Items */}
                      <div className="space-y-2">
                        {filteredAndSortedProperties.map((property) => (
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
                    </div>
                      )}
                    </>
                  )}

                  {/* Enhanced Map View */}
                  {viewMode === 'map' && (
                    <div className="space-y-4">
                      {/* Map Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">Property Locations</h3>
                          <Badge variant="secondary" className="ml-2">
                            {filteredAndSortedProperties.filter(p => p.coordinates).length} properties
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span>Properties with coordinates</span>
                          </div>
                        </div>
                      </div>

                      {/* Map Container */}
                      <div className="h-96 lg:h-[600px] rounded-lg overflow-hidden border shadow-lg">
                        <MapContainer
                          center={[37.7749, -122.4194]}
                          zoom={11}
                          style={{ height: '100%', width: '100%' }}
                          className="z-0"
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          {filteredAndSortedProperties.filter(p => p.coordinates).map((property) => (
                            <Marker
                              key={property.id}
                              position={[property.coordinates!.lat, property.coordinates!.lng]}
                            >
                              <Popup>
                                <div className="p-3 min-w-56">
                                  <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                                      <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-sm text-gray-900 truncate">{property.name}</h3>
                                      <p className="text-xs text-muted-foreground mt-1">{property.address}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-muted-foreground">Units:</span>
                                      <span className="font-medium">{property.totalUnits}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-muted-foreground">Occupancy:</span>
                                      <span className="font-medium">{(property.occupancyRate || 0).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-muted-foreground">Net Income:</span>
                                      <span className="font-medium">{formatCurrency(property.netIncome)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 flex gap-2">
                                    <button
                                      onClick={() => {
                                        setViewMode('grid');
                                        setTimeout(() => {
                                          scrollToProperty(property.id);
                                          highlightProperty(property.id);
                                        }, 300);
                                      }}
                                      className="flex-1 bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs hover:bg-primary/90 transition-colors font-medium"
                                    >
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => handleViewProperty(property.id, false)}
                                      className="flex-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs hover:bg-secondary/90 transition-colors font-medium"
                                    >
                                      Quick View
                                    </button>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      </div>

                      {/* Properties without coordinates warning */}
                      {filteredAndSortedProperties.filter(p => !p.coordinates).length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">
                              {filteredAndSortedProperties.filter(p => !p.coordinates).length} properties don't have location data
                            </span>
                          </div>
                          <p className="text-xs text-amber-700 mt-1">
                            Add coordinates to these properties to see them on the map
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty State */}
                  {filteredAndSortedProperties.length === 0 && !propertiesLoading && (
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
          onRefresh={mutateProperties}
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
  onView?: (propertyId: string) => void;
}

// ExpandableUnitCard Component for inline unit expansion
interface ExpandableUnitCardProps {
  unit: {
    id: string;
    number: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    floor: number;
    building?: string;
    amenities?: string[];
    monthlyRent: number;
    securityDeposit: number;
    status: 'occupied' | 'vacant' | 'maintenance' | 'reserved';
    tenant?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      moveInDate: string;
    };
  };
  isExpanded: boolean;
  details?: any;
  isLoading: boolean;
  onToggle: () => void;
  onEdit: (unitId: string) => void;
}



const PropertyImage: React.FC<PropertyImageProps> = ({ property, className, onView }) => {
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
      <div 
        className={`bg-muted flex items-center justify-center ${className} cursor-pointer overflow-hidden rounded-2xl`}
        onClick={(e) => { e.stopPropagation(); onView?.(property.id); }}
        role="button"
        aria-label={`View ${property.name}`}
      >
        <div className="text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className} cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
      onClick={(e) => { e.stopPropagation(); onView?.(property.id); }}
      role="button"
      aria-label={`View ${property.name}`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-2xl" />
      )}
      <img
        src={property.images?.[0] ? getFileUrl(property.images[0]) : '/api/placeholder/400/300'}
        alt={property.name}
        className={`w-full h-full object-cover rounded-2xl transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      
      {/* Hover overlay with subtle visual cue */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-2xl" />
      
      {/* Eye icon in center - more intuitive and visible */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
          <Eye className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </div>
      </div>
    </div>
  );
};

// ExpandableUnitCard Component with ShadCN styling
const ExpandableUnitCard: React.FC<ExpandableUnitCardProps> = ({
  unit,
  isExpanded,
  details,
  isLoading,
  onToggle,
  onEdit
}) => {
  // Get the proper status for StatusBadge
  const getStatusType = (unit: any) => {
    if (unit.status === 'occupied') return 'occupied';
    if (unit.status === 'vacant') return 'vacant';
    if (unit.status === 'maintenance') return 'maintenance';
    if (unit.status === 'reserved') return 'reserved';
    return 'default';
  };

  return (
    <Card className={`transition-all duration-300 ${
      isExpanded ? 'ring-2 ring-blue-200 shadow-lg' : 'hover:shadow-md'
    }`}>
      {/* Collapsed State */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  Unit {unit.number}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {unit.bedrooms}BR/{unit.bathrooms}BA • {unit.squareFootage} sq ft
                </p>
              </div>
            </div>
            
            <div className="mt-2 flex items-center gap-4 text-sm">
              <StatusBadge 
                status={getStatusType(unit)}
                size="sm"
                className="flex-shrink-0"
              />
              
              {unit.status === 'occupied' && unit.tenant && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">{unit.tenant.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-gray-900 dark:text-gray-100">${unit.monthlyRent}/month</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(unit.id)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded State */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t bg-muted/30">
              {details ? (
                <UnitExpandedDetails unit={unit} details={details} />
              ) : (
                <div className="p-4 flex items-center justify-center">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
// Unit Expanded Details Component with ShadCN styling
const UnitExpandedDetails: React.FC<{ unit: any; details: any }> = ({ unit, details }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload to Cloudflare R2
      console.log('Uploading document:', file.name);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-h-[80vh] overflow-y-auto">
      {/* Unit Information Section */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Building className="h-5 w-5" />
          Unit Information
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Unit Number</span>
            <p className="font-medium">{unit.number}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Floor</span>
            <p className="font-medium">{unit.floor || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Bedrooms</span>
            <p className="font-medium">{unit.bedrooms}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Bathrooms</span>
            <p className="font-medium">{unit.bathrooms}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Square Footage</span>
            <p className="font-medium">{unit.squareFootage ? `${unit.squareFootage} sqft` : 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Parking Spaces</span>
            <p className="font-medium">N/A</p>
          </div>
        </div>
        
        {/* Amenities */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Amenities</span>
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
      </div>

      {/* Financial Details Section */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Details
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Monthly Rent</span>
            <p className="font-medium">${unit.monthlyRent}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Security Deposit</span>
            <p className="font-medium">${unit.securityDeposit || 0}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Pet Deposit</span>
            <p className="font-medium">$0</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Utilities Included</span>
            <p className="font-medium">No</p>
          </div>
        </div>
        
        {/* Rent History */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Rent History</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Current Rate</span>
              <p className="font-medium">${unit.monthlyRent}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Previous Rate</span>
              <p className="font-medium">$0</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Last Increase</span>
              <p className="font-medium">N/A</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant History Section */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Tenant History
        </h4>
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          <span>No tenant history available</span>
        </div>
      </div>

      {/* Maintenance History Section */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Maintenance History
        </h4>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wrench className="h-4 w-4" />
          <span>No maintenance history</span>
        </div>
      </div>

      {/* Documents & Files Section */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents & Files
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>No documents uploaded</span>
          </div>
          
          {/* Upload Document Button */}
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
              className="flex items-center gap-2 w-full sm:w-auto"
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
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <FileText className="h-4 w-4" />
              View All Documents
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Unit
          </Button>
          {!unit.tenant ? (
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Manage Tenant
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>
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
      className={`group relative bg-card rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg hover:shadow-black/5 ${
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
          className="absolute inset-0 bg-blue-50/50 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)'
          }}
        />
      )}

      {/* Refined Selection Checkbox - Professional UX */}
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 cursor-pointer group backdrop-blur-sm ${
            isSelected 
              ? 'bg-primary border-primary shadow-md shadow-primary/25 scale-105' 
              : 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:shadow-sm hover:scale-102'
          }`}
          aria-label={`Select ${property.name}`}
        >
          <div 
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-white border-white' 
                : 'bg-transparent border-gray-400 group-hover:border-primary'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected && (
              <CheckCircle2 className="w-3 h-3 text-primary" />
            )}
          </div>
        </button>
        
        {/* Selection Indicator */}
        {isSelected && (
          <motion.button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
            aria-label="Deselect"
          >
            <CheckCircle2 className="h-4 w-4 text-white" />
          </motion.button>
        )}
      </div>

      {/* Property Rating */}
      <div className="absolute top-3 right-3 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{getStarRating(property.propertyHealth || 0).stars}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Property Rating: {getStarRating(property.propertyHealth || 0).displayStars}</p>
            <p>Health Score: {property.propertyHealth || 0}/100</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Property Image */}
      <PropertyImage property={property} className="h-48 mb-4" onView={onView} />



      {/* Property Content */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 
            className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors cursor-pointer hover:underline"
            onClick={() => onView(property.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onView(property.id);
              }
            }}
          >
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
            <div className="text-lg font-semibold">{property.totalUnits || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Occupancy</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{(property.occupancyRate || 0).toFixed(1)}%</div>
              <div className={`w-2 h-2 rounded-full ${getOccupancyBadgeColor(property.occupancyRate || 0).includes('green') ? 'bg-green-500' : getOccupancyBadgeColor(property.occupancyRate || 0).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>

        {/* Income */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Monthly Net Income</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(property.netIncome || 0)}
          </div>
        </div>

        {/* Alerts */}
        <div className="flex gap-2 flex-wrap">
          {(property.urgentMaintenanceRequests || 0) > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {property.urgentMaintenanceRequests || 0}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{property.urgentMaintenanceRequests || 0} urgent maintenance requests</p>
              </TooltipContent>
            </Tooltip>
          )}
          {(property.leasesExpiringNext30Days || 0) > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                  <Calendar className="h-3 w-3 mr-1" />
                  {property.leasesExpiringNext30Days || 0}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{property.leasesExpiringNext30Days || 0} leases expiring soon</p>
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
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all duration-200 ${
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
          className="absolute inset-0 bg-blue-50/30 rounded-xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.03) 100%)'
          }}
        />
      )}

      <div className="grid grid-cols-12 gap-4 items-center relative z-10">
        {/* Refined Selection - Professional UX */}
        <div className="col-span-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect();
            }}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 cursor-pointer group backdrop-blur-sm ${
              isSelected 
                ? 'bg-primary border-primary shadow-md shadow-primary/25 scale-105' 
                : 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:shadow-sm hover:scale-102'
            }`}
            aria-label={`Select ${property.name}`}
          >
            <div 
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                isSelected 
                  ? 'bg-white border-white' 
                  : 'bg-transparent border-gray-400 group-hover:border-primary'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect();
              }}
            >
              {isSelected && (
                <CheckCircle2 className="w-3 h-3 text-primary" />
              )}
            </div>
          </button>
          
          {/* Selection Indicator */}
          {isSelected && (
            <motion.button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
              aria-label="Deselect"
            >
              <CheckCircle2 className="h-4 w-4 text-white" />
            </motion.button>
          )}
        </div>

        {/* Property Info */}
        <div className="col-span-3">
          <div className="flex items-center gap-3">
            <PropertyImage property={property} className="w-12 h-12 rounded-lg" onView={onView} />
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
            <div className="text-sm font-medium">{(property.occupancyRate || 0).toFixed(1)}%</div>
            <div className={`w-2 h-2 rounded-full ${getOccupancyBadgeColor(property.occupancyRate || 0).includes('green') ? 'bg-green-500' : getOccupancyBadgeColor(property.occupancyRate || 0).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`} />
          </div>
          <Progress value={property.occupancyRate || 0} className="w-full h-1" />
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
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      propertyType: undefined,
      ownershipType: undefined,
      tags: [],
      address: '',
      unitSuite: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      totalUnits: undefined,
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
    
    // Use dynamic schema for step 2 based on country
    let schema = currentStepConfig.schema;
    if (currentStep === 2) {
      const country = form.watch('country') || 'United States';
      schema = createStep2Schema(country);
    }
    
    const result = schema.safeParse(formValues);
    // show inline step warning panel if invalid
    return result.success;
  }, [currentStep, formValues, form.watch('country')]);

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
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allow navigation to previous steps or current step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!isCurrentStepValid || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Create property data (only fields supported by backend model)
      const propertyData = {
        name: data.name,
        propertyType: mapPropertyTypeToDb(data.propertyType),
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
        // Persist manager assignment using the correct field name if provided
        ...(data.propertyManager && data.propertyManager !== 'none'
          ? { propertyManagerId: data.propertyManager }
          : {}),
        rentDueDay: data.rentDueDay,
        allowOnlinePayments: data.allowOnlinePayments,
        enableMaintenanceRequests: data.enableMaintenanceRequests,
      } as const;

      // Create property
      const response = await propertiesApi.create(propertyData);
      const property = response.data; // Extract the property from the response

      // Upload images if any
      if (data.images && data.images.length > 0) {
        try {
          console.log('[DEBUG] Uploading', data.images.length, 'images for property:', property.id);
          await propertiesApi.uploadPropertyImages(property.id, data.images);
          console.log('[DEBUG] Image upload successful');
        } catch (uploadError) {
          console.error('[DEBUG] Image upload failed:', uploadError);
          // Don't fail the entire property creation if image upload fails
          toast.error('Property created but image upload failed. You can add images later.');
        }
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
                  // Navigate to properties page since units are accessed through properties
                  window.location.href = '/properties';
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                View Properties
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
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    form.reset();
    setImagePreviews([]);
    setCurrentStep(1);
    setIsDirty(false);
    onClose();
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
        <div className="border-b bg-card">
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
                        'bg-card border-gray-300 text-gray-400 cursor-not-allowed hover:scale-100'
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
                        step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
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

            {/* Step 5: Financial */}
            {currentStep === 5 && (
              <Step5Financial 
                form={form} 
                formErrors={formErrors} 
                formValues={formValues}
              />
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
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
        <div className="border-t bg-card p-6 flex-shrink-0 shadow-lg">
          {/* Validation Status - Full Width on Mobile */}
          {(!isCurrentStepValid || isCurrentStepValid) && !isLastStep && (
            <div className="mb-4">
              {!isCurrentStepValid && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">Complete required fields to continue</span>
                </div>
              )}
              
              {isCurrentStepValid && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">Step completed</span>
                </div>
              )}
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onClose={() => setShowUnsavedDialog(false)}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to close?"
        confirmText="Close Without Saving"
        cancelText="Continue Editing"
        variant="warning"
      />
    </Sheet>
  );
};

// ConfirmationDialog Component
interface ConfirmationDialogProps {
  dialog: ConfirmationDialog;
  onClose: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ dialog, onClose }) => {
  return (
    <Dialog open={dialog.isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              dialog.type === 'destructive' ? 'bg-red-100 dark:bg-red-900/20' :
              dialog.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
              'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              {dialog.type === 'destructive' && (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              {dialog.type === 'warning' && (
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
              {dialog.type === 'info' && (
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <DialogTitle className="text-lg font-semibold">{dialog.title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {dialog.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant={dialog.type === 'destructive' ? 'destructive' : 'default'}
            onClick={dialog.onConfirm}
            className="w-full sm:w-auto"
          >
            {dialog.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
          </Dialog>
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
        className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Monthly Income Analytics</h2>
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
              <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md hover:bg-background/90 transition-all duration-200 hover:scale-105">
                <X className="h-5 w-5 text-foreground/80 hover:text-foreground transition-colors" />
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
                            <h4 className="font-semibold text-foreground">{item.property.name}</h4>
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
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
            <Building className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Basic Information</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Let's start with the essential details about your property. This information helps us understand your property type and categorization.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Property Name <span className="text-red-600">*</span></label>
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
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Property Type <span className="text-red-600">*</span></label>
            <Select 
              value={formValues.propertyType || ''} 
              onValueChange={(value) => {
                console.log('Property type changed to:', value);
                form.setValue('propertyType', value as any);
              }}
            >
              <SelectTrigger className={`h-12 text-base transition-all duration-200 ${
                formErrors.propertyType 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
              }`}>
                <SelectValue placeholder="Select property type">
                  {formValues.propertyType || 'Select property type'}
                </SelectValue>
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
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.propertyType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Ownership Type <span className="text-red-600">*</span></label>
            <Select 
              value={formValues.ownershipType || ''} 
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
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.ownershipType.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Tags (Optional)</label>
          <div className="flex flex-wrap gap-2 mb-4">
                            {(formValues.tags || []).map((tag: string, index: number) => (
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
              {AVAILABLE_TAGS.filter(tag => !(formValues.tags || []).includes(tag)).map(tag => (
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
          <div className="p-4 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 rounded-full">
            <MapPin className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">2</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Location Details</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Specify the exact location of your property. Accurate address information is essential for legal documents and tenant communications.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Street Address <span className="text-red-600">*</span></label>
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
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {formErrors.address.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Unit/Suite Number (Optional)</label>
          <Input
            {...form.register('unitSuite')}
            placeholder="e.g., Suite 100, Building A"
            className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-all duration-200"
          />
          <p className="text-sm text-gray-500 mt-2">Add if your property has a specific unit or suite number</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">City <span className="text-red-600">*</span></label>
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
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.city.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              {form.watch('country') === 'Canada' ? 'Province/Territory' : 'State'} <span className="text-red-600">*</span>
            </label>
            <Select
              value={form.getValues('state') || ''}
              onValueChange={(value) => {
                form.setValue('state', value);
                form.trigger('state');
              }}
              key={`state-${form.getValues('state')}-${form.getValues('country')}`}
            >
              <SelectTrigger className={`h-12 text-base transition-all duration-200 ${
                formErrors.state
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
              }`}>
                <SelectValue>
                  {(() => {
                    const stateValue = form.getValues('state');
                    const country = form.watch('country');
                    if (!stateValue) return country === 'Canada' ? 'Select province/territory' : 'Select state';
                    
                    if (country === 'Canada') {
                      const provinceObj = CANADIAN_PROVINCES.find(s => s.value === stateValue);
                      return provinceObj ? provinceObj.label : stateValue;
                    } else {
                      const stateObj = US_STATES.find(s => s.value === stateValue);
                      return stateObj ? stateObj.label : stateValue;
                    }
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {(form.watch('country') === 'Canada' ? CANADIAN_PROVINCES : US_STATES).map(state => (
                  <SelectItem key={state.value} value={state.value} className="py-2">
                    <span className="font-medium">{state.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.state && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.state.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-foreground mb-3">
              {form.watch('country') === 'Canada' ? 'Postal Code' : 'ZIP Code'} <span className="text-red-600">*</span>
            </label>
            <Input
              {...form.register('zipCode')}
              placeholder={form.watch('country') === 'Canada' ? 'e.g., M5V 3A8' : 'e.g., 94105'}
              className={`h-12 text-base transition-all duration-200 ${
                formErrors.zipCode 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
              }`}
            />
            {formErrors.zipCode && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.zipCode.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Country</label>
          <Select
            value={form.getValues('country') || 'United States'}
            onValueChange={(value) => {
              form.setValue('country', value);
              // Clear state/province when country changes since they're not compatible
              form.setValue('state', '');
              form.trigger('country');
              form.trigger('state');
            }}
            key={`country-${form.getValues('country')}`}
          >
            <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-all duration-200">
              <SelectValue>
                {form.getValues('country') || 'United States'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {COUNTRIES.map(country => (
                <SelectItem key={country} value={country} className="py-2">
                  <span className="font-medium">{country}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-2">Select the country where your property is located</p>
        </div>
      </div>
    </div>
  );
};
// Step 3: Property Details Component
const Step3PropertyDetails: React.FC<Step1Props> = ({ form, formErrors, formValues }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full">
            <Settings className="h-16 w-16 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Property Details</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Tell us more about the physical characteristics of your property. These details help tenants understand what they're getting.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Units <span className="text-red-600">*</span></label>
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
              {...form.register('yearBuilt', { 
                setValueAs: (value) => {
                  // Handle empty string as undefined for optional field
                  if (value === '' || value === null || value === undefined) {
                    return undefined;
                  }
                  const num = Number(value);
                  return isNaN(num) ? undefined : num;
                }
              })}
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
              {...form.register('sqft', { 
                setValueAs: (value) => {
                  // Handle empty string as undefined for optional field
                  if (value === '' || value === null || value === undefined) {
                    return undefined;
                  }
                  const num = Number(value);
                  return isNaN(num) ? undefined : num;
                }
              })}
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
              {...form.register('lotSize', { 
                setValueAs: (value) => {
                  // Handle empty string as undefined for optional field
                  if (value === '' || value === null || value === undefined) {
                    return undefined;
                  }
                  const num = Number(value);
                  return isNaN(num) ? undefined : num;
                }
              })}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Neighborhood</label>
          <Input
            {...form.register('neighborhood')}
            placeholder="e.g., Downtown, Westside, Historic District"
            className={`transition-colors ${formErrors.neighborhood ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
          />
          {formErrors.neighborhood && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {formErrors.neighborhood.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">The neighborhood or area where the property is located</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => {
                    const currentAmenities = form.getValues('amenities') || [];
                    const isSelected = currentAmenities.includes(amenity);
                    if (isSelected) {
                      form.setValue('amenities', currentAmenities.filter(a => a !== amenity));
                    } else {
                      form.setValue('amenities', [...currentAmenities, amenity]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    (formValues.amenities || []).includes(amenity)
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Select all amenities available at this property</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Notes</label>
          <textarea
            {...form.register('notes')}
            placeholder="Add any additional notes, special instructions, or important information about this property..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {formErrors.notes && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {formErrors.notes.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">Internal notes for property management team</p>
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
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full">
            <Camera className="h-16 w-16 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">4</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Property Images</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Upload high-quality photos to showcase your property. Great photos attract better tenants.</p>
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
            
            <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">💡 Tips for great property photos:</p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
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

// Step 5: Financial Component
const Step5Financial: React.FC<Step1Props> = ({ form, formErrors, formValues }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 rounded-full">
            <DollarSign className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">5</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Financial Information</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Set up financial details and management settings for your property. This helps with reporting and tenant management.</p>
      </div>

      <div className="space-y-6">
        {/* Management Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Management Settings</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Manager</label>
              <Select
                value={formValues.propertyManager || ''}
                onValueChange={(value) => form.setValue('propertyManager', value)}
              >
                <SelectTrigger className={`transition-colors ${formErrors.propertyManager ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No manager assigned</SelectItem>
                  <SelectItem value="manager_1">John Smith</SelectItem>
                  <SelectItem value="manager_2">Sarah Johnson</SelectItem>
                  <SelectItem value="manager_3">Mike Davis</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.propertyManager && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.propertyManager.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Assign a property manager to handle day-to-day operations</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rent Due Day <span className="text-red-600">*</span></label>
              <Select
                value={formValues.rentDueDay?.toString() || '1'}
                onValueChange={(value) => form.setValue('rentDueDay', parseInt(value))}
              >
                <SelectTrigger className={`transition-colors ${formErrors.rentDueDay ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.rentDueDay && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.rentDueDay.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Day of the month when rent is due</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowOnlinePayments"
                checked={formValues.allowOnlinePayments}
                onCheckedChange={(checked) => form.setValue('allowOnlinePayments', checked as boolean)}
              />
              <label htmlFor="allowOnlinePayments" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow Online Payments <span className="text-red-600">*</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableMaintenanceRequests"
                checked={formValues.enableMaintenanceRequests}
                onCheckedChange={(checked) => form.setValue('enableMaintenanceRequests', checked as boolean)}
              />
              <label htmlFor="enableMaintenanceRequests" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Maintenance Requests <span className="text-red-600">*</span>
              </label>
            </div>
          </div>
        </div>

        {/* Financial Data */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Data</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Market Value</label>
              <Input
                type="number"
                {...form.register('marketValue', { 
                  setValueAs: (value) => {
                    // Handle empty string as undefined for optional field
                    if (value === '' || value === null || value === undefined) {
                      return undefined;
                    }
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                placeholder="e.g., 500000"
                min="0"
                className={`transition-colors ${formErrors.marketValue ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}
              />
              {formErrors.marketValue && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.marketValue.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Current estimated market value of the property</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase Price</label>
              <Input
                type="number"
                {...form.register('purchasePrice', { 
                  setValueAs: (value) => {
                    // Handle empty string as undefined for optional field
                    if (value === '' || value === null || value === undefined) {
                      return undefined;
                    }
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                placeholder="e.g., 450000"
                min="0"
                className={`transition-colors ${formErrors.purchasePrice ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}
              />
              {formErrors.purchasePrice && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.purchasePrice.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Original purchase price of the property</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase Date</label>
              <Input
                type="date"
                {...form.register('purchaseDate')}
                className={`transition-colors ${formErrors.purchaseDate ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}
              />
              {formErrors.purchaseDate && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.purchaseDate.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Date when the property was purchased</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Annual Expenses</label>
              <Input
                type="number"
                {...form.register('expenses', { 
                  setValueAs: (value) => {
                    // Handle empty string as undefined for optional field
                    if (value === '' || value === null || value === undefined) {
                      return undefined;
                    }
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                placeholder="e.g., 25000"
                min="0"
                className={`transition-colors ${formErrors.expenses ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}
              />
              {formErrors.expenses && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.expenses.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Estimated annual operating expenses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 6: Review Component
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
        <h2 className="text-xl font-semibold text-foreground mb-2">Review & Update</h2>
        <p className="text-sm text-gray-600">Please review all details before updating your property.</p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
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
              <span className="text-gray-600 dark:text-gray-400">Property Name:</span>
              <p className="font-medium">{formValues.name || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Property Type:</span>
              <p className="font-medium">{formValues.propertyType}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Ownership Type:</span>
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
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
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
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
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
          {formValues.neighborhood && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">Neighborhood:</span>
              <p className="text-sm text-gray-900 mt-1">{formValues.neighborhood}</p>
            </div>
          )}
          {formValues.amenities && formValues.amenities.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">Amenities:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formValues.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">{amenity}</Badge>
                ))}
              </div>
            </div>
          )}
          {formValues.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">Notes:</span>
              <p className="text-sm text-gray-900 mt-1">{formValues.notes}</p>
            </div>
          )}
        </div>

        {/* Financial Information */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Information
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(5)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Market Value:</span>
              <p className="font-medium">
                {formValues.marketValue ? `$${formValues.marketValue.toLocaleString()}` : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Purchase Price:</span>
              <p className="font-medium">
                {formValues.purchasePrice ? `$${formValues.purchasePrice.toLocaleString()}` : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Purchase Date:</span>
              <p className="font-medium">{formValues.purchaseDate || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Annual Expenses:</span>
              <p className="font-medium">
                {formValues.expenses ? `$${formValues.expenses.toLocaleString()}` : 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
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
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
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
  const [assignmentMode, setAssignmentMode] = useState<'individual' | 'bulk' | 'auto'>('individual');
  const [workloadThreshold, setWorkloadThreshold] = useState(10);
  
  // Enhanced manager interface with workload data
  interface EnhancedManager extends PropertyManager {
    currentProperties: number;
    workloadScore: number;
    performanceRating: number;
    avgResponseTime: number;
    satisfactionScore: number;
  }
  
  const [enhancedManagers, setEnhancedManagers] = useState<EnhancedManager[]>([]);
  
  // Fetch available managers with workload data
  useEffect(() => {
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);
  
  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      // Enhanced API call to fetch managers with workload data
      const response = await fetch('/api/managers?include=workload', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      setEnhancedManagers(data);
      setManagers(data);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      toast.error('Failed to load managers');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredManagers = enhancedManagers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Auto-assign based on workload balancing
  const handleAutoAssign = () => {
    const availableManagers = enhancedManagers.filter(m => m.currentProperties < workloadThreshold);
    if (availableManagers.length === 0) {
      toast.error('No managers available within workload threshold');
      return;
    }
    
    // Sort by workload score (ascending) and performance rating (descending)
    const sortedManagers = availableManagers.sort((a, b) => {
      if (a.workloadScore !== b.workloadScore) {
        return a.workloadScore - b.workloadScore;
      }
      return b.performanceRating - a.performanceRating;
    });
    
    const bestManager = sortedManagers[0];
    setSelectedManager(bestManager);
    toast.success(`Auto-assigned to ${bestManager.name} (Workload: ${bestManager.workloadScore}/10)`);
  };
  
  // Bulk assign with workload distribution
  const handleBulkAssign = () => {
    const availableManagers = enhancedManagers.filter(m => m.currentProperties < workloadThreshold);
    if (availableManagers.length === 0) {
      toast.error('No managers available within workload threshold');
      return;
    }
    
    // Distribute properties among available managers
    const sortedManagers = availableManagers.sort((a, b) => a.workloadScore - b.workloadScore);
    const propertiesPerManager = Math.ceil(selectedProperties.length / sortedManagers.length);
    
    let assignedCount = 0;
    sortedManagers.forEach((manager, index) => {
      const startIndex = index * propertiesPerManager;
      const endIndex = Math.min(startIndex + propertiesPerManager, selectedProperties.length);
      const managerProperties = selectedProperties.slice(startIndex, endIndex);
      
      if (managerProperties.length > 0) {
        onAssignManager(manager.id, managerProperties);
        assignedCount += managerProperties.length;
      }
    });
    
    toast.success(`Distributed ${assignedCount} properties among ${sortedManagers.length} managers`);
    onClose();
  };
  
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
      <SheetContent className="w-full sm:w-[700px] lg:w-[900px] xl:w-[1000px] 2xl:w-[1200px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="sticky top-0 bg-white z-10 pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
              <UserPlus className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold text-gray-900">Assign Manager</SheetTitle>
              <SheetDescription className="text-sm text-gray-600 mt-1">
                Assign a property manager to {selectedProperties.length} selected {selectedProperties.length === 1 ? 'property' : 'properties'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Assignment Mode Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Assignment Mode</h3>
              <div className="flex gap-2">
                <Button
                  variant={assignmentMode === 'individual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAssignmentMode('individual')}
                >
                  Individual
                </Button>
                <Button
                  variant={assignmentMode === 'bulk' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAssignmentMode('bulk')}
                >
                  Bulk Distribute
                </Button>
                <Button
                  variant={assignmentMode === 'auto' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAssignmentMode('auto')}
                >
                  Auto-Assign
                </Button>
              </div>
            </div>
            
            {/* Workload Threshold */}
            <div className="flex items-center gap-4">
              <Label htmlFor="workload-threshold" className="text-sm font-medium">
                Max Properties per Manager:
              </Label>
              <Input
                id="workload-threshold"
                type="number"
                value={workloadThreshold}
                onChange={(e) => setWorkloadThreshold(Number(e.target.value))}
                className="w-20"
                min="1"
                max="50"
              />
            </div>
          </div>

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
              filteredManagers.map((manager) => {
                const enhancedManager = manager as EnhancedManager;
                const isOverloaded = enhancedManager.currentProperties >= workloadThreshold;
                const workloadPercentage = (enhancedManager.currentProperties / workloadThreshold) * 100;
                
                return (
                <button
                  key={manager.id}
                  onClick={() => setSelectedManager(manager)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                    selectedManager?.id === manager.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                        : isOverloaded
                        ? 'border-red-200 bg-red-50'
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
                      <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{manager.name}</h4>
                        {isOverloaded && (
                          <Badge variant="destructive" className="text-xs">
                            Overloaded
                          </Badge>
                        )}
                      </div>
                    <p className="text-sm text-gray-500">{manager.email}</p>
                      
                      {/* Workload Information */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Properties: {enhancedManager.currentProperties}/{workloadThreshold}</span>
                          <span className="text-gray-600">Workload: {enhancedManager.workloadScore}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${
                              workloadPercentage > 100 ? 'bg-red-500' : 
                              workloadPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                          />
                        </div>
                        
                        {/* Performance Metrics */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>Performance: {enhancedManager.performanceRating}/5 ⭐</span>
                          <span>Response: {enhancedManager.avgResponseTime}h</span>
                          <span>Satisfaction: {enhancedManager.satisfactionScore}%</span>
                        </div>
                      </div>
                  </div>
                  {selectedManager?.id === manager.id && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  )}
                </button>
                );
              })
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {assignmentMode === 'auto' && (
              <Button 
                onClick={handleAutoAssign}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto-Assign Best Manager
              </Button>
            )}
            
            {assignmentMode === 'bulk' && (
              <Button 
                onClick={handleBulkAssign}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Distribute Among Managers
              </Button>
            )}
            
            {assignmentMode === 'individual' && (
            <Button 
              onClick={handleAssign}
              disabled={!selectedManager}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Manager
            </Button>
            )}
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
  onRefresh: () => void;
}
export const PropertyViewSheet: React.FC<PropertyViewSheetProps> = ({ 
  isOpen, 
  onClose, 
  property, 
  propertyViewData, 
  onEdit, 
  onArchive, 
  formatCurrency,
  onRefresh,
  onView
}) => {
  const { user } = useAuth();
  const [propertyImages, setPropertyImages] = useState<string[]>([]);

  // Sync local images state with incoming property
  useEffect(() => {
    setPropertyImages(property?.images || []);
  }, [property?.id, property?.images]);
  // State for inline unit expansion
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [unitDetails, setUnitDetails] = useState<Record<string, any>>({});
  const [loadingUnits, setLoadingUnits] = useState<Set<string>>(new Set());

  // State for smart filtering
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [unitStatusFilter, setUnitStatusFilter] = useState('all');
  const [unitOccupancyFilter, setUnitOccupancyFilter] = useState('all');
  const [unitBedroomsFilter, setUnitBedroomsFilter] = useState('all');
  const [unitBedroomsMin, setUnitBedroomsMin] = useState<number | ''>('');
  const [unitBedroomsMax, setUnitBedroomsMax] = useState<number | ''>('');
  const [unitFloorFilter, setUnitFloorFilter] = useState('all');
  const [unitSortBy, setUnitSortBy] = useState('unitNumber');

  // State for real units data
  const [units, setUnits] = useState<any[]>([]);
  const [loadingUnitsData, setLoadingUnitsData] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    showing: '0 of 0 units',
    hasMoreUnits: false
  });

  const [loadingStrategy, setLoadingStrategy] = useState<'progressive' | 'pagination'>('pagination');
  const [propertyInfo, setPropertyInfo] = useState({
    totalUnits: 0,
    useProgressiveLoading: false
  });

  // State for new unit details modal
  const [showUnitDetailsModal, setShowUnitDetailsModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<any>(null);
  const [isLoadingUnitDetails, setIsLoadingUnitDetails] = useState(false);

  // Load units data when property changes
  useEffect(() => {
    if (property?.id) {
      loadUnitsData();
    }
  }, [property?.id]);

  // Load units from API
  const loadUnitsData = async (page: number = 1, append: boolean = false) => {
    if (!property?.id) return;
    
    setLoadingUnitsData(true);
    try {
      const { unitsApi } = await import('@/lib/api');
      
                      // Apply current filters
                const filters = {
                  search: unitSearchQuery,
                  status: unitStatusFilter,
                  occupancy: unitOccupancyFilter,
                  bedrooms: unitBedroomsFilter,
                  bedroomsMin: unitBedroomsMin !== '' ? unitBedroomsMin : undefined,
                  bedroomsMax: unitBedroomsMax !== '' ? unitBedroomsMax : undefined,
                  floor: unitFloorFilter,
                  sortBy: unitSortBy,
                  sortOrder: 'asc' as const
                };

      const response = await unitsApi.getByProperty(property.id, page, 20, filters);
      
      // Update loading strategy and property info
      setLoadingStrategy(response.loadingStrategy || 'pagination');
      setPropertyInfo(response.propertyInfo || { totalUnits: 0, useProgressiveLoading: false });
      
      // Handle progressive loading (append units) vs pagination (replace units)
      if (append && response.loadingStrategy === 'progressive') {
        setUnits(prev => [...prev, ...(response.data || [])]);
      } else {
        setUnits(response.data || []);
      }
      
      setPagination(response.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        showing: '0 of 0 units',
        hasMoreUnits: false
      });
    } catch (error) {
      console.error('Failed to load units:', error);
      setUnits([]);
    } finally {
      setLoadingUnitsData(false);
    }
  };

  // Toggle unit expansion and load details
  const toggleUnitExpansion = async (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    
    if (newExpanded.has(unitId)) {
      // Collapse unit
      newExpanded.delete(unitId);
    } else {
      // Expand unit and load details if not already loaded
      newExpanded.add(unitId);
      if (!unitDetails[unitId]) {
        setLoadingUnits(prev => new Set(prev).add(unitId));
        try {
          const details = await loadUnitDetails(unitId);
          setUnitDetails(prev => ({ ...prev, [unitId]: details }));
        } catch (error) {
          console.error('Failed to load unit details:', error);
        } finally {
          setLoadingUnits(prev => {
            const newSet = new Set(prev);
            newSet.delete(unitId);
            return newSet;
          });
        }
      }
    }
    
    setExpandedUnits(newExpanded);
  };

  // Load multiple unit details in bulk (for better performance)
  const loadBulkUnitDetails = async (unitIds: string[]) => {
    if (unitIds.length === 0) return;
    
    const missingUnitIds = unitIds.filter(id => !unitDetails[id]);
    if (missingUnitIds.length === 0) return;

    setLoadingUnits(prev => new Set([...prev, ...missingUnitIds]));
    
    try {
      const { unitsApi } = await import('@/lib/api');
      const response = await unitsApi.getBulkDetails(missingUnitIds);
      setUnitDetails(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Failed to load bulk unit details:', error);
    } finally {
      setLoadingUnits(prev => {
        const newSet = new Set(prev);
        missingUnitIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };

  // Load unit details from API
  const loadUnitDetails = async (unitId: string): Promise<any> => {
    try {
      const { unitsApi } = await import('@/lib/api');
      const response = await unitsApi.getDetails(unitId);
      return response.data;
    } catch (error) {
      console.error('Failed to load unit details:', error);
      throw error;
    }
  };

  // Unit details modal handlers
  const handleOpenUnitDetails = (apiUnit: any) => {
    const transformedUnit = {
      id: apiUnit.id,
      number: apiUnit.unitNumber,
      bedrooms: apiUnit.bedrooms,
      bathrooms: apiUnit.bathrooms,
      squareFootage: apiUnit.squareFootage,
      floor: Math.floor(parseInt(apiUnit.unitNumber) / 100),
      building: 'Main',
      amenities: apiUnit.amenities || ['AC', 'W/D'],
      monthlyRent: parseFloat(apiUnit.monthlyRent?.toString?.() ?? `${apiUnit.monthlyRent ?? 0}`),
      securityDeposit: parseFloat(apiUnit.monthlyRent?.toString?.() ?? `${apiUnit.monthlyRent ?? 0}`),
      status: (apiUnit.status?.toLowerCase?.() ?? 'vacant') as 'occupied' | 'vacant' | 'maintenance' | 'reserved',
      tenant: apiUnit.tenant
        ? {
            id: apiUnit.tenant.id,
            name: `${apiUnit.tenant.firstName} ${apiUnit.tenant.lastName}`,
            email: apiUnit.tenant.email,
            phone: apiUnit.tenant.phoneNumber || '',
            moveInDate: apiUnit.createdAt?.split?.('T')?.[0]
          }
        : undefined
    };
    setSelectedUnit(transformedUnit);
    setShowUnitDetailsModal(true);
  };

  const handleCloseUnitDetails = () => {
    setShowUnitDetailsModal(false);
    setSelectedUnit(null);
  };

  if (!property) return null;
  
  return (
    <>
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[45%] md:w-[40%] flex flex-col h-full p-0 gap-0">
        {/* Header with Property Identity */}
        <div className="border-b bg-card">
          {/* Header */}
          <SheetHeader className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center">
                  <Eye className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {property.name}
                  <Badge variant="outline" className="text-xs font-medium">
                    {mapPropertyType(property.propertyType)}
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Quick Stats Bar */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {property.totalUnits || 0}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">Total Units</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                <div className="text-lg font-bold text-green-700 dark:text-green-400">
                  {property.occupiedUnits || 0}
                </div>
                <div className="text-xs text-green-600 dark:text-green-300 font-medium">Occupied</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
                <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  {formatCurrency(property.monthlyRent || 0)}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-medium">Monthly Rent</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">

            {/* Primary Action - Edit Property */}
            <div className="flex justify-center mb-4">
              <Button 
                onClick={() => onEdit(property.id)}
                className="flex items-center gap-3 px-8 py-4 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Edit className="h-5 w-5" />
                Edit Property
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onArchive(property.id)}
                className="h-12 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-300"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 hover:text-green-700 dark:hover:text-green-300"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>

          {/* Property Images - Enhanced UX */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Images</h3>
            
            {/* Property Image Gallery - Display existing images */}
            {(() => {
              const allowedRoles = new Set([
                'SUPER_ADMIN',
                'ADMIN',
                'MANAGER',
                'PROPERTY_MANAGER',
                'ASSISTANT_MANAGER',
                'REGIONAL_MANAGER',
                'SENIOR_MANAGER',
              ] as const);
              const isOwner = user && property?.ownerId && user.id === property.ownerId;
              const isPropertyManager = user && (property as any)?.propertyManagerId && user.id === (property as any).propertyManagerId;
              const hasRole = user && allowedRoles.has(user.role as any);
              const canManageImages = Boolean(isOwner || isPropertyManager || hasRole);

              return (
                <PropertyImageGallery
                  propertyId={property.id}
                  images={propertyImages}
                  onImagesChange={async (newImages) => {
                    setPropertyImages(newImages);
                    // Persist order/state
                    try {
                      await propertiesApi.update(property.id, { images: newImages });
                    } catch (e) {
                      // non-blocking
                    }
                  }}
                  onCoverChange={async (newCoverImage) => {
                    // Refresh the properties listing to update the card thumbnail
                    onRefresh();
                  }}
                  canDelete={canManageImages}
                  className="mb-6"
                />
              );
            })()}
            
            {/* Property Image Upload - Add new images (RBAC) */}
            {(() => {
              const allowedRoles = new Set([
                'SUPER_ADMIN',
                'ADMIN',
                'MANAGER',
                'PROPERTY_MANAGER',
                'ASSISTANT_MANAGER',
                'REGIONAL_MANAGER',
                'SENIOR_MANAGER',
              ] as const);
              const isOwner = user && property?.ownerId && user.id === property.ownerId;
              const isPropertyManager = user && (property as any)?.propertyManagerId && user.id === (property as any).propertyManagerId;
              const hasRole = user && allowedRoles.has(user.role as any);
              const canManageImages = Boolean(isOwner || isPropertyManager || hasRole);

              return (
                canManageImages ? (
                  <PropertyImageUpload
                    propertyId={property.id}
                    currentImages={propertyImages}
                    onImagesChange={async (newImages) => {
                      setPropertyImages(newImages);
                      try {
                        await propertiesApi.update(property.id, { images: newImages });
                      } catch (e) {
                        // non-blocking
                      }
                    }}
                  />
                ) : null
              );
            })()}
          </div>
          
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
                <div className="text-2xl font-bold">{(property.occupancyRate || 0).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">
                  {(property.occupancyRate || 0) >= 90 ? 'Excellent' : (property.occupancyRate || 0) >= 80 ? 'Good' : 'Needs Attention'}
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
                  <div className="flex items-center gap-1">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    <Zap className="h-4 w-4 text-orange-500" />
                  </div>
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
          {/* Units Section with Smart Filtering & Virtual Scrolling */}
          <Card>
            <CardContent className="p-4">
              {/* Units Header with Smart Overview */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Units (12)</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Unit
                  </Button>
                </div>
              </div>

              {/* Smart Unit Stats */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-700 dark:text-blue-400">
                      {(() => {
                        const mockUnits = [
                          { status: 'occupied' }, { status: 'occupied' }, { status: 'occupied' },
                          { status: 'vacant' }, { status: 'maintenance' }, { status: 'reserved' },
                          { status: 'occupied' }, { status: 'vacant' }, { status: 'occupied' },
                          { status: 'vacant' }, { status: 'maintenance' }, { status: 'reserved' }
                        ];
                        return mockUnits.filter(unit => unit.status === 'occupied').length;
                      })()}
                    </div>
                    <div className="text-blue-600 dark:text-blue-300">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-700 dark:text-green-400">
                      {(() => {
                        const mockUnits = [
                          { status: 'occupied' }, { status: 'occupied' }, { status: 'occupied' },
                          { status: 'vacant' }, { status: 'maintenance' }, { status: 'reserved' },
                          { status: 'occupied' }, { status: 'vacant' }, { status: 'occupied' },
                          { status: 'vacant' }, { status: 'maintenance' }, { status: 'reserved' }
                        ];
                        return mockUnits.filter(unit => unit.status === 'vacant').length;
                      })()}
                    </div>
                    <div className="text-green-600 dark:text-green-300">Vacant</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-700 dark:text-purple-400">
                      {formatCurrency(property.monthlyRent || 0)}
                    </div>
                    <div className="text-purple-600 dark:text-purple-300">Monthly Rent</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-700 dark:text-orange-400">
                      {(() => {
                        const mockUnits = [
                          { status: 'occupied' }, { status: 'occupied' }, { status: 'occupied' },
                          { status: 'vacant' }, { status: 'maintenance' }, { status: 'reserved' },
                          { status: 'occupied' }, { status: 'vacant' }, { status: 'occupied' },
                          { status: 'vacant' }, { status: 'maintenance' }, { status: 'reserved' }
                        ];
                        const occupied = mockUnits.filter(unit => unit.status === 'occupied').length;
                        const total = mockUnits.length;
                        return ((occupied / total) * 100).toFixed(1);
                      })()}%
                    </div>
                    <div className="text-orange-600 dark:text-orange-300">Occupancy</div>
                  </div>
                </div>
              </div>

              {/* Smart Filtering Controls */}
              <div className="mb-4 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search units by number, tenant, or status..."
                    className="pl-10"
                    value={unitSearchQuery}
                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                  />
                </div>

                {/* Professional Filter Controls */}
                <div className="space-y-4">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Filter Units</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                                        onClick={() => {
                    setUnitSearchQuery('');
                    setUnitStatusFilter('all');
                    setUnitOccupancyFilter('all');
                    setUnitBedroomsFilter('all');
                    setUnitBedroomsMin('');
                    setUnitBedroomsMax('');
                    setUnitFloorFilter('all');
                    setUnitSortBy('unitNumber');
                  }}
                      className="h-8 px-3 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Clear All
                    </Button>
                  </div>

                  {/* Mobile-Responsive Filter Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {/* Unit Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        Unit Status
                      </label>
                      <Select value={unitStatusFilter} onValueChange={setUnitStatusFilter}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                          <SelectItem value="occupied" className="text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Occupied
                            </div>
                          </SelectItem>
                          <SelectItem value="vacant" className="text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              Vacant
                            </div>
                          </SelectItem>
                          <SelectItem value="maintenance" className="text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                              Maintenance
                            </div>
                          </SelectItem>
                          <SelectItem value="reserved" className="text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              Reserved
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Occupancy Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Home className="h-3 w-3" />
                        Occupancy
                      </label>
                      <Select value={unitOccupancyFilter} onValueChange={setUnitOccupancyFilter}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Filter by occupancy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">All Units</SelectItem>
                          <SelectItem value="occupied" className="text-xs">Currently Rented</SelectItem>
                          <SelectItem value="vacant" className="text-xs">Available for Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bedrooms Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Bed className="h-3 w-3" />
                        Bedrooms
                      </label>
                      <Select value={unitBedroomsFilter} onValueChange={setUnitBedroomsFilter}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Filter by bedrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">All Sizes</SelectItem>
                          <SelectItem value="0" className="text-xs">Studio</SelectItem>
                          <SelectItem value="1" className="text-xs">1 Bedroom</SelectItem>
                          <SelectItem value="2" className="text-xs">2 Bedrooms</SelectItem>
                          <SelectItem value="3" className="text-xs">3 Bedrooms</SelectItem>
                          <SelectItem value="4" className="text-xs">4+ Bedrooms</SelectItem>
                          <SelectItem value="custom" className="text-xs">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Custom Bedroom Range */}
                      {unitBedroomsFilter === 'custom' && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Min</label>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              placeholder="0"
                              value={unitBedroomsMin}
                              onChange={(e) => setUnitBedroomsMin(e.target.value === '' ? '' : parseInt(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Max</label>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              placeholder="10"
                              value={unitBedroomsMax}
                              onChange={(e) => setUnitBedroomsMax(e.target.value === '' ? '' : parseInt(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Floor Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Building className="h-3 w-3" />
                        Floor
                      </label>
                      <Select value={unitFloorFilter} onValueChange={setUnitFloorFilter}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Filter by floor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">All Floors</SelectItem>
                          <SelectItem value="0" className="text-xs">Ground Floor</SelectItem>
                          <SelectItem value="1" className="text-xs">1st Floor</SelectItem>
                          <SelectItem value="2" className="text-xs">2nd Floor</SelectItem>
                          <SelectItem value="3" className="text-xs">3rd Floor</SelectItem>
                          <SelectItem value="4" className="text-xs">4th Floor</SelectItem>
                          <SelectItem value="5" className="text-xs">5th Floor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Filter className="h-3 w-3" />
                        Sort By
                      </label>
                      <Select value={unitSortBy} onValueChange={setUnitSortBy}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Sort units by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unitNumber" className="text-xs">Unit Number</SelectItem>
                          <SelectItem value="rent" className="text-xs">Monthly Rent</SelectItem>
                          <SelectItem value="status" className="text-xs">Status</SelectItem>
                          <SelectItem value="tenant" className="text-xs">Tenant Name</SelectItem>
                          <SelectItem value="bedrooms" className="text-xs">Bedrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {(unitSearchQuery || unitStatusFilter !== 'all' || unitOccupancyFilter !== 'all' || unitBedroomsFilter !== 'all' || unitFloorFilter !== 'all' || (unitBedroomsFilter === 'custom' && (unitBedroomsMin !== '' || unitBedroomsMax !== ''))) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Filter className="h-3 w-3" />
                      <span>Active filters:</span>
                      <div className="flex flex-wrap gap-1">
                        {unitSearchQuery && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Search: "{unitSearchQuery}"
                          </Badge>
                        )}
                        {unitStatusFilter !== 'all' && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Status: {unitStatusFilter}
                          </Badge>
                        )}
                        {unitOccupancyFilter !== 'all' && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Occupancy: {unitOccupancyFilter}
                          </Badge>
                        )}
                        {unitBedroomsFilter !== 'all' && unitBedroomsFilter !== 'custom' && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {unitBedroomsFilter === '0' ? 'Studio' : `${unitBedroomsFilter}BR`}
                          </Badge>
                        )}
                        {unitBedroomsFilter === 'custom' && (unitBedroomsMin !== '' || unitBedroomsMax !== '') && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {unitBedroomsMin !== '' && unitBedroomsMax !== '' 
                              ? `${unitBedroomsMin}-${unitBedroomsMax} BR`
                              : unitBedroomsMin !== '' 
                                ? `${unitBedroomsMin}+ BR`
                                : `${unitBedroomsMax}- BR`
                            }
                          </Badge>
                        )}
                        {unitFloorFilter !== 'all' && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Floor {unitFloorFilter}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Real Units Data with Smart Filtering */}
              {(() => {
                if (loadingUnitsData) {
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                      <UnitsListSkeleton count={5} />
                    </div>
                  );
                }

                if (units.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                        <div className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-6">
                          <Home className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        No units found
                      </h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        This property doesn't have any units yet. Add your first unit to start managing this property.
                      </p>
                      <Button 
                        onClick={() => {
                          // TODO: Implement add unit functionality
                          console.log('Add first unit clicked');
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 dark:from-blue-400 dark:to-purple-400 dark:hover:from-blue-500 dark:hover:to-purple-500 dark:text-white"
                        size="lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Your First Unit
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Start building your property portfolio
                      </p>
                    </div>
                  );
                }

                // Smart filtering logic
                let filteredUnits = units;

                // Search filter
                if (unitSearchQuery) {
                  const query = unitSearchQuery.toLowerCase();
                  filteredUnits = filteredUnits.filter(unit => 
                    unit.unitNumber.toLowerCase().includes(query) ||
                    (unit.tenant && `${unit.tenant.firstName} ${unit.tenant.lastName}`.toLowerCase().includes(query)) ||
                    unit.status.toLowerCase().includes(query) ||
                    unit.monthlyRent.toString().includes(query)
                  );
                }

                                // Status filter
                if (unitStatusFilter !== 'all') {
                  filteredUnits = filteredUnits.filter(unit =>
                    unit.status.toLowerCase() === unitStatusFilter
                  );
                }

                // Occupancy filter
                if (unitOccupancyFilter !== 'all') {
                  filteredUnits = filteredUnits.filter(unit => {
                    if (unitOccupancyFilter === 'occupied') {
                      return unit.tenant !== null;
                    } else if (unitOccupancyFilter === 'vacant') {
                      return unit.tenant === null;
                    }
                    return true;
                  });
                }

                // Bedrooms filter
                if (unitBedroomsFilter !== 'all') {
                  filteredUnits = filteredUnits.filter(unit => {
                    const bedrooms = unit.bedrooms || 0;
                    
                    if (unitBedroomsFilter === 'custom') {
                      // Custom range filtering
                      const min = unitBedroomsMin !== '' ? unitBedroomsMin : 0;
                      const max = unitBedroomsMax !== '' ? unitBedroomsMax : Infinity;
                      
                      if (unitBedroomsMin !== '' && unitBedroomsMax !== '') {
                        // Both min and max specified
                        return bedrooms >= min && bedrooms <= max;
                      } else if (unitBedroomsMin !== '') {
                        // Only min specified
                        return bedrooms >= min;
                      } else if (unitBedroomsMax !== '') {
                        // Only max specified
                        return bedrooms <= max;
                      }
                      return true;
                    } else if (unitBedroomsFilter === '4') {
                      return bedrooms >= 4;
                    }
                    return bedrooms === parseInt(unitBedroomsFilter);
                  });
                }

                // Floor filter
                if (unitFloorFilter !== 'all') {
                  filteredUnits = filteredUnits.filter(unit => {
                    const floor = unit.floor || 0;
                    return floor === parseInt(unitFloorFilter);
                  });
                }

                // Sort units
                filteredUnits.sort((a, b) => {
                  switch (unitSortBy) {
                    case 'unitNumber':
                      // Sort unit numbers numerically instead of lexicographically
                      const aNum = parseInt(a.unitNumber) || 0;
                      const bNum = parseInt(b.unitNumber) || 0;
                      return aNum - bNum;
                    case 'rent':
                      return parseFloat(b.monthlyRent.toString()) - parseFloat(a.monthlyRent.toString());
                    case 'status':
                      return a.status.localeCompare(b.status);
                    case 'tenant':
                      const aName = a.tenant ? `${a.tenant.firstName} ${a.tenant.lastName}` : '';
                      const bName = b.tenant ? `${b.tenant.firstName} ${b.tenant.lastName}` : '';
                      return aName.localeCompare(bName);
                    case 'bedrooms':
                      return b.bedrooms - a.bedrooms;
                    default:
                      return 0;
                  }
                });

                return (
                  <>
                    {/* Filter Results Counter */}
                    {filteredUnits.length !== units.length && (
                      <div className="text-sm text-muted-foreground mb-4">
                        Showing {filteredUnits.length} of {units.length} units
                                        {unitSearchQuery && ` matching "${unitSearchQuery}"`}
                {unitStatusFilter !== 'all' && ` with status "${unitStatusFilter}"`}
                {unitOccupancyFilter !== 'all' && ` ${unitOccupancyFilter}`}
                {unitBedroomsFilter !== 'all' && unitBedroomsFilter !== 'custom' && ` ${unitBedroomsFilter === '0' ? 'Studio' : `${unitBedroomsFilter}BR`}`}
                {unitBedroomsFilter === 'custom' && (unitBedroomsMin !== '' || unitBedroomsMax !== '') && ` ${unitBedroomsMin !== '' && unitBedroomsMax !== '' ? `${unitBedroomsMin}-${unitBedroomsMax} BR` : unitBedroomsMin !== '' ? `${unitBedroomsMin}+ BR` : `${unitBedroomsMax}- BR`}`}
                {unitFloorFilter !== 'all' && ` Floor ${unitFloorFilter}`}
                      </div>
                    )}

                    {/* Smart Loading Info */}
                    <div className="text-sm text-muted-foreground mb-4">
                      {loadingStrategy === 'progressive' ? (
                        <>
                          {units.length} of {propertyInfo.totalUnits} units loaded
                          {propertyInfo.totalUnits > units.length && ` • ${propertyInfo.totalUnits - units.length} more available`}
                        </>
                      ) : (
                        <>
                          {pagination.showing} • Page {pagination.page} of {pagination.totalPages}
                        </>
                      )}
                    </div>

                    <div className="space-y-3">
                      {filteredUnits.length > 0 ? (
                        filteredUnits.map(unit => (
                          <UnitCard
                            key={unit.id}
                            unit={{
                              id: unit.id,
                              number: unit.unitNumber,
                              bedrooms: unit.bedrooms,
                              bathrooms: unit.bathrooms,
                              squareFootage: unit.squareFootage,
                              floor: Math.floor(parseInt(unit.unitNumber) / 100), // Calculate floor from unit number
                              building: 'Main',
                              amenities: unit.amenities || ['AC', 'W/D'],
                              monthlyRent: parseFloat(unit.monthlyRent.toString()),
                              securityDeposit: parseFloat(unit.monthlyRent.toString()), // Using monthly rent as security deposit for now
                              status: unit.status.toLowerCase() as 'occupied' | 'vacant' | 'maintenance' | 'reserved',
                              tenant: unit.tenant ? {
                                id: unit.tenant.id,
                                name: `${unit.tenant.firstName} ${unit.tenant.lastName}`,
                                email: unit.tenant.email,
                                phone: unit.tenant.phoneNumber || '',
                                moveInDate: unit.createdAt.split('T')[0] // Using creation date as move-in date
                              } : undefined
                            }}
                            onViewDetails={() => handleOpenUnitDetails(unit)}
                            onEdit={() => {
                              // TODO: Implement unit edit
                              console.log('Edit unit:', unit.id);
                            }}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            No units found
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {unitSearchQuery 
                              ? `No units match "${unitSearchQuery}"`
                              : unitStatusFilter !== 'all'
                              ? `No units with status "${unitStatusFilter}"`
                              : unitOccupancyFilter !== 'all'
                              ? `No ${unitOccupancyFilter} units`
                              : unitBedroomsFilter !== 'all'
                              ? `No ${unitBedroomsFilter === '0' ? 'Studio' : `${unitBedroomsFilter}BR`} units`
                              : unitFloorFilter !== 'all'
                              ? `No units on Floor ${unitFloorFilter}`
                              : 'No units available'
                            }
                          </p>
                          {(unitSearchQuery || unitStatusFilter !== 'all' || unitOccupancyFilter !== 'all' || unitBedroomsFilter !== 'all' || unitFloorFilter !== 'all') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => {
                                setUnitSearchQuery('');
                                setUnitStatusFilter('all');
                                setUnitOccupancyFilter('all');
                                setUnitBedroomsFilter('all');
                                setUnitFloorFilter('all');
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Smart Loading Controls */}
                      {loadingStrategy === 'progressive' && pagination.hasMoreUnits && (
                        <div className="flex items-center justify-center mt-6 pt-4 border-t">
                          {loadingUnitsData ? (
                            <LoadMoreSkeleton />
                          ) : (
                            <Button
                              onClick={() => loadUnitsData(pagination.page + 1, true)}
                              variant="outline"
                              size="lg"
                              className="w-full max-w-md"
                            >
                              <Loader className="h-4 w-4 mr-2" />
                              Load More Units ({units.length} of {propertyInfo.totalUnits} loaded)
                            </Button>
                          )}
                        </div>
                      )}

                      {loadingStrategy === 'pagination' && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                          {loadingUnitsData ? (
                            <PaginationSkeleton />
                          ) : (
                            <>
                              <div className="text-sm text-muted-foreground">
                                {pagination.showing}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadUnitsData(pagination.page - 1)}
                                  disabled={!pagination.hasPrevPage}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  Previous
                                </Button>
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                      <Button
                                        key={pageNum}
                                        variant={pagination.page === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => loadUnitsData(pageNum)}
                                        className="w-8 h-8"
                                      >
                                        {pageNum}
                                      </Button>
                                    );
                                  })}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadUnitsData(pagination.page + 1)}
                                  disabled={!pagination.hasNextPage}
                                >
                                  Next
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Unit Details Drawer */}
    <EnhancedUnitDetailsSheet
      isOpen={showUnitDetailsModal}
      onClose={handleCloseUnitDetails}
      unit={selectedUnit}
      onUpdate={() => loadUnitsData(pagination.page)}
    />
    </>
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
                <div key={status} className="flex items-center space-x-2">
                  <ProCheckbox
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => toggleArrayValue('status', status)}
                    size="sm"
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">{status}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Property Type</label>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <ProCheckbox
                    id={`property-type-${type}`}
                    checked={filters.propertyType.includes(type)}
                    onCheckedChange={() => toggleArrayValue('propertyType', type)}
                    size="sm"
                  />
                  <Label htmlFor={`property-type-${type}`} className="text-sm cursor-pointer">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Manager */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Assigned Manager</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ProCheckbox
                  id="manager-unassigned"
                  checked={filters.manager.includes('unassigned')}
                  onCheckedChange={() => toggleArrayValue('manager', 'unassigned')}
                  size="sm"
                />
                <Label htmlFor="manager-unassigned" className="text-sm cursor-pointer">Unassigned</Label>
              </div>
              {managers.map((manager) => (
                <div key={manager.id} className="flex items-center space-x-2">
                  <ProCheckbox
                    id={`manager-${manager.id}`}
                    checked={filters.manager.includes(manager.id)}
                    onCheckedChange={() => toggleArrayValue('manager', manager.id)}
                    size="sm"
                  />
                  <Label htmlFor={`manager-${manager.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={manager.avatar} />
                      <AvatarFallback className="text-xs">
                        {manager.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{manager.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Occupancy Rate</label>
            <RadioGroup 
              value={`${filters.occupancyRange[0]}-${filters.occupancyRange[1]}`}
              onValueChange={(value) => {
                if (value === "0-100") {
                  updateFilter('occupancyRange', [0, 100]);
                } else {
                  const range = occupancyRanges.find(r => `${r.min}-${r.max}` === value);
                  if (range) updateFilter('occupancyRange', [range.min, range.max]);
                }
              }}
              className="space-y-2"
            >
              {occupancyRanges.map((range) => (
                <div key={range.label} className="flex items-center space-x-2">
                  <RadioGroupItem value={`${range.min}-${range.max}`} id={`occupancy-${range.label}`} />
                  <Label htmlFor={`occupancy-${range.label}`} className="text-sm cursor-pointer">{range.label}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0-100" id="occupancy-all" />
                <Label htmlFor="occupancy-all" className="text-sm cursor-pointer">All</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Location</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Cities</label>
                <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                  {cities.map((city) => (
                    <div key={city} className="flex items-center space-x-2">
                      <ProCheckbox
                        id={`city-${city}`}
                        checked={filters.city.includes(city)}
                        onCheckedChange={() => toggleArrayValue('city', city)}
                        size="sm"
                      />
                      <Label htmlFor={`city-${city}`} className="text-sm cursor-pointer">{city}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">States</label>
                <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                  {states.map((state) => (
                    <div key={state} className="flex items-center space-x-2">
                      <ProCheckbox
                        id={`state-${state}`}
                        checked={filters.state.includes(state)}
                        onCheckedChange={() => toggleArrayValue('state', state)}
                        size="sm"
                      />
                      <Label htmlFor={`state-${state}`} className="text-sm cursor-pointer">{state}</Label>
                    </div>
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
                <div key={type} className="flex items-center space-x-2">
                  <ProCheckbox
                    id={`ownership-${type}`}
                    checked={filters.ownershipType.includes(type)}
                    onCheckedChange={() => toggleArrayValue('ownershipType', type)}
                    size="sm"
                  />
                  <Label htmlFor={`ownership-${type}`} className="text-sm cursor-pointer">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Include Archived */}
          <div className="flex items-center justify-between">
            <Label htmlFor="include-archived" className="text-sm font-medium cursor-pointer">Include Archived Properties</Label>
            <ProCheckbox
              id="include-archived"
              checked={filters.includeArchived}
              onCheckedChange={(checked) => updateFilter('includeArchived', !!checked)}
              size="sm"
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [managers, setManagers] = useState<PropertyManager[]>([]);
  const [savedFormData, setSavedFormData] = useState<PropertyFormData | null>(null);

  // Enhanced form with React Hook Form and Zod validation
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      propertyType: undefined,
      ownershipType: undefined,
      tags: [],
      address: '',
      unitSuite: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      totalUnits: undefined,
      yearBuilt: undefined,
      sqft: undefined,
      lotSize: undefined,
      description: '',
      propertyManager: '',
      rentDueDay: 1,
      allowOnlinePayments: true,
      enableMaintenanceRequests: true,
      images: [],
      amenities: [],
      neighborhood: '',
      marketValue: undefined,
      purchasePrice: undefined,
      purchaseDate: '',
      expenses: undefined,
      notes: '',
    },
  });

  const formValues = form.watch();
  const formErrors = form.formState.errors;

  // Check if current step is valid - only require mandatory fields for Next Step
  const isCurrentStepValid = useMemo(() => {
    const currentStepConfig = WIZARD_STEPS.find(step => step.id === currentStep);
    if (!currentStepConfig) return false;

    try {
      // For Next Step button, we only need to validate required fields
      // Optional fields can be empty without blocking progression
      
      if (currentStep === 1) {
        // Step 1: Basic Info - All fields required
        const requiredFields = ['name', 'propertyType', 'ownershipType'];
        return requiredFields.every(field => {
          const value = formValues[field as keyof typeof formValues];
          return value !== undefined && value !== null && value !== '';
        });
      }
      
      if (currentStep === 2) {
        // Step 2: Location - Address, City, State, ZIP required
        const country = form.watch('country') || 'United States';
        const requiredFields = ['address', 'city', 'state', 'zipCode'];
        return requiredFields.every(field => {
          const value = formValues[field as keyof typeof formValues];
          return value !== undefined && value !== null && value !== '';
        });
      }
      
      if (currentStep === 3) {
        // Step 3: Property Details - Only Total Units required
        const requiredFields = ['totalUnits'];
        return requiredFields.every(field => {
          const value = formValues[field as keyof typeof formValues];
          if (field === 'totalUnits') {
            return typeof value === 'number' && value >= 1 && value <= 10000;
          }
          return true; // Other fields are optional
        });
      }
      
      if (currentStep === 4) {
        // Step 4: Media - No required fields
        return true;
      }
      
      if (currentStep === 5) {
        // Step 5: Financial - Rent Due Day, Allow Online Payments, Enable Maintenance Requests required
        const requiredFields = ['rentDueDay', 'allowOnlinePayments', 'enableMaintenanceRequests'];
        return requiredFields.every(field => {
          const value = formValues[field as keyof typeof formValues];
          if (field === 'rentDueDay') {
            return typeof value === 'number' && value >= 1 && value <= 28;
          }
          if (field === 'allowOnlinePayments' || field === 'enableMaintenanceRequests') {
            return typeof value === 'boolean';
          }
          return true;
        });
      }
      
      if (currentStep === 6) {
        // Step 6: Review - Check if all required fields from previous steps are completed
        // This ensures the Update Property button is only enabled when all required data is present
        
        // Step 1 required fields
        const step1Fields = ['name', 'propertyType', 'ownershipType'];
        const step1Valid = step1Fields.every(field => {
          const value = formValues[field as keyof typeof formValues];
          return value !== undefined && value !== null && value !== '';
        });
        
        // Step 2 required fields
        const step2Fields = ['address', 'city', 'state', 'zipCode'];
        const step2Valid = step2Fields.every(field => {
          const value = formValues[field as keyof typeof formValues];
          return value !== undefined && value !== null && value !== '';
        });
        
        // Step 3 required fields
        const step3Valid = (() => {
          const totalUnits = formValues.totalUnits;
          return typeof totalUnits === 'number' && totalUnits >= 1 && totalUnits <= 10000;
        })();
        
        // Step 5 required fields
        const step5Valid = (() => {
          const rentDueDay = formValues.rentDueDay;
          const allowOnlinePayments = formValues.allowOnlinePayments;
          const enableMaintenanceRequests = formValues.enableMaintenanceRequests;
          
          return typeof rentDueDay === 'number' && rentDueDay >= 1 && rentDueDay <= 28 &&
                 typeof allowOnlinePayments === 'boolean' &&
                 typeof enableMaintenanceRequests === 'boolean';
        })();
        
        // All steps must be valid for Update Property button to be enabled
        const allValid = step1Valid && step2Valid && step3Valid && step5Valid;
        
        console.log('Step 6 Validation Debug:', {
          step1Valid,
          step2Valid,
          step3Valid,
          step5Valid,
          allValid,
          formValues: {
            name: formValues.name,
            propertyType: formValues.propertyType,
            ownershipType: formValues.ownershipType,
            address: formValues.address,
            city: formValues.city,
            state: formValues.state,
            zipCode: formValues.zipCode,
            totalUnits: formValues.totalUnits,
            rentDueDay: formValues.rentDueDay,
            allowOnlinePayments: formValues.allowOnlinePayments,
            enableMaintenanceRequests: formValues.enableMaintenanceRequests
          }
        });
        
        // Additional debugging for Update Property button
        console.log('Update Property Button Debug:', {
          isSubmitting,
          isCurrentStepValid: allValid,
          buttonDisabled: isSubmitting || !allValid,
          formErrors: Object.keys(formErrors),
          hasFormErrors: Object.keys(formErrors).length > 0
        });
        
        // Detailed form errors debugging
        if (Object.keys(formErrors).length > 0) {
          console.log('Detailed Form Errors:', formErrors);
          console.log('Form Errors by Field:');
          Object.entries(formErrors).forEach(([field, error]) => {
            console.log(`  ${field}:`, error);
          });
        }
        
        // Check if form is valid according to Zod schema
        try {
          const zodResult = propertyFormSchema.safeParse(formValues);
          console.log('Zod Schema Validation Result:', {
            success: zodResult.success,
            errors: zodResult.success ? null : zodResult.error.errors
          });
        } catch (error) {
          console.log('Zod validation error:', error);
        }
        
        return allValid;
      }
      
    } catch (error) {
      console.log(`Step ${currentStep} validation failed:`, error);
      console.log('Current form values:', formValues);
      return false;
    }
  }, [currentStep, formValues, form.watch('country')]);

  // Track form dirty state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Pre-populate form when property changes
  useEffect(() => {
    if (property) {
      console.log('Property data for form reset:', property);
      console.log('Property type:', property.propertyType);
      
      console.log('Property state value:', property.state);
      console.log('Property city value:', property.city);
      console.log('Property zipCode value:', property.zipCode);
      
      // Check if we have saved form data to restore
      if (savedFormData) {
        console.log('Restoring saved form data:', savedFormData);
        form.reset(savedFormData);
        setImagePreviews(savedFormData.images || []);
        setIsDirty(true); // Mark as dirty since we have unsaved changes
        setSavedFormData(null); // Clear saved data after restoring
      } else {
        // Reset to original property data
        form.reset({
          name: property.name || '',
          propertyType: mapPropertyType(property.propertyType),
          ownershipType: 'Owned',
          tags: property.tags || [],
          address: property.address || '',
          unitSuite: '',
          city: property.city || '',
          state: property.state || '',
          zipCode: property.zipCode || '',
          country: 'United States',
          totalUnits: property.totalUnits || undefined,
          yearBuilt: property.yearBuilt,
          sqft: undefined,
          lotSize: undefined,
          description: property.description || '',
          propertyManager: typeof property.manager === 'string' ? property.manager : property.manager?.id || '',
          rentDueDay: 1,
          allowOnlinePayments: true,
          enableMaintenanceRequests: true,
          images: [],
          amenities: property.amenities || [],
          neighborhood: property.neighborhood || '',
          marketValue: property.marketValue,
          purchasePrice: property.purchasePrice,
          purchaseDate: property.purchaseDate || '',
          expenses: property.expenses,
          notes: property.notes || '',
        });
        
        // Set image previews for existing images
        setImagePreviews(property.images || []);
        setIsDirty(false);
      }
      
      setCurrentStep(1);
    }
  }, [property, form, savedFormData]);

  // Fetch managers when sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);

  // Image upload handlers (same as Add Property)
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

  // Navigation handlers (same as Add Property)
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length && isCurrentStepValid) {
      setCurrentStep(prev => prev + 1);
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    // Save current form data before closing
    setSavedFormData(form.getValues());
    setIsDirty(false);
    setCurrentStep(1);
    onClose();
  };

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

  // Form submission handler (enhanced version)
  const onSubmit = async (data: PropertyFormData) => {
    console.log('onSubmit called with data:', data);
    console.log('Property:', property);
    
    if (!property) {
      console.error('No property data available for submission');
      return;
    }

    console.log('Setting isSubmitting to true');
    setIsSubmitting(true);
    try {
      // Handle image uploads first
      const imageUrls = [...(property.images || [])]; // Keep existing images
      
      // Upload new images using the API function
      const newImages = data.images.filter(img => img instanceof File);
      if (newImages.length > 0) {
        try {
          const { propertiesApi } = await import('@/lib/api');
          const uploadResult = await propertiesApi.uploadPropertyImages(property.id, newImages);
          if (uploadResult.success && uploadResult.data?.images) {
            imageUrls.push(...uploadResult.data.images);
          }
        } catch (error) {
          console.error('Error uploading images:', error);
        }
      }

      // Update property data using the API function
      const { propertiesApi } = await import('@/lib/api');

      // Clear saved form data since we're successfully saving
      setSavedFormData(null);

      // Build payload restricted to fields supported by backend model
      const updateData: Record<string, any> = {
        name: data.name,
        propertyType: mapPropertyTypeToDb(data.propertyType),
        ownershipType: data.ownershipType,
        tags: data.tags,
        address: data.address,
        unitSuite: data.unitSuite,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        totalUnits: data.totalUnits,
        yearBuilt: data.yearBuilt ?? null,
        sqft: data.sqft ?? null,
        lotSize: data.lotSize ?? null,
        description: data.description,
        notes: data.notes,
        amenities: data.amenities,
        rentDueDay: data.rentDueDay,
        allowOnlinePayments: data.allowOnlinePayments,
        enableMaintenanceRequests: data.enableMaintenanceRequests,
        images: imageUrls,
      };

      // Map manager selection to the correct backend field
      if (data.propertyManager && data.propertyManager !== 'none') {
        updateData.propertyManagerId = data.propertyManager;
      }

      const response = await propertiesApi.update(property.id, updateData);
      
      if (response.success) {
        onPropertyUpdated(response.data);
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

  // Get current step configuration
  const currentStepConfig = WIZARD_STEPS.find(step => step.id === currentStep);
  const isLastStep = currentStep === WIZARD_STEPS.length;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:w-[45%] md:w-[40%] flex flex-col h-full p-0 gap-0">
        {/* Header with Progress */}
        <div className="border-b bg-card">
          {/* Header */}
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl font-semibold flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Property
            </SheetTitle>
            <SheetDescription>
              Step {currentStep} of {WIZARD_STEPS.length}: {currentStepConfig?.description}
            </SheetDescription>
          </SheetHeader>

          {/* Progress Indicator */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              {WIZARD_STEPS.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="relative">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      disabled={step.id > currentStep}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 transform hover:scale-105 ${
                        step.id < currentStep 
                          ? 'bg-gradient-to-br from-primary to-primary/80 border-primary text-white cursor-pointer hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25' :
                        step.id === currentStep 
                          ? 'bg-gradient-to-br from-primary to-primary/80 border-primary text-white shadow-lg shadow-primary/25' :
                        'bg-card border-gray-300 text-gray-400 cursor-not-allowed hover:scale-100'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                      {step.id === currentStep && (
                        <div className="absolute -inset-2 rounded-full border-2 border-primary/20"></div>
                      )}
                    </button>
                    
                    {/* Step label */}
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 text-center">
                      <div className={`text-xs font-medium transition-colors duration-200 ${
                        step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="flex-1 mx-4 mt-2">
                      <div className={`h-1 rounded-full transition-all duration-500 ease-in-out ${
                        step.id < currentStep 
                          ? 'bg-gradient-to-r from-primary to-primary/80' 
                          : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Enhanced step info */}
            <div className="text-center mt-8">
              {/* Progress bar */}
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-in-out rounded-full"
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
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Step {currentStep} of {WIZARD_STEPS.length}</span>
                <span>{Math.round((currentStep / WIZARD_STEPS.length) * 100)}% Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="property-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <Step1BasicInfo form={form} formErrors={formErrors} formValues={formValues} />
            )}
            {currentStep === 2 && (
              <Step2Location form={form} formErrors={formErrors} formValues={formValues} />
            )}
            {currentStep === 3 && (
              <Step3PropertyDetails form={form} formErrors={formErrors} formValues={formValues} />
            )}
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
            {currentStep === 5 && (
              <Step5Financial 
                form={form} 
                formErrors={formErrors} 
                formValues={formValues} 
              />
            )}
            {currentStep === 6 && (
              <Step5Review 
                form={form} 
                formErrors={formErrors} 
                formValues={formValues} 
                imagePreviews={imagePreviews} 
                onEditStep={handleStepClick} 
              />
            )}
          </form>
        </div>

        {/* Enhanced Navigation with Validation */}
        <div className="border-t bg-card px-6 py-4 flex-shrink-0 shadow-lg">
            {/* Validation Status - Full Width on Mobile */}
            {!isLastStep && (
              <div className="mb-4">
                {!isCurrentStepValid && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">Complete required fields to continue</span>
                  </div>
                )}
                
                {isCurrentStepValid && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">Step completed</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                
                {isLastStep ? (
                  <Button 
                    type="submit"
                    form="property-form"
                    disabled={isSubmitting || !isCurrentStepValid}
                    className="flex items-center gap-2 px-8 py-2.5 font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating Property...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Update Property
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

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onClose={() => setShowUnsavedDialog(false)}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to close?"
        confirmText="Close Without Saving"
        cancelText="Continue Editing"
        variant="warning"
      />
    </Sheet>
  );
};

export default Properties;