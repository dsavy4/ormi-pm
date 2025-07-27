import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Crop,
  Type,
  PenTool,
  MousePointer,
  Hand,
  Move,
  Square,
  Circle,
  Triangle,
  Minus,
  X,
  Check,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Eye as EyeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  MoreHorizontal as MoreHorizontalIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateCw as RotateCwIcon,
  RotateCcw as RotateCcwIcon,
  Crop as CropIcon,
  Type as TypeIcon,
  PenTool as PenToolIcon,
  MousePointer as MousePointerIcon,
  Hand as HandIcon,
  Move as MoveIcon,
  Square as SquareIcon,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Minus as MinusIcon,
  X as XIcon,
  Check as CheckIcon,
  Building,
  Home,
  User,
  UserCheck,
  UserX,
  Shield,
  Lock,
  Unlock,
  Key,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Star,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Settings as SettingsIcon,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  Building as BuildingIcon,
  Users as UsersIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon,
  Award as AwardIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Crown as CrownIcon,
  Plus as PlusIcon2,
  Edit as EditIcon2,
  Trash2 as Trash2Icon2,
  MoreHorizontal as MoreHorizontalIcon2,
  Search as SearchIcon2,
  Filter as FilterIcon2,
  Download as DownloadIcon2,
  RefreshCw as RefreshCwIcon2,
  ExternalLink as ExternalLinkIcon2,
  Settings as SettingsIcon2,
  Archive as ArchiveIcon2,
  UserPlus as UserPlusIcon2,
  UserCheck as UserCheckIcon2,
  UserX as UserXIcon2,
  Wrench as WrenchIcon2,
  Home as HomeIcon2,
  BarChart3 as BarChart3Icon2,
  CreditCard as CreditCardIcon2,
  FileText as FileTextIcon2,
  MessageSquare as MessageSquareIcon2,
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
import { Textarea } from '@/components/ui/textarea';

interface PropertyPortfolio {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'mixed' | 'industrial';
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
  averageRent: number;
  manager: string;
  location: string;
  status: 'active' | 'inactive' | 'development';
  createdAt: string;
  lastUpdated: string;
}

interface CorporateHierarchy {
  id: string;
  name: string;
  role: 'owner' | 'executive' | 'regional_manager' | 'property_manager' | 'assistant';
  email: string;
  phone: string;
  department: string;
  reportsTo: string;
  manages: string[];
  accessLevel: 'full' | 'regional' | 'property' | 'limited';
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  properties: string[];
}

interface BulkOperation {
  id: string;
  name: string;
  type: 'rent_increase' | 'maintenance' | 'communication' | 'reporting' | 'settings';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  targetProperties: string[];
  affectedUnits: number;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  progress: number;
  details: string;
}

