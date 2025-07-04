import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Upload,
  CreditCard,
  Banknote,
  Receipt,
  Send,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Activity,
  PieChart,
  BarChart3,
  RefreshCw,
  Bell,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  Zap,
  Shield,
  Award,
  Target,
  Bookmark,
  Tag,
  Flag,
  AlertCircle,
  Info,
  CheckSquare,
  Star,
  History,
  Archive,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  CreditCard as CreditCardIcon,
  Building,
  Wallet,
  Smartphone,
  Globe,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock payment data
const mockPayments = [
  {
    id: '1',
    tenant: { name: 'John Smith', email: 'john@example.com', avatar: '/api/placeholder/100/100' },
    unit: { number: 'A-101', property: 'Sunset Apartments' },
    amount: 3200,
    dueDate: '2024-02-01',
    paidDate: '2024-01-30',
    status: 'Paid',
    method: 'ACH Transfer',
    transactionId: 'TXN-001-2024',
    type: 'Rent',
    description: 'Monthly rent payment for February 2024',
    lateFee: 0,
    processingFee: 0,
    notes: 'Paid early via online portal',
    category: 'Rent',
    paymentSource: 'Tenant Portal',
    receiptSent: true,
    autoPayEnabled: true
  },
  {
    id: '2',
    tenant: { name: 'Sarah Johnson', email: 'sarah@example.com', avatar: '/api/placeholder/100/100' },
    unit: { number: 'B-205', property: 'Oak Grove Condos' },
    amount: 2800,
    dueDate: '2024-01-01',
    paidDate: null,
    status: 'Overdue',
    method: null,
    transactionId: null,
    type: 'Rent',
    description: 'Monthly rent payment for January 2024',
    lateFee: 150,
    processingFee: 0,
    notes: 'Payment reminder sent 3 times',
    category: 'Rent',
    paymentSource: null,
    receiptSent: false,
    autoPayEnabled: false
  },
  {
    id: '3',
    tenant: { name: 'Mike Wilson', email: 'mike@example.com', avatar: '/api/placeholder/100/100' },
    unit: { number: 'C-304', property: 'Pine Valley Apartments' },
    amount: 450,
    dueDate: '2024-01-15',
    paidDate: '2024-01-16',
    status: 'Paid Late',
    method: 'Credit Card',
    transactionId: 'TXN-003-2024',
    type: 'Utility',
    description: 'Water and sewage charges',
    lateFee: 25,
    processingFee: 15,
    notes: 'Paid 1 day late with late fee applied',
    category: 'Utilities',
    paymentSource: 'Phone Payment',
    receiptSent: true,
    autoPayEnabled: false
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export function Payments() {
  const [payments] = useState(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [dateRange, setDateRange] = useState('thisMonth');

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.unit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status.toLowerCase().includes(filterStatus);
    const matchesType = filterType === 'all' || payment.type.toLowerCase() === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCollected = payments.filter(p => p.status === 'Paid' || p.status === 'Paid Late')
    .reduce((sum, p) => sum + p.amount + p.lateFee + p.processingFee, 0);
  
  const totalOutstanding = payments.filter(p => p.status === 'Overdue' || p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0);
  
  const onTimePayments = payments.filter(p => p.status === 'Paid').length;
  const latePayments = payments.filter(p => p.status === 'Paid Late' || p.status === 'Overdue').length;
  const onTimeRate = payments.length > 0 ? (onTimePayments / payments.length) * 100 : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track payments, process transactions, and manage financial operations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
          <Button size="sm" className="btn-ormi">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">${totalCollected.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% vs last month
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
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">${totalOutstanding.toLocaleString()}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {latePayments} overdue
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                <p className="text-2xl font-bold text-gray-900">{onTimeRate.toFixed(1)}%</p>
                <Progress value={onTimeRate} className="mt-2" />
              </div>
              <Clock className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">2.3 days</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -0.5 days improved
                </p>
              </div>
              <Activity className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="pending">Pending</option>
                  <option value="late">Paid Late</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="rent">Rent</option>
                  <option value="utility">Utility</option>
                  <option value="deposit">Deposit</option>
                  <option value="fee">Fee</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisQuarter">This Quarter</option>
                  <option value="thisYear">This Year</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                  List
                </Button>
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                  Grid
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payments List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredPayments.map((payment) => (
          <PaymentItem key={payment.id} payment={payment} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function PaymentItem({ payment }: { payment: any }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-600';
      case 'Paid Late': return 'bg-yellow-600';
      case 'Overdue': return 'bg-red-600';
      case 'Pending': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'ACH Transfer': return <Building className="h-4 w-4" />;
      case 'Credit Card': return <CreditCard className="h-4 w-4" />;
      case 'Check': return <FileText className="h-4 w-4" />;
      case 'Cash': return <Banknote className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={payment.tenant.avatar} />
              <AvatarFallback>
                {payment.tenant.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{payment.tenant.name}</h3>
              <p className="text-sm text-gray-600">Unit {payment.unit.number} • {payment.unit.property}</p>
              <div className="flex items-center space-x-3 mt-1">
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
                <Badge variant="outline">{payment.type}</Badge>
                {payment.method && (
                  <div className="flex items-center text-sm text-gray-600">
                    {getMethodIcon(payment.method)}
                    <span className="ml-1">{payment.method}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-xl font-bold text-gray-900">${payment.amount.toLocaleString()}</p>
              {(payment.lateFee > 0 || payment.processingFee > 0) && (
                <p className="text-xs text-red-600">
                  +${(payment.lateFee + payment.processingFee).toLocaleString()} fees
                </p>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="text-sm font-medium">{new Date(payment.dueDate).toLocaleDateString()}</p>
              {payment.paidDate && (
                <p className="text-xs text-green-600">
                  Paid: {new Date(payment.paidDate).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {payment.status === 'Paid' && payment.receiptSent && (
                <Button variant="ghost" size="sm" title="Receipt Sent">
                  <Receipt className="h-4 w-4 text-green-600" />
                </Button>
              )}
              {payment.autoPayEnabled && (
                <Button variant="ghost" size="sm" title="Auto-Pay Enabled">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {payment.status === 'Overdue' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Payment is {Math.ceil((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 3600 * 24))} days overdue
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Tenant
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{payment.description}</span>
              {payment.transactionId && (
                <span className="text-xs text-gray-500">ID: {payment.transactionId}</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Less' : 'More'} Details
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Payment Source</p>
                <p className="font-medium">{payment.paymentSource || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-medium">{payment.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Late Fee</p>
                <p className="font-medium">${payment.lateFee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Processing Fee</p>
                <p className="font-medium">${payment.processingFee.toLocaleString()}</p>
              </div>
            </div>
            
            {payment.notes && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Notes</p>
                <p className="text-sm text-gray-700">{payment.notes}</p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Tenant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Payments;

export function Maintenance() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Maintenance</h1><p>Coming soon...</p></div>;
}

export function Reports() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Coming soon...</p></div>;
}

export function Settings() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Coming soon...</p></div>;
} 