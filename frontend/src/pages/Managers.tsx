import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Activity,
  TrendingUp,
  Star,
  Award,
  Badge as BadgeIcon,
  Flag,
  Target,
  Zap,
  Shield,
  RefreshCw,
  ExternalLink,
  Settings,
  Archive,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  Wrench,
  Home,
  BarChart3,
  CreditCard,
  FileText,
  MessageSquare,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
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
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  AlertTriangle as AlertTriangleIcon,
  XCircle as XCircleIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  MoreHorizontal as MoreHorizontalIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  RefreshCw as RefreshCwIcon,
  ExternalLink as ExternalLinkIcon,
  Settings as SettingsIcon,
  Archive as ArchiveIcon,
  UserPlus as UserPlusIcon,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  Wrench as WrenchIcon,
  Home as HomeIcon,
  BarChart3 as BarChart3Icon,
  CreditCard as CreditCardIcon,
  FileText as FileTextIcon,
  MessageSquare as MessageSquareIcon,
  X
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Separator } from '@/components/ui/separator';

// API
import { managersApi } from '@/lib/api';

// Types
interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'PROPERTY_MANAGER' | 'ASSISTANT_MANAGER' | 'MAINTENANCE_STAFF' | 'ACCOUNTING_STAFF';
  status: 'Active' | 'Inactive' | 'Pending';
  hireDate: string;
  assignedProperties: number;
  totalProperties: number;
  performanceMetrics: {
    occupancyRate: number;
    maintenanceResponseTime: number;
    tenantSatisfaction: number;
    collectionRate: number;
    avgRating: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'maintenance' | 'payment' | 'tenant' | 'property';
    description: string;
    timestamp: string;
  }>;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  certifications: string[];
  experience: number; // years
  isActive: boolean;
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

export function Managers() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [showAddManager, setShowAddManager] = useState(false);
  const [showAssignProperties, setShowAssignProperties] = useState(false);

  // Fetch managers data
  const { 
    data: managersData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['managers'],
    queryFn: () => managersApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const managers = managersData?.data || [];

  // Filter and search managers
  const filteredManagers = useMemo(() => {
    return managers.filter(manager => {
      const matchesSearch = 
        manager.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || manager.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesRole = filterRole === 'all' || manager.role.toLowerCase() === filterRole.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [managers, searchTerm, filterStatus, filterRole]);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const total = managers.length;
    const active = managers.filter(m => m.status === 'Active').length;
    const totalProperties = managers.reduce((sum, m) => sum + m.assignedProperties, 0);
    const avgOccupancy = managers.reduce((sum, m) => sum + m.performanceMetrics.occupancyRate, 0) / total || 0;
    const avgSatisfaction = managers.reduce((sum, m) => sum + m.performanceMetrics.tenantSatisfaction, 0) / total || 0;
    const avgRating = managers.reduce((sum, m) => sum + m.performanceMetrics.avgRating, 0) / total || 0;

    return {
      total,
      active,
      totalProperties,
      avgOccupancy,
      avgSatisfaction,
      avgRating,
      activeRate: total > 0 ? (active / total) * 100 : 0
    };
  }, [managers]);

  const handleRefresh = async () => {
    await refetch();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PROPERTY_MANAGER':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Crown className="h-3 w-3 mr-1" />Property Manager</Badge>;
      case 'ASSISTANT_MANAGER':
        return <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />Assistant</Badge>;
      case 'MAINTENANCE_STAFF':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800"><Wrench className="h-3 w-3 mr-1" />Maintenance</Badge>;
      case 'ACCOUNTING_STAFF':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><DollarSign className="h-3 w-3 mr-1" />Accounting</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'Inactive':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'Pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Managers</h3>
        <p className="text-gray-500 mb-4">Unable to load manager data.</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manager Management</h1>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <Crown className="h-3 w-3 mr-1" />
              {metrics.total} Total
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage property managers, track performance, and assign properties
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Select value={viewMode} onValueChange={(value: 'grid' | 'table') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Table View</SelectItem>
              <SelectItem value="grid">Grid View</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="btn-ormi" onClick={() => setShowAddManager(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Manager
          </Button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.active} active managers
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              Across all managers
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Portfolio average
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search managers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="property_manager">Property Manager</SelectItem>
                    <SelectItem value="assistant_manager">Assistant Manager</SelectItem>
                    <SelectItem value="maintenance_staff">Maintenance Staff</SelectItem>
                    <SelectItem value="accounting_staff">Accounting Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                <div className="text-sm text-gray-500">
                  {filteredManagers.length} of {managers.length} managers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Managers Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Property Managers</CardTitle>
            <CardDescription>
              Manage your property management team and their assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredManagers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No managers found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManagers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={manager.avatar} />
                            <AvatarFallback>
                              {manager.firstName[0]}{manager.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {manager.firstName} {manager.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{manager.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(manager.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(manager.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{manager.assignedProperties}</div>
                          <div className="text-gray-500">assigned</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {manager.performanceMetrics.occupancyRate}%
                            </div>
                            <div className="text-xs text-gray-500">occupancy</div>
                          </div>
                          <Progress 
                            value={manager.performanceMetrics.occupancyRate} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedManager(manager)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowAssignProperties(true)}>
                              <Building2 className="mr-2 h-4 w-4" />
                              Assign Properties
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Performance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default Managers;