interface PortfolioAnalytics {
  totalPortfolios: number;
  totalProperties: number;
  totalUnits: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  averageOccupancy: number;
  averageROI: number;
  topPerformingPortfolio: {
    name: string;
    roi: number;
    revenue: number;
  };
  portfolioBreakdown: Array<{
    name: string;
    properties: number;
    units: number;
    revenue: number;
    roi: number;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export function MultiPropertyManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('portfolios');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PropertyPortfolio | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Mock data - replace with real API calls
  const portfolios: PropertyPortfolio[] = [
    {
      id: '1',
      name: 'Sunset Residential Portfolio',
      type: 'residential',
      totalProperties: 4,
      totalUnits: 80,
      occupiedUnits: 73,
      totalRevenue: 185000,
      totalExpenses: 45000,
      netIncome: 140000,
      occupancyRate: 91.25,
      averageRent: 2312.5,
      manager: 'Sarah Johnson',
      location: 'Los Angeles, CA',
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      lastUpdated: '2024-01-18T10:00:00Z',
    },
    {
      id: '2',
      name: 'Downtown Commercial Portfolio',
      type: 'commercial',
      totalProperties: 2,
      totalUnits: 25,
      occupiedUnits: 22,
      totalRevenue: 960000,
      totalExpenses: 240000,
      netIncome: 720000,
      occupancyRate: 88.0,
      averageRent: 38400,
      manager: 'Michael Chen',
      location: 'San Francisco, CA',
      status: 'active',
      createdAt: '2023-03-15T00:00:00Z',
      lastUpdated: '2024-01-17T14:30:00Z',
    },
    {
      id: '3',
      name: 'Riverside Mixed Portfolio',
      type: 'mixed',
      totalProperties: 3,
      totalUnits: 45,
      occupiedUnits: 42,
      totalRevenue: 1152000,
      totalExpenses: 288000,
      netIncome: 864000,
      occupancyRate: 93.33,
      averageRent: 25600,
      manager: 'David Rodriguez',
      location: 'San Diego, CA',
      status: 'active',
      createdAt: '2023-06-01T00:00:00Z',
      lastUpdated: '2024-01-16T09:15:00Z',
    },
  ];

  const hierarchy: CorporateHierarchy[] = [
    {
      id: '1',
      name: 'John Anderson',
      role: 'owner',
      email: 'john.anderson@ormi.com',
      phone: '+1-555-0100',
      department: 'Executive',
      reportsTo: '',
      manages: ['2', '3'],
      accessLevel: 'full',
      permissions: ['all'],
      isActive: true,
      lastLogin: '2024-01-18T08:00:00Z',
      properties: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'regional_manager',
      email: 'sarah.johnson@ormi.com',
      phone: '+1-555-0101',
      department: 'Operations',
      reportsTo: '1',
      manages: ['4', '5'],
      accessLevel: 'regional',
      permissions: ['view', 'edit', 'reports', 'users'],
      isActive: true,
      lastLogin: '2024-01-18T09:30:00Z',
      properties: ['1', '2', '3', '4'],
    },
    {
      id: '3',
      name: 'Michael Chen',
      role: 'regional_manager',
      email: 'michael.chen@ormi.com',
      phone: '+1-555-0102',
      department: 'Operations',
      reportsTo: '1',
      manages: ['6', '7'],
      accessLevel: 'regional',
      permissions: ['view', 'edit', 'reports', 'users'],
      isActive: true,
      lastLogin: '2024-01-18T10:15:00Z',
      properties: ['5', '6', '7', '8', '9'],
    },
    {
      id: '4',
      name: 'David Rodriguez',
      role: 'property_manager',
      email: 'david.rodriguez@ormi.com',
      phone: '+1-555-0103',
      department: 'Property Management',
      reportsTo: '2',
      manages: [],
      accessLevel: 'property',
      permissions: ['view', 'edit', 'maintenance', 'tenants'],
      isActive: true,
      lastLogin: '2024-01-18T11:00:00Z',
      properties: ['1', '2'],
    },
  ];

  const bulkOperations: BulkOperation[] = [
    {
      id: '1',
      name: 'Annual Rent Increase - Sunset Portfolio',
      type: 'rent_increase',
      status: 'completed',
      targetProperties: ['1', '2', '3', '4'],
      affectedUnits: 80,
      createdBy: 'Sarah Johnson',
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: '2024-01-16T14:30:00Z',
      progress: 100,
      details: 'Applied 5% rent increase to all units in Sunset Portfolio',
    },
    {
      id: '2',
      name: 'Maintenance Schedule Update',
      type: 'maintenance',
      status: 'in_progress',
      targetProperties: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      affectedUnits: 150,
      createdBy: 'Michael Chen',
      createdAt: '2024-01-18T09:00:00Z',
      progress: 65,
      details: 'Updating maintenance schedules for all properties',
    },
    {
      id: '3',
      name: 'Quarterly Report Generation',
      type: 'reporting',
      status: 'pending',
      targetProperties: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      affectedUnits: 150,
      createdBy: 'John Anderson',
      createdAt: '2024-01-18T16:00:00Z',
      progress: 0,
      details: 'Generate quarterly performance reports for all portfolios',
    },
  ];

  const analytics: PortfolioAnalytics = {
    totalPortfolios: 3,
    totalProperties: 9,
    totalUnits: 150,
    totalRevenue: 2297000,
    totalExpenses: 573000,
    netIncome: 1724000,
    averageOccupancy: 91.19,
    averageROI: 23.4,
    topPerformingPortfolio: {
      name: 'Riverside Mixed Portfolio',
      roi: 24.0,
      revenue: 1152000,
    },
    portfolioBreakdown: [
      {
        name: 'Sunset Residential Portfolio',
        properties: 4,
        units: 80,
        revenue: 185000,
        roi: 21.6,
      },
      {
        name: 'Downtown Commercial Portfolio',
        properties: 2,
        units: 25,
        revenue: 960000,
        roi: 9.0,
      },
      {
        name: 'Riverside Mixed Portfolio',
        properties: 3,
        units: 45,
        revenue: 1152000,
        roi: 24.0,
      },
    ],
  };

  const getPortfolioIcon = (type: string) => {
    switch (type) {
      case 'residential':
        return <Home className="h-8 w-8 text-blue-600" />;
      case 'commercial':
        return <Building className="h-8 w-8 text-green-600" />;
      case 'mixed':
        return <Building2 className="h-8 w-8 text-purple-600" />;
      case 'industrial':
        return <Building2 className="h-8 w-8 text-orange-600" />;
      default:
        return <Building2 className="h-8 w-8 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'development':
        return <Badge variant="outline" className="text-blue-600"><Clock className="h-3 w-3 mr-1" />Development</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="destructive">Owner</Badge>;
      case 'executive':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Executive</Badge>;
      case 'regional_manager':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Regional Manager</Badge>;
      case 'property_manager':
        return <Badge variant="outline" className="text-green-600">Property Manager</Badge>;
      case 'assistant':
        return <Badge variant="outline" className="text-gray-600">Assistant</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'full':
        return <Badge variant="destructive">Full Access</Badge>;
      case 'regional':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Regional</Badge>;
      case 'property':
        return <Badge variant="outline" className="text-green-600">Property</Badge>;
      case 'limited':
        return <Badge variant="outline" className="text-gray-600">Limited</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getOperationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary"><Activity className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Multi-Property Management</h1>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <Building2 className="h-3 w-3 mr-1" />
              Enterprise
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage multiple property portfolios and corporate hierarchy
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="btn-ormi" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
      </motion.div>

      {/* Analytics Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolios</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPortfolios}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalProperties} properties
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalUnits} units
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all portfolios
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageROI.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Portfolio performance
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Portfolios Tab */}
          <TabsContent value="portfolios" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <Input
                      placeholder="Search portfolios..."
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
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">&nbsp;</label>
                    <div className="text-sm text-gray-500">
                      {portfolios.length} portfolios
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getPortfolioIcon(portfolio.type)}
                        <div>
                          <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                          <CardDescription className="capitalize">{portfolio.type}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(portfolio.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Properties</label>
                        <p className="font-medium">{portfolio.totalProperties}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Units</label>
                        <p className="font-medium">{portfolio.totalUnits}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Occupancy</label>
                        <p className="font-medium">{portfolio.occupancyRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Avg Rent</label>
                        <p className="font-medium">{formatCurrency(portfolio.averageRent)}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Revenue</span>
                        <span className="font-medium">{formatCurrency(portfolio.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Expenses</span>
                        <span className="font-medium">{formatCurrency(portfolio.totalExpenses)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Net Income</span>
                        <span className="font-medium text-green-600">{formatCurrency(portfolio.netIncome)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Manager: {portfolio.manager}</span>
                      <span>{portfolio.location}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Hierarchy Tab */}
          <TabsContent value="hierarchy" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Corporate Hierarchy</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hierarchy.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          {getAccessLevelBadge(user.accessLevel)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.properties.length} properties</div>
                            <div className="text-gray-500">{user.manages.length} direct reports</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(user.lastLogin)}</div>
                            <div className="text-gray-500">
                              {user.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Security Settings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bulk Operations</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Operation
              </Button>
            </div>

            <div className="space-y-4">
              {bulkOperations.map((operation) => (
                <Card key={operation.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{operation.name}</h4>
                          <p className="text-sm text-gray-500">
                            Created by {operation.createdBy} • {formatDate(operation.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getOperationStatusBadge(operation.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Activity className="mr-2 h-4 w-4" />
                              Monitor Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export Results
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <X className="mr-2 h-4 w-4" />
                              Cancel Operation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-3">{operation.details}</p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-500">{operation.progress}%</span>
                      </div>
                      
                      <Progress value={operation.progress} className="h-2" />
                      
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                        <span>{operation.affectedUnits} units affected</span>
                        <span>{operation.targetProperties.length} properties</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>
                    ROI and revenue comparison across portfolios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.portfolioBreakdown.map((portfolio) => (
                      <div key={portfolio.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{portfolio.name}</div>
                          <div className="text-sm text-gray-500">
                            {portfolio.properties} properties • {portfolio.units} units
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{portfolio.roi.toFixed(1)}% ROI</div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(portfolio.revenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Portfolio */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Portfolio</CardTitle>
                  <CardDescription>
                    Best performing portfolio this quarter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{analytics.topPerformingPortfolio.name}</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analytics.topPerformingPortfolio.roi.toFixed(1)}% ROI
                    </div>
                    <div className="text-lg text-gray-600 mb-4">
                      {formatCurrency(analytics.topPerformingPortfolio.revenue)} revenue
                    </div>
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Portfolio Details Dialog */}
      <Dialog open={!!selectedPortfolio} onOpenChange={() => setSelectedPortfolio(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Portfolio Details</DialogTitle>
          </DialogHeader>
          {selectedPortfolio && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Portfolio Name</label>
                  <p className="font-medium">{selectedPortfolio.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="font-medium capitalize">{selectedPortfolio.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager</label>
                  <p className="font-medium">{selectedPortfolio.manager}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="font-medium">{selectedPortfolio.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPortfolio.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="font-medium">{formatDate(selectedPortfolio.createdAt)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Properties</label>
                  <p className="font-medium">{selectedPortfolio.totalProperties}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Units</label>
                  <p className="font-medium">{selectedPortfolio.totalUnits}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupied Units</label>
                  <p className="font-medium">{selectedPortfolio.occupiedUnits}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupancy Rate</label>
                  <p className="font-medium">{selectedPortfolio.occupancyRate.toFixed(1)}%</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(selectedPortfolio.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <span className="font-medium">{formatCurrency(selectedPortfolio.totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Net Income</span>
                  <span className="font-medium text-green-600">{formatCurrency(selectedPortfolio.netIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Average Rent</span>
                  <span className="font-medium">{formatCurrency(selectedPortfolio.averageRent)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Portfolio
                </Button>
                <Button className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Properties
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 