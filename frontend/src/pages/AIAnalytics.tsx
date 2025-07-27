import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Home,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap,
  Sparkles,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Star,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye as EyeIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  MoreHorizontal as MoreHorizontalIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
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
  Camera as CameraIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic as MicIcon,
  Paperclip as PaperclipIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
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
  Plus as PlusIcon,
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

// Charts
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  category: string;
  actionRequired: boolean;
  estimatedValue?: number;
  timeframe: string;
  createdAt: string;
}

interface MarketAnalysis {
  propertyType: string;
  currentRent: number;
  marketRent: number;
  difference: number;
  percentageChange: number;
  recommendation: 'increase' | 'decrease' | 'maintain';
  confidence: number;
}

interface PredictiveMetric {
  metric: string;
  currentValue: number;
  predictedValue: number;
  change: number;
  confidence: number;
  timeframe: string;
}

interface ROIAnalysis {
  propertyId: string;
  propertyName: string;
  totalInvestment: number;
  annualRevenue: number;
  annualExpenses: number;
  netIncome: number;
  roi: number;
  appreciation: number;
  totalReturn: number;
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

export function AIAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [insightFilter, setInsightFilter] = useState('all');

  // Mock data - replace with real API calls
  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Rent Increase Opportunity',
      description: 'Market analysis shows you can increase rent by 8% on 15 properties without affecting occupancy.',
      impact: 'high',
      confidence: 92,
      category: 'Revenue Optimization',
      actionRequired: true,
      estimatedValue: 45000,
      timeframe: 'Next 30 days',
      createdAt: '2024-01-18T10:00:00Z',
    },
    {
      id: '2',
      type: 'risk',
      title: 'Maintenance Cost Spike',
      description: 'Predictive analysis indicates 23% increase in maintenance costs over next quarter.',
      impact: 'medium',
      confidence: 87,
      category: 'Cost Management',
      actionRequired: true,
      estimatedValue: -12000,
      timeframe: 'Next 90 days',
      createdAt: '2024-01-17T14:30:00Z',
    },
    {
      id: '3',
      type: 'trend',
      title: 'Occupancy Rate Trend',
      description: 'Occupancy rates trending upward by 5% over last 6 months. Consider expanding portfolio.',
      impact: 'high',
      confidence: 95,
      category: 'Market Analysis',
      actionRequired: false,
      timeframe: 'Next 6 months',
      createdAt: '2024-01-16T09:15:00Z',
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Vendor Performance',
      description: 'Switch to Elite Electrical for 15% cost savings and 40% faster response times.',
      impact: 'medium',
      confidence: 89,
      category: 'Operational Efficiency',
      actionRequired: true,
      estimatedValue: 8000,
      timeframe: 'Next 60 days',
      createdAt: '2024-01-15T16:45:00Z',
    },
  ];

  const marketAnalysis: MarketAnalysis[] = [
    {
      propertyType: '1 Bedroom Apartment',
      currentRent: 1800,
      marketRent: 1950,
      difference: 150,
      percentageChange: 8.3,
      recommendation: 'increase',
      confidence: 92,
    },
    {
      propertyType: '2 Bedroom Apartment',
      currentRent: 2400,
      marketRent: 2600,
      difference: 200,
      percentageChange: 8.3,
      recommendation: 'increase',
      confidence: 89,
    },
    {
      propertyType: '3 Bedroom Apartment',
      currentRent: 3200,
      marketRent: 3100,
      difference: -100,
      percentageChange: -3.1,
      recommendation: 'decrease',
      confidence: 85,
    },
    {
      propertyType: 'Studio',
      currentRent: 1400,
      marketRent: 1550,
      difference: 150,
      percentageChange: 10.7,
      recommendation: 'increase',
      confidence: 94,
    },
  ];

  const predictiveMetrics: PredictiveMetric[] = [
    {
      metric: 'Monthly Revenue',
      currentValue: 185000,
      predictedValue: 198000,
      change: 7.0,
      confidence: 94,
      timeframe: 'Next 30 days',
    },
    {
      metric: 'Occupancy Rate',
      currentValue: 91.25,
      predictedValue: 94.5,
      change: 3.6,
      confidence: 89,
      timeframe: 'Next 30 days',
    },
    {
      metric: 'Maintenance Costs',
      currentValue: 18500,
      predictedValue: 22700,
      change: 22.7,
      confidence: 87,
      timeframe: 'Next 30 days',
    },
    {
      metric: 'Tenant Satisfaction',
      currentValue: 4.2,
      predictedValue: 4.4,
      change: 4.8,
      confidence: 91,
      timeframe: 'Next 30 days',
    },
  ];

  const roiAnalysis: ROIAnalysis[] = [
    {
      propertyId: '1',
      propertyName: 'Sunset Apartments',
      totalInvestment: 2500000,
      annualRevenue: 720000,
      annualExpenses: 180000,
      netIncome: 540000,
      roi: 21.6,
      appreciation: 5.2,
      totalReturn: 26.8,
    },
    {
      propertyId: '2',
      propertyName: 'Downtown Office Tower',
      totalInvestment: 8000000,
      annualRevenue: 960000,
      annualExpenses: 240000,
      netIncome: 720000,
      roi: 9.0,
      appreciation: 3.8,
      totalReturn: 12.8,
    },
    {
      propertyId: '3',
      propertyName: 'Riverside Condos',
      totalInvestment: 3600000,
      annualRevenue: 1152000,
      annualExpenses: 288000,
      netIncome: 864000,
      roi: 24.0,
      appreciation: 6.5,
      totalReturn: 30.5,
    },
  ];

  const chartData = [
    { month: 'Jan', revenue: 185000, expenses: 45000, profit: 140000 },
    { month: 'Feb', revenue: 192000, expenses: 48000, profit: 144000 },
    { month: 'Mar', revenue: 198000, expenses: 52000, profit: 146000 },
    { month: 'Apr', revenue: 205000, expenses: 55000, profit: 150000 },
    { month: 'May', revenue: 212000, expenses: 58000, profit: 154000 },
    { month: 'Jun', revenue: 220000, expenses: 62000, profit: 158000 },
  ];

  const occupancyData = [
    { month: 'Jan', occupancy: 89.5, target: 92.0 },
    { month: 'Feb', occupancy: 90.2, target: 92.0 },
    { month: 'Mar', occupancy: 91.1, target: 92.0 },
    { month: 'Apr', occupancy: 91.8, target: 92.0 },
    { month: 'May', occupancy: 92.5, target: 92.0 },
    { month: 'Jun', occupancy: 93.2, target: 92.0 },
  ];

  const categoryData = [
    { name: 'Rent', value: 720000, color: '#3b82f6' },
    { name: 'Fees', value: 45000, color: '#10b981' },
    { name: 'Utilities', value: 28000, color: '#f59e0b' },
    { name: 'Other', value: 12000, color: '#8b5cf6' },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'trend':
        return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-blue-600">Low Impact</Badge>;
      default:
        return <Badge variant="outline">{impact}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Analytics</h1>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Predictive insights and business intelligence powered by AI
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="btn-ormi">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Intelligent recommendations and predictions
                </CardDescription>
              </div>
              <Select value={insightFilter} onValueChange={setInsightFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Insights</SelectItem>
                  <SelectItem value="opportunity">Opportunities</SelectItem>
                  <SelectItem value="risk">Risks</SelectItem>
                  <SelectItem value="trend">Trends</SelectItem>
                  <SelectItem value="recommendation">Recommendations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights
                .filter(insight => insightFilter === 'all' || insight.type === insightFilter)
                .map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <span className="font-semibold capitalize">{insight.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getImpactBadge(insight.impact)}
                        <Badge variant="outline">{insight.confidence}%</Badge>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{insight.category}</span>
                      <span>{insight.timeframe}</span>
                    </div>
                    
                    {insight.estimatedValue && (
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Estimated Value:</span>
                        <span className={`font-bold ${insight.estimatedValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(insight.estimatedValue))}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {insight.actionRequired && (
                        <Button size="sm" className="flex-1">
                          <Zap className="h-4 w-4 mr-2" />
                          Take Action
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Predictive Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {predictiveMetrics.map((metric) => (
          <Card key={metric.metric} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.metric.includes('Rate') || metric.metric.includes('Satisfaction')
                  ? `${metric.currentValue}%`
                  : formatCurrency(metric.currentValue)
                }
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className={`h-4 w-4 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(metric.change)}
                </span>
                <span className="text-xs text-gray-500">vs predicted</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Confidence</span>
                  <span>{metric.confidence}%</span>
                </div>
                <Progress value={metric.confidence} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metric.timeframe}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue with AI predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy vs Target */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy vs Target</CardTitle>
            <CardDescription>
              Current occupancy rates against targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Current Occupancy"
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1}
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Market Analysis */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Market Rent Analysis</CardTitle>
            <CardDescription>
              AI-powered rent optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Type</TableHead>
                  <TableHead>Current Rent</TableHead>
                  <TableHead>Market Rent</TableHead>
                  <TableHead>Difference</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketAnalysis.map((analysis) => (
                  <TableRow key={analysis.propertyType}>
                    <TableCell className="font-medium">{analysis.propertyType}</TableCell>
                    <TableCell>{formatCurrency(analysis.currentRent)}</TableCell>
                    <TableCell>{formatCurrency(analysis.marketRent)}</TableCell>
                    <TableCell>
                      <span className={analysis.difference > 0 ? 'text-green-600' : 'text-red-600'}>
                        {analysis.difference > 0 ? '+' : ''}{formatCurrency(analysis.difference)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={analysis.recommendation === 'increase' ? 'default' : 'destructive'}
                        className={analysis.recommendation === 'maintain' ? 'bg-gray-100 text-gray-800' : ''}
                      >
                        {analysis.recommendation.charAt(0).toUpperCase() + analysis.recommendation.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={analysis.confidence} className="w-16 h-2" />
                        <span className="text-sm">{analysis.confidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Rent
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* ROI Analysis */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>ROI Analysis</CardTitle>
            <CardDescription>
              Investment performance and return analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roiAnalysis.map((roi) => (
                <div key={roi.propertyId} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">{roi.propertyName}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Investment</span>
                      <span className="font-medium">{formatCurrency(roi.totalInvestment)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Annual Revenue</span>
                      <span className="font-medium">{formatCurrency(roi.annualRevenue)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Annual Expenses</span>
                      <span className="font-medium">{formatCurrency(roi.annualExpenses)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Net Income</span>
                      <span className="font-medium text-green-600">{formatCurrency(roi.netIncome)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">ROI</span>
                      <span className="font-bold text-green-600">{roi.roi.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Appreciation</span>
                      <span className="font-medium">{roi.appreciation.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Return</span>
                      <span className="font-bold text-blue-600">{roi.totalReturn.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Breakdown */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>
              Annual revenue by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Actionable insights for improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Increase Studio Rent</h4>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Market supports 10.7% rent increase on studio units
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance Cost Alert</h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    Expected 22.7% increase in maintenance costs next month
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Occupancy Trend</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Occupancy rates trending upward, consider expansion
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">Vendor Optimization</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Switch to Elite Electrical for 15% cost savings
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 