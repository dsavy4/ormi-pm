import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Camera,
  FileText,
  Star,
  TrendingUp,
  Activity,
  Filter,
  Download,
  Send,
  MessageSquare,
  Shield,
  Zap,
  Award,
  Target,
  Building2,
  Home,
  Hammer,
  Lightbulb,
  Droplets,
  Thermometer,
  Wifi,
  Car,
  TreePine,
  Bed,
  Bath,
  ChefHat,
  Sofa,
  Tv,
  Lock,
  Key,
  Bell,
  Flag,
  Bookmark,
  Tag,
  Archive,
  RefreshCw,
  ExternalLink,
  History,
  Upload,
  Image,
  Paperclip,
  DollarSign,
  Receipt,
  CreditCard,
  Users,
  Settings,
  Navigation,
  Compass,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockRequests = [
  {
    id: '1',
    title: 'Leaky Kitchen Faucet',
    description: 'Kitchen faucet is dripping constantly and needs repair',
    priority: 'High',
    status: 'In Progress',
    category: 'Plumbing',
    submittedBy: { name: 'John Smith', phone: '(555) 123-4567', email: 'john@example.com' },
    unit: { number: 'A-101', property: 'Sunset Apartments' },
    submittedDate: '2024-01-25',
    scheduledDate: '2024-01-27',
    estimatedCost: 150,
    actualCost: 0,
    assignedTo: 'Mike Rodriguez - Plumber',
    notes: 'Tenant reports constant dripping. Scheduled for Saturday morning.',
    photos: ['/api/placeholder/300/200'],
    workOrder: 'WO-2024-001',
    vendor: 'City Plumbing Services',
    rating: 0,
    completionTime: null,
    warrantyPeriod: 90,
    tags: ['Urgent', 'Plumbing', 'Kitchen'],
    lastUpdate: '2024-01-26',
    statusHistory: [
      { date: '2024-01-25', status: 'Submitted', note: 'Request submitted by tenant' },
      { date: '2024-01-26', status: 'In Progress', note: 'Assigned to plumber' }
    ]
  },
  {
    id: '2',
    title: 'Broken Air Conditioning',
    description: 'AC unit not working in living room, no cold air',
    priority: 'High',
    status: 'Completed',
    category: 'HVAC',
    submittedBy: { name: 'Sarah Johnson', phone: '(555) 234-5678', email: 'sarah@example.com' },
    unit: { number: 'B-205', property: 'Oak Grove Condos' },
    submittedDate: '2024-01-20',
    scheduledDate: '2024-01-22',
    estimatedCost: 300,
    actualCost: 275,
    assignedTo: 'Tom Wilson - HVAC Technician',
    notes: 'Replaced faulty capacitor. System working normally.',
    photos: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
    workOrder: 'WO-2024-002',
    vendor: 'Climate Control Solutions',
    rating: 5,
    completionTime: 2.5,
    warrantyPeriod: 180,
    tags: ['HVAC', 'Climate Control', 'Completed'],
    lastUpdate: '2024-01-22',
    statusHistory: [
      { date: '2024-01-20', status: 'Submitted', note: 'Urgent AC repair request' },
      { date: '2024-01-21', status: 'In Progress', note: 'Technician scheduled' },
      { date: '2024-01-22', status: 'Completed', note: 'Capacitor replaced, system tested' }
    ]
  },
  {
    id: '3',
    title: 'Bathroom Light Fixture',
    description: 'Light fixture in master bathroom is flickering',
    priority: 'Medium',
    status: 'Pending',
    category: 'Electrical',
    submittedBy: { name: 'Mike Wilson', phone: '(555) 345-6789', email: 'mike@example.com' },
    unit: { number: 'C-304', property: 'Pine Valley Apartments' },
    submittedDate: '2024-01-28',
    scheduledDate: null,
    estimatedCost: 75,
    actualCost: 0,
    assignedTo: null,
    notes: 'Needs electrical inspection. Tenant reports intermittent flickering.',
    photos: [],
    workOrder: 'WO-2024-003',
    vendor: null,
    rating: 0,
    completionTime: null,
    warrantyPeriod: 60,
    tags: ['Electrical', 'Bathroom', 'Pending'],
    lastUpdate: '2024-01-28',
    statusHistory: [
      { date: '2024-01-28', status: 'Submitted', note: 'Electrical issue reported' }
    ]
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

export function Maintenance() {
  const [requests] = useState(mockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.unit.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status.toLowerCase().includes(filterStatus);
    const matchesPriority = filterPriority === 'all' || request.priority.toLowerCase() === filterPriority;
    const matchesCategory = filterCategory === 'all' || request.category.toLowerCase() === filterCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const inProgressRequests = requests.filter(r => r.status === 'In Progress').length;
  const completedRequests = requests.filter(r => r.status === 'Completed').length;
  const avgRating = requests.filter(r => r.rating > 0).reduce((sum, r) => sum + r.rating, 0) / requests.filter(r => r.rating > 0).length || 0;
  const totalCost = requests.reduce((sum, r) => sum + r.actualCost, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track maintenance requests, manage work orders, and coordinate repairs
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button size="sm" className="btn-ormi">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
              </div>
              <Wrench className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingRequests}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressRequests}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedRequests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
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
                    placeholder="Search requests..."
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
                  <option value="pending">Pending</option>
                  <option value="progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="appliance">Appliance</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Requests List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredRequests.map((request) => (
          <MaintenanceRequestCard key={request.id} request={request} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function MaintenanceRequestCard({ request }: { request: any }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-600';
      case 'In Progress': return 'bg-blue-600';
      case 'Pending': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Plumbing': return <Droplets className="h-5 w-5" />;
      case 'Electrical': return <Zap className="h-5 w-5" />;
      case 'HVAC': return <Thermometer className="h-5 w-5" />;
      case 'Appliance': return <Tv className="h-5 w-5" />;
      default: return <Wrench className="h-5 w-5" />;
    }
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
              {getCategoryIcon(request.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                <Badge className={getPriorityColor(request.priority)}>
                  {request.priority}
                </Badge>
                <Badge className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
                <Badge variant="outline">{request.category}</Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{request.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Unit {request.unit.number}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{request.submittedBy.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(request.submittedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right mr-4">
              <p className="text-sm text-gray-600">Work Order</p>
              <p className="text-sm font-medium">{request.workOrder}</p>
              {request.estimatedCost > 0 && (
                <p className="text-sm text-gray-600">
                  ${request.estimatedCost} estimated
                </p>
              )}
            </div>
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

        {request.assignedTo && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Assigned to: {request.assignedTo}
                </span>
                {request.scheduledDate && (
                  <span className="text-sm text-blue-600">
                    • Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {request.status === 'In Progress' && (
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              )}
            </div>
          </div>
        )}

        {request.status === 'Completed' && request.rating > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Completed • ${request.actualCost} total cost
                </span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < request.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {request.photos.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Camera className="h-4 w-4 mr-1" />
                  {request.photos.length} photos
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-1" />
                {request.notes ? 'Has notes' : 'No notes'}
              </div>
              {request.tags.length > 0 && (
                <div className="flex space-x-1">
                  {request.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {request.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{request.tags.length - 2} more
                    </Badge>
                  )}
                </div>
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
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{request.submittedBy.phone}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{request.submittedBy.email}</span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cost Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span>Estimated:</span>
                    <span>${request.estimatedCost}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Actual:</span>
                    <span>${request.actualCost}</span>
                  </p>
                  {request.vendor && (
                    <p className="flex justify-between">
                      <span>Vendor:</span>
                      <span>{request.vendor}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {request.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-700">{request.notes}</p>
              </div>
            )}

            {request.photos.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Photos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {request.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Request photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Tenant
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button size="sm" variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Maintenance; 