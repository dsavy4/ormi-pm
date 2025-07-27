import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Home,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Bell,
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Wrench,
  Target,
  BarChart3,
  Filter,
  Download,
  Eye,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingDown,
  Zap,
  Shield,
  Award,
  Crown,
  Sparkles
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Charts
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ReferenceLine
} from 'recharts';

// API
import { dashboardApi } from '@/lib/api';

// Hooks
import { useAuth } from '@/contexts/AuthContext';

// Types
interface DashboardData {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalTenants: number;
  activeTenants: number;
  monthlyRevenue: number;
  collectedThisMonth: number;
  pendingPayments: number;
  overduePayments: number;
  maintenanceRequests: number;
  urgentRequests: number;
  recentPayments: Array<{
    id: number;
    tenant: string;
    unit: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
  upcomingPayments: Array<{
    id: number;
    tenant: string;
    unit: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
  maintenanceRequestsData: Array<{
    id: number;
    unit: string;
    type: string;
    priority: string;
    status: string;
    createdAt: string;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  className?: string;
  badge?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo';
  loading?: boolean;
}

const MetricCard = React.memo<MetricCardProps>(({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className, 
  badge,
  color = 'blue',
  loading = false
}) => {
  if (loading) {
    return (
      <Card className={`card-hover card-enhanced hover:shadow-lg transition-all duration-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:border dark:border-blue-800/30',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 dark:border dark:border-green-800/30',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 dark:border dark:border-orange-800/30',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 dark:border dark:border-red-800/30',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 dark:border dark:border-purple-800/30',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border dark:border-indigo-800/30'
  };

  return (
    <Card className={`card-hover card-enhanced hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
              {badge && (
                <Badge variant="secondary" className="text-xs px-2 py-1 badge-enhanced">
                  {badge}
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              {trend && (
                <div className="flex items-center gap-1">
                  {trend.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 dark:text-red-400" />
                  )}
                  <span className={`text-xs font-medium ${
                    trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {trend.value}%
                  </span>
                </div>
              )}
            </div>
            {trend && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {trend.period || 'vs last month'}
              </p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center metric-icon-enhanced ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

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

export function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState('thisMonth');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['dashboard', dateRange],
    queryFn: () => dashboardApi.getMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Memoized calculations
  const metrics = useMemo(() => {
    if (!dashboardData) return null;

    const data = dashboardData.data || dashboardData;
    const occupancyRate = data.totalUnits > 0 ? (data.occupiedUnits / data.totalUnits) * 100 : 0;
    const collectionRate = data.monthlyRevenue > 0 ? (data.collectedThisMonth / data.monthlyRevenue) * 100 : 0;
    const urgentRate = data.maintenanceRequests > 0 ? (data.urgentRequests / data.maintenanceRequests) * 100 : 0;

    return {
      ...data,
      occupancyRate,
      collectionRate,
      urgentRate
    };
  }, [dashboardData]);

  // Chart data preparations
  const revenueData = useMemo(() => {
    if (!metrics) return [];
    
    return [
      { name: 'Collected', value: metrics.collectedThisMonth, color: '#10B981' },
      { name: 'Pending', value: metrics.pendingPayments, color: '#F59E0B' },
      { name: 'Overdue', value: metrics.overduePayments, color: '#EF4444' }
    ];
  }, [metrics]);

  const occupancyData = useMemo(() => {
    if (!metrics) return [];
    
    return [
      { name: 'Occupied', value: metrics.occupiedUnits, color: '#1D4ED8' },
      { name: 'Vacant', value: metrics.vacantUnits, color: '#E5E7EB' }
    ];
  }, [metrics]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
            <p className="text-gray-600 mb-4">There was an error loading your dashboard data.</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-400 dark:border-blue-800/30">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {user?.firstName}! Here's your property portfolio overview.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="btn-ormi">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/properties?action=add'}>
                <Building2 className="h-4 w-4 mr-2" />
                Add Property
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/units?action=add'}>
                <Home className="h-4 w-4 mr-2" />
                Add Unit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/tenants?action=add'}>
                <Users className="h-4 w-4 mr-2" />
                Add Tenant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/payments?action=add'}>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/maintenance?action=add'}>
                <Wrench className="h-4 w-4 mr-2" />
                Maintenance Request
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Properties"
          value={metrics?.totalProperties || 0}
          icon={Building2}
          trend={{ value: 8.2, isPositive: true }}
          color="blue"
          loading={isLoading}
        />
        <MetricCard
          title="Total Units"
          value={metrics?.totalUnits || 0}
          icon={Home}
          trend={{ value: 3.1, isPositive: true }}
          color="green"
          loading={isLoading}
        />
        <MetricCard
          title="Active Tenants"
          value={metrics?.activeTenants || 0}
          icon={Users}
          trend={{ value: 2.5, isPositive: true }}
          color="purple"
          loading={isLoading}
        />
        <MetricCard
          title="Monthly Revenue"
          value={metrics ? `$${(metrics.monthlyRevenue / 1000).toFixed(0)}k` : '$0'}
          icon={DollarSign}
          trend={{ value: 12.3, isPositive: true }}
          color="indigo"
          loading={isLoading}
        />
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Occupancy Rate"
          value={metrics ? `${metrics.occupancyRate.toFixed(1)}%` : '0%'}
          icon={Target}
          trend={{ value: 2.1, isPositive: true }}
          color="green"
          badge={metrics?.occupancyRate && metrics.occupancyRate > 90 ? 'Excellent' : undefined}
          loading={isLoading}
        />
        <MetricCard
          title="Collection Rate"
          value={metrics ? `${metrics.collectionRate.toFixed(1)}%` : '0%'}
          icon={CreditCard}
          trend={{ value: 1.8, isPositive: true }}
          color="blue"
          loading={isLoading}
        />
        <MetricCard
          title="Maintenance Requests"
          value={metrics?.maintenanceRequests || 0}
          icon={Wrench}
          trend={{ value: -15.2, isPositive: true }}
          color="orange"
          badge={metrics?.urgentRequests && metrics.urgentRequests > 0 ? `${metrics.urgentRequests} urgent` : undefined}
          loading={isLoading}
        />
        <MetricCard
          title="Overdue Payments"
          value={metrics ? `$${(metrics.overduePayments / 1000).toFixed(0)}k` : '$0'}
          icon={AlertCircle}
          trend={{ value: -8.7, isPositive: true }}
          color="red"
          loading={isLoading}
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly rent collection status</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metrics ? `${metrics.collectionRate.toFixed(1)}%` : '0%'} collected
                </Badge>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="value" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Occupancy Chart */}
        <motion.div variants={itemVariants}>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Occupancy Status</CardTitle>
              <CardDescription>Current unit distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-ormi-blue">
                        {metrics ? metrics.occupancyRate.toFixed(1) : '0'}%
                      </div>
                      <div className="text-sm text-gray-500">Occupied</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={occupancyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {occupancyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Units']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 text-sm mt-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-ormi-blue rounded-full mr-2"></div>
                      Occupied ({metrics?.occupiedUnits || 0})
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                      Vacant ({metrics?.vacantUnits || 0})
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <motion.div variants={itemVariants}>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {metrics?.upcomingPayments?.length || 0}
                </Badge>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics?.upcomingPayments?.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {payment.tenant.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{payment.tenant}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Unit {payment.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-gray-100">${payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{payment.dueDate}</p>
                      </div>
                      <div className="ml-3">
                        <Badge variant={payment.status === 'overdue' ? 'destructive' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!metrics?.upcomingPayments || metrics.upcomingPayments.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 dark:text-green-400" />
                      <p>No upcoming payments</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Maintenance Requests */}
        <motion.div variants={itemVariants}>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Active requests requiring attention</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {metrics?.maintenanceRequestsData?.length || 0}
                </Badge>
                {metrics?.urgentRequests && metrics.urgentRequests > 0 && (
                  <Badge variant="destructive">
                    {metrics.urgentRequests} urgent
                  </Badge>
                )}
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics?.maintenanceRequestsData?.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center dark:bg-orange-900/20 dark:border dark:border-orange-800/30">
                          <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{request.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Unit {request.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            request.priority === 'High' 
                              ? 'destructive' 
                              : request.priority === 'Medium' 
                              ? 'default' 
                              : 'secondary'
                          }
                        >
                          {request.priority}
                        </Badge>
                        <Badge variant="outline">{request.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {(!metrics?.maintenanceRequestsData || metrics.maintenanceRequestsData.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 dark:text-green-400" />
                      <p>No maintenance requests</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => window.location.href = '/properties?action=add'}
              >
                <Building2 className="h-6 w-6" />
                <span className="text-sm">Add Property</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => window.location.href = '/tenants?action=add'}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Add Tenant</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => window.location.href = '/payments?action=add'}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Record Payment</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => window.location.href = '/maintenance?action=add'}
              >
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Maintenance</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 