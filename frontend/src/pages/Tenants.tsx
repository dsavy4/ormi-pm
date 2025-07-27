import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { tenantsApi } from '@/lib/api';
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
  CreditCard,
  FileText,
  MessageSquare,
  User,
  Home,
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
  Wrench
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

// Types
interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'Active' | 'Late' | 'Notice' | 'Inactive';
  unit: {
    id: string;
    number: string;
    property: {
      id: string;
      name: string;
      address: string;
    };
  };
  lease: {
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    status: 'Active' | 'Expired' | 'Expiring Soon';
  };
  balance: number;
  lastPayment: {
    date: string;
    amount: number;
  } | null;
  moveInDate: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  rating: number;
  maintenanceRequests: number;
  paymentHistory: {
    onTime: number;
    late: number;
    total: number;
  };
}

// API fetcher for tenants
const tenantsFetcher = () => tenantsApi.getAll();

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

export function Tenants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showAddTenant, setShowAddTenant] = useState(false);

  // Data fetching with SWR
  const { 
    data: tenantsData, 
    error: tenantsError, 
    isLoading: tenantsLoading,
    mutate: mutateTenants 
  } = useSWR('/api/tenants', tenantsFetcher);

  // Extract tenants from API response
  const tenants = (tenantsData as any)?.data || [];

  // Filter and search tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter(tenant => {
      const matchesSearch = 
        tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.unit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.unit.property.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || tenant.status.toLowerCase() === filterStatus.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [tenants, searchTerm, filterStatus]);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter(t => t.status === 'Active').length;
    const late = tenants.filter(t => t.status === 'Late').length;
    const totalRent = tenants.reduce((sum, t) => sum + t.lease.monthlyRent, 0);
    const totalBalance = tenants.reduce((sum, t) => sum + Math.abs(t.balance), 0);
    const avgRating = tenants.reduce((sum, t) => sum + t.rating, 0) / total;
    const expiringLeases = tenants.filter(t => t.lease.status === 'Expiring Soon').length;

    return {
      total,
      active,
      late,
      totalRent,
      totalBalance,
      avgRating,
      expiringLeases,
      occupancyRate: total > 0 ? (active / total) * 100 : 0
    };
  }, [tenants]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 border-green-200';
      case 'Late': return 'bg-red-50 text-red-700 border-red-200';
      case 'Notice': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" />;
      case 'Late': return <AlertTriangle className="h-4 w-4" />;
      case 'Notice': return <Clock className="h-4 w-4" />;
      case 'Inactive': return <UserX className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Loading state
  if (tenantsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ormi-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Loading tenants...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tenantsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Failed to load tenants</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
          <Button 
            onClick={() => mutateTenants()} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <Crown className="h-3 w-3 mr-1" />
              {metrics.total} Total
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Manage tenant relationships, track payments, and monitor lease status
          </p>
          {tenants.length === 0 && !tenantsLoading && (
            <p className="mt-1 text-sm text-orange-600">
              No tenants found. Add your first tenant to get started.
            </p>
          )}
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" className="btn-ormi" onClick={() => setShowAddTenant(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metrics.active} active
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.occupancyRate.toFixed(1)}%</p>
                <Progress value={metrics.occupancyRate} className="mt-2" />
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                <p className="text-2xl font-bold text-gray-900">${(metrics.totalRent / 1000).toFixed(0)}k</p>
                {metrics.late > 0 && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {metrics.late} late payments
                  </p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgRating.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-3 w-3 ${star <= Math.round(metrics.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="late">Late Payment</SelectItem>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {filteredTenants.length} results
                </Badge>
                {metrics.expiringLeases > 0 && (
                  <Badge variant="destructive">
                    {metrics.expiringLeases} leases expiring soon
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tenants List/Grid */}
      <motion.div variants={itemVariants}>
        {viewMode === 'table' ? (
          <Card>
            <CardHeader>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>Comprehensive tenant information and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Lease End</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id} className="hover:bg-gray-50 cursor-pointer">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={tenant.avatar} alt={`${tenant.firstName} ${tenant.lastName}`} />
                            <AvatarFallback>
                              {tenant.firstName[0]}{tenant.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {tenant.firstName} {tenant.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{tenant.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tenant.unit.number}</p>
                          <p className="text-sm text-gray-500">{tenant.unit.property.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">${tenant.lease.monthlyRent.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(tenant.status)}`}>
                          {getStatusIcon(tenant.status)}
                          {tenant.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className={`font-medium ${tenant.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {tenant.balance === 0 ? '$0' : tenant.balance < 0 ? `-$${Math.abs(tenant.balance)}` : `$${tenant.balance}`}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{tenant.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(tenant.lease.endDate).toLocaleDateString()}</p>
                        {tenant.lease.status === 'Expiring Soon' && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Expiring Soon
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedTenant(tenant)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Tenant
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Tenant
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="card-hover cursor-pointer" onClick={() => setSelectedTenant(tenant)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={tenant.avatar} alt={`${tenant.firstName} ${tenant.lastName}`} />
                        <AvatarFallback>
                          {tenant.firstName[0]}{tenant.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {tenant.firstName} {tenant.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{tenant.email}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tenant.status)}`}>
                      {getStatusIcon(tenant.status)}
                      {tenant.status}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Unit</span>
                      <span className="font-medium">{tenant.unit.number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Monthly Rent</span>
                      <span className="font-medium">${tenant.lease.monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Balance</span>
                      <span className={`font-medium ${tenant.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {tenant.balance === 0 ? '$0' : tenant.balance < 0 ? `-$${Math.abs(tenant.balance)}` : `$${tenant.balance}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{tenant.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Lease ends {new Date(tenant.lease.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Tenant Detail Modal */}
      <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTenant && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedTenant.avatar} alt={`${selectedTenant.firstName} ${selectedTenant.lastName}`} />
                    <AvatarFallback>
                      {selectedTenant.firstName[0]}{selectedTenant.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedTenant.firstName} {selectedTenant.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">Unit {selectedTenant.unit.number} • {selectedTenant.unit.property.name}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedTenant.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{selectedTenant.phone}</p>
                          </div>
                        </div>
                        {selectedTenant.emergencyContact && (
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Emergency Contact</p>
                              <p className="font-medium">{selectedTenant.emergencyContact.name}</p>
                              <p className="text-sm text-gray-500">{selectedTenant.emergencyContact.phone}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Lease Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Lease Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Monthly Rent</p>
                            <p className="font-semibold text-lg">${selectedTenant.lease.monthlyRent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Security Deposit</p>
                            <p className="font-medium">${selectedTenant.lease.securityDeposit.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lease Start</p>
                            <p className="font-medium">{new Date(selectedTenant.lease.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lease End</p>
                            <p className="font-medium">{new Date(selectedTenant.lease.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-2">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{selectedTenant.paymentHistory.onTime}</p>
                          <p className="text-sm text-gray-500">On-time Payments</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-2">
                            <Star className="h-8 w-8 text-yellow-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{selectedTenant.rating}</p>
                          <p className="text-sm text-gray-500">Tenant Rating</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-2">
                            <Wrench className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{selectedTenant.maintenanceRequests}</p>
                          <p className="text-sm text-gray-500">Maintenance Requests</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-100 rounded-full mb-2">
                            <Calendar className="h-8 w-8 text-purple-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.floor((new Date().getTime() - new Date(selectedTenant.moveInDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                          </p>
                          <p className="text-sm text-gray-500">Months as Tenant</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  {selectedTenant.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{selectedTenant.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="payments">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment History</CardTitle>
                      <CardDescription>Complete payment records and transaction history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{selectedTenant.paymentHistory.onTime}</p>
                            <p className="text-sm text-gray-500">On Time</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{selectedTenant.paymentHistory.late}</p>
                            <p className="text-sm text-gray-500">Late</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{selectedTenant.paymentHistory.total}</p>
                            <p className="text-sm text-gray-500">Total</p>
                          </div>
                        </div>
                        <p className="text-center text-gray-500">Payment history would be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="maintenance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Requests</CardTitle>
                      <CardDescription>Service requests and repair history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Wrench className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Maintenance request history would be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>Documents</CardTitle>
                      <CardDescription>Lease agreements, applications, and related documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Document management interface would be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 