import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  MessageSquare,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Bell,
  Settings,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Plus,
  Eye,
  Edit,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Shield,
  Zap
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// API
import { tenantApi } from '@/lib/api';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Types
interface TenantDashboardData {
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  unit: {
    id: string;
    number: string;
    property: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
    };
  };
  lease: {
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    status: 'Active' | 'Expired' | 'Expiring Soon';
  };
  currentBalance: number;
  nextPayment: {
    dueDate: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    date: string;
    status: 'Paid' | 'Pending' | 'Failed';
    method: string;
  }>;
  maintenanceRequests: Array<{
    id: string;
    title: string;
    description: string;
    status: 'Submitted' | 'In Progress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    createdAt: string;
    updatedAt: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: 'Lease' | 'Receipt' | 'Notice' | 'Other';
    url: string;
    uploadedAt: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'Payment' | 'Maintenance' | 'General';
    read: boolean;
    createdAt: string;
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

export function TenantDashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tenant dashboard data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: () => tenantApi.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-500 mb-4">Unable to load your dashboard data.</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  const data = dashboardData?.data as TenantDashboardData;

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {data?.tenant?.firstName}!</h1>
            <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <Shield className="h-3 w-3 mr-1" />
              Tenant Portal
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your rental, payments, and maintenance requests
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="btn-ormi">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Manager
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.currentBalance?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.currentBalance > 0 ? 'Amount due' : 'No balance due'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.nextPayment?.amount?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Due {data?.nextPayment?.dueDate ? new Date(data.nextPayment.dueDate).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.maintenanceRequests?.filter(r => r.status !== 'Completed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Maintenance requests
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.documents?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available documents
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Property Info & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Your Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{data?.unit?.property?.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {data?.unit?.property?.address}
                  </p>
                  <p className="text-sm text-gray-500">
                    Unit {data?.unit?.number}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Rent:</span>
                  <span className="font-medium">${data?.lease?.monthlyRent?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lease Status:</span>
                  <Badge variant={data?.lease?.status === 'Active' ? 'default' : 'secondary'}>
                    {data?.lease?.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lease Ends:</span>
                  <span>{data?.lease?.endDate ? new Date(data.lease.endDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Rent
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Wrench className="h-4 w-4 mr-2" />
                Submit Maintenance Request
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Documents
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Manager
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Notifications
                <Badge variant="outline" className="text-xs">
                  {data?.notifications?.filter(n => !n.read).length || 0} new
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.notifications?.slice(0, 3).map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-2">
                    <Bell className={`h-4 w-4 mt-0.5 ${notification.read ? 'text-gray-400' : 'text-blue-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {data?.notifications?.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-6">
              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                  <CardDescription>Your current payment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Next Payment Due</p>
                        <p className="text-sm text-gray-500">
                          {data?.nextPayment?.dueDate ? new Date(data.nextPayment.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${data?.nextPayment?.amount?.toFixed(2) || '0.00'}</p>
                        <Badge variant={data?.nextPayment?.status === 'Paid' ? 'default' : data?.nextPayment?.status === 'Overdue' ? 'destructive' : 'secondary'}>
                          {data?.nextPayment?.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Current Balance</p>
                        <p className="text-sm text-gray-500">Amount owed</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${data?.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${data?.currentBalance?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data?.currentBalance > 0 ? 'Payment required' : 'No balance due'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.recentPayments?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'Paid' ? 'default' : payment.status === 'Failed' ? 'destructive' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              {/* Maintenance Requests */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Maintenance Requests</CardTitle>
                      <CardDescription>Track your service requests</CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.maintenanceRequests?.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{request.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant={request.priority === 'Urgent' ? 'destructive' : request.priority === 'High' ? 'default' : 'secondary'}>
                                {request.priority}
                              </Badge>
                              <Badge variant={request.status === 'Completed' ? 'default' : request.status === 'In Progress' ? 'secondary' : 'outline'}>
                                {request.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {data?.maintenanceRequests?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Wrench className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No maintenance requests</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Your lease and related documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.documents?.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{document.name}</p>
                            <p className="text-sm text-gray-500">
                              {document.type} • {new Date(document.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                    {data?.documents?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No documents available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
} 