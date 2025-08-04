import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Home,
  FileText,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Share,
  Printer,
  Mail,
  Clock,
  Award,
  Crown,
  Zap,
  Shield,
  Star,
  Calculator,
  Percent,
  CreditCard,
  Archive,
  Database,
  LayoutGrid,
  List,
  Grid3X3
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Charts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts';

// Types
interface ReportData {
  financialSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
    occupancyRevenue: number;
    vacancyLoss: number;
  };
  rentRoll: Array<{
    property: string;
    unit: string;
    tenant: string;
    monthlyRent: number;
    status: string;
    leaseEnd: string;
    balance: number;
  }>;
  vacancyReport: Array<{
    property: string;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    avgVacancyDays: number;
  }>;
  maintenanceLog: Array<{
    date: string;
    property: string;
    unit: string;
    type: string;
    description: string;
    cost: number;
    status: string;
  }>;
  paymentHistory: Array<{
    date: string;
    tenant: string;
    unit: string;
    amount: number;
    type: string;
    method: string;
    status: string;
  }>;
}

// Mock data
const mockReportData: ReportData = {
  financialSummary: {
    totalRevenue: 125000,
    totalExpenses: 45000,
    netIncome: 80000,
    profitMargin: 64,
    occupancyRevenue: 118750,
    vacancyLoss: 6250
  },
  rentRoll: [
    {
      property: 'Sunset Apartments',
      unit: 'A-101',
      tenant: 'John Smith',
      monthlyRent: 3200,
      status: 'Current',
      leaseEnd: '2024-06-01',
      balance: 0
    },
    {
      property: 'Oak Grove Condos',
      unit: 'B-205',
      tenant: 'Sarah Johnson',
      monthlyRent: 2800,
      status: 'Late',
      leaseEnd: '2024-09-01',
      balance: -150
    },
    {
      property: 'Sunset Apartments',
      unit: 'C-302',
      tenant: 'Mike Wilson',
      monthlyRent: 3000,
      status: 'Current',
      leaseEnd: '2024-04-01',
      balance: 0
    }
  ],
  vacancyReport: [
    {
      property: 'Sunset Apartments',
      totalUnits: 24,
      occupiedUnits: 22,
      vacantUnits: 2,
      occupancyRate: 91.7,
      avgVacancyDays: 15
    },
    {
      property: 'Oak Grove Condos',
      totalUnits: 18,
      occupiedUnits: 16,
      vacantUnits: 2,
      occupancyRate: 88.9,
      avgVacancyDays: 22
    }
  ],
  maintenanceLog: [
    {
      date: '2024-01-15',
      property: 'Sunset Apartments',
      unit: 'A-101',
      type: 'Plumbing',
      description: 'Kitchen faucet repair',
      cost: 125,
      status: 'Completed'
    },
    {
      date: '2024-01-12',
      property: 'Oak Grove Condos',
      unit: 'B-205',
      type: 'HVAC',
      description: 'Heating system maintenance',
      cost: 350,
      status: 'Completed'
    }
  ],
  paymentHistory: [
    {
      date: '2024-01-01',
      tenant: 'John Smith',
      unit: 'A-101',
      amount: 3200,
      type: 'Rent',
      method: 'ACH',
      status: 'Paid'
    },
    {
      date: '2024-01-01',
      tenant: 'Mike Wilson',
      unit: 'C-302',
      amount: 3000,
      type: 'Rent',
      method: 'Check',
      status: 'Paid'
    }
  ]
};

// Chart data
const revenueData = [
  { month: 'Jan', revenue: 118750, expenses: 42000, netIncome: 76750 },
  { month: 'Feb', revenue: 125000, expenses: 45000, netIncome: 80000 },
  { month: 'Mar', revenue: 122500, expenses: 41000, netIncome: 81500 },
  { month: 'Apr', revenue: 127000, expenses: 46000, netIncome: 81000 },
  { month: 'May', revenue: 124000, expenses: 43000, netIncome: 81000 },
  { month: 'Jun', revenue: 125000, expenses: 45000, netIncome: 80000 }
];

const occupancyTrendData = [
  { month: 'Jan', rate: 89.2 },
  { month: 'Feb', rate: 91.7 },
  { month: 'Mar', rate: 88.9 },
  { month: 'Apr', rate: 92.1 },
  { month: 'May', rate: 90.5 },
  { month: 'Jun', rate: 91.0 }
];

const expenseBredownData = [
  { name: 'Maintenance', value: 18000, color: '#EF4444' },
  { name: 'Insurance', value: 12000, color: '#F59E0B' },
  { name: 'Property Tax', value: 8000, color: '#10B981' },
  { name: 'Management', value: 4500, color: '#3B82F6' },
  { name: 'Utilities', value: 2500, color: '#8B5CF6' }
];

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

export function Reports() {
  const [reportData] = useState(mockReportData);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleExport = (type: string, format: string) => {
    console.log(`Exporting ${type} as ${format}`);
    // Implementation would go here
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
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
            <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Reports & Analytics</h1>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <Crown className="h-3 w-3 mr-1" />
              Business Intelligence
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive reporting and data analytics for your property portfolio
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="sunset">Sunset Apartments</SelectItem>
              <SelectItem value="oakgrove">Oak Grove Condos</SelectItem>
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(reportData.financialSummary.totalRevenue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% vs last month
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(reportData.financialSummary.netIncome / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {reportData.financialSummary.profitMargin}% profit margin
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">91.0%</p>
                <Progress value={91.0} className="mt-2" />
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">95.2%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Excellent
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Report Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Overview Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue & Expenses Overview</CardTitle>
                  <CardDescription>Monthly financial performance trends</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending Up
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleExport('revenue', 'pdf')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                    <Line 
                      type="monotone" 
                      dataKey="netIncome" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Net Income"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Occupancy Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Trend</CardTitle>
                  <CardDescription>Monthly occupancy rate performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={occupancyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy Rate']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>Monthly expense categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={expenseBredownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseBredownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {expenseBredownData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-600">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Comprehensive financial overview and metrics</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('financial', 'excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-green-800">Revenue</h3>
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      ${reportData.financialSummary.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      Occupancy: ${reportData.financialSummary.occupancyRevenue.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-red-800">Expenses</h3>
                      <Calculator className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-900">
                      ${reportData.financialSummary.totalExpenses.toLocaleString()}
                    </p>
                    <p className="text-sm text-red-700 mt-2">
                      Vacancy Loss: ${reportData.financialSummary.vacancyLoss.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-blue-800">Net Income</h3>
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      ${reportData.financialSummary.netIncome.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      Margin: {reportData.financialSummary.profitMargin}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="occupancy" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vacancy Report</CardTitle>
                  <CardDescription>Property occupancy and vacancy analysis</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('vacancy', 'pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Total Units</TableHead>
                      <TableHead>Occupied</TableHead>
                      <TableHead>Vacant</TableHead>
                      <TableHead>Occupancy Rate</TableHead>
                      <TableHead>Avg Vacancy Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.vacancyReport.map((property, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{property.property}</TableCell>
                        <TableCell>{property.totalUnits}</TableCell>
                        <TableCell>{property.occupiedUnits}</TableCell>
                        <TableCell>{property.vacantUnits}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{property.occupancyRate.toFixed(1)}%</span>
                            <Progress value={property.occupancyRate} className="w-20" />
                          </div>
                        </TableCell>
                        <TableCell>{property.avgVacancyDays} days</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Maintenance Log</CardTitle>
                  <CardDescription>Complete maintenance and repair history</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('maintenance', 'csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.maintenanceLog.map((request, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                        <TableCell>{request.property}</TableCell>
                        <TableCell>{request.unit}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.type}</Badge>
                        </TableCell>
                        <TableCell>{request.description}</TableCell>
                        <TableCell>${request.cost}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-50 text-green-700">
                            {request.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Detailed payment records and transaction history</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('payments', 'excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.paymentHistory.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{payment.tenant}</TableCell>
                        <TableCell>{payment.unit}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.type}</Badge>
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-50 text-green-700">
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
        </Tabs>
      </motion.div>
    </motion.div>
  );
} 