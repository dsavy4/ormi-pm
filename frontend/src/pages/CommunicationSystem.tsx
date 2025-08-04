import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Mail,
  Phone,
  Bell,
  Send,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Archive,
  Reply,
  Forward,
  Copy,
  Link,
  Download,
  Upload,
  Settings,
  Users,
  Calendar,
  MapPin,
  FileText,
  Image,
  Video,
  Mic,
  Paperclip,
  Smile,
  Send as SendIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Eye as EyeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Plus as PlusIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Star as StarIcon,
  Archive as ArchiveIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Copy as CopyIcon,
  Link as LinkIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  FileText as FileTextIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic as MicIcon,
  Paperclip as PaperclipIcon,
  Smile as SmileIcon,
  X,
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

interface Message {
  id: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  subject: string;
  content: string;
  sender: string;
  recipients: string[];
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  sentDate?: string;
  readDate?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  tags: string[];
  isTemplate: boolean;
  templateId?: string;
}

interface Notification {
  id: string;
  type: 'maintenance' | 'payment' | 'lease' | 'general' | 'urgent';
  title: string;
  message: string;
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'read';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentDate: string;
  readDate?: string;
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: {
    propertyId?: string;
    unitId?: string;
    tenantId?: string;
    amount?: number;
    dueDate?: string;
  };
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  category: string;
  subject: string;
  content: string;
  variables: Array<{
    name: string;
    description: string;
    example: string;
  }>;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

interface EscalationWorkflow {
  id: string;
  name: string;
  trigger: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  steps: Array<{
    order: number;
    action: string;
    recipient: string;
    delay: number; // in hours
    message: string;
  }>;
  isActive: boolean;
  createdAt: string;
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

export function CommunicationSystem() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // Mock data - replace with real API calls
  const messages: Message[] = [
    {
      id: '1',
      type: 'email',
      subject: 'Maintenance Update - Unit 101',
      content: 'Dear John, Your maintenance request for the kitchen sink has been completed. Please let us know if you need anything else.',
      sender: 'Sarah Johnson',
      recipients: ['john.smith@email.com'],
      status: 'read',
      priority: 'medium',
      category: 'Maintenance',
      sentDate: '2024-01-18T10:00:00Z',
      readDate: '2024-01-18T11:30:00Z',
      tags: ['maintenance', 'completed'],
      isTemplate: false,
    },
    {
      id: '2',
      type: 'sms',
      subject: 'Payment Reminder',
      content: 'Your rent payment of $2,500 is due in 3 days. Please ensure timely payment to avoid late fees.',
      sender: 'ORMI System',
      recipients: ['+1-555-0101'],
      status: 'delivered',
      priority: 'high',
      category: 'Payment',
      sentDate: '2024-01-17T09:00:00Z',
      tags: ['payment', 'reminder'],
      isTemplate: true,
      templateId: 'payment-reminder',
    },
    {
      id: '3',
      type: 'push',
      subject: 'New Maintenance Request',
      content: 'A new maintenance request has been submitted for Unit 205. Please review and assign a vendor.',
      sender: 'ORMI System',
      recipients: ['manager@ormi.com'],
      status: 'sent',
      priority: 'medium',
      category: 'Maintenance',
      sentDate: '2024-01-18T14:00:00Z',
      tags: ['maintenance', 'new-request'],
      isTemplate: false,
    },
  ];

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $2,500 received from John Smith for Unit 101',
      recipient: 'Sarah Johnson',
      status: 'read',
      priority: 'medium',
      sentDate: '2024-01-18T10:00:00Z',
      readDate: '2024-01-18T10:15:00Z',
      actionRequired: false,
      metadata: {
        propertyId: '1',
        unitId: '101',
        tenantId: '1',
        amount: 2500,
      },
    },
    {
      id: '2',
      type: 'maintenance',
      title: 'Maintenance Request',
      message: 'New maintenance request submitted for Unit 205 - Plumbing issue',
      recipient: 'David Rodriguez',
      status: 'delivered',
      priority: 'high',
      sentDate: '2024-01-18T14:00:00Z',
      actionRequired: true,
      actionUrl: '/maintenance/requests/123',
      metadata: {
        propertyId: '1',
        unitId: '205',
        tenantId: '2',
      },
    },
    {
      id: '3',
      type: 'lease',
      title: 'Lease Renewal',
      message: 'Lease for Unit 304 expires in 30 days. Please contact tenant for renewal.',
      recipient: 'Michael Chen',
      status: 'pending',
      priority: 'medium',
      sentDate: '2024-01-18T16:00:00Z',
      actionRequired: true,
      metadata: {
        propertyId: '2',
        unitId: '304',
        tenantId: '3',
        dueDate: '2024-02-17',
      },
    },
  ];

  const templates: CommunicationTemplate[] = [
    {
      id: '1',
      name: 'Payment Reminder',
      type: 'email',
      category: 'Payment',
      subject: 'Rent Payment Reminder - {PropertyName}',
      content: 'Dear {TenantName},\n\nThis is a friendly reminder that your rent payment of ${Amount} for {PropertyName} - Unit {UnitNumber} is due on {DueDate}.\n\nPlease ensure timely payment to avoid any late fees.\n\nThank you,\n{PropertyManager}',
      variables: [
        { name: 'TenantName', description: 'Tenant full name', example: 'John Smith' },
        { name: 'PropertyName', description: 'Property name', example: 'Sunset Apartments' },
        { name: 'UnitNumber', description: 'Unit number', example: '101' },
        { name: 'Amount', description: 'Rent amount', example: '2500' },
        { name: 'DueDate', description: 'Payment due date', example: 'January 1, 2024' },
        { name: 'PropertyManager', description: 'Property manager name', example: 'Sarah Johnson' },
      ],
      usageCount: 45,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastUpdated: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Maintenance Update',
      type: 'sms',
      category: 'Maintenance',
      subject: 'Maintenance Update',
      content: 'Hi {TenantName}, your maintenance request for {Issue} has been {Status}. {AdditionalInfo}',
      variables: [
        { name: 'TenantName', description: 'Tenant first name', example: 'John' },
        { name: 'Issue', description: 'Maintenance issue', example: 'kitchen sink leak' },
        { name: 'Status', description: 'Request status', example: 'completed' },
        { name: 'AdditionalInfo', description: 'Additional information', example: 'Please let us know if you need anything else.' },
      ],
      usageCount: 23,
      isActive: true,
      createdAt: '2024-01-05T00:00:00Z',
      lastUpdated: '2024-01-10T14:00:00Z',
    },
  ];

  const escalationWorkflows: EscalationWorkflow[] = [
    {
      id: '1',
      name: 'Payment Overdue Escalation',
      trigger: 'payment_overdue',
      conditions: [
        { field: 'payment_status', operator: 'equals', value: 'overdue' },
        { field: 'days_overdue', operator: 'greater_than', value: '7' },
      ],
      steps: [
        {
          order: 1,
          action: 'send_email',
          recipient: 'tenant',
          delay: 0,
          message: 'Payment overdue reminder email',
        },
        {
          order: 2,
          action: 'send_sms',
          recipient: 'tenant',
          delay: 24,
          message: 'Payment overdue SMS reminder',
        },
        {
          order: 3,
          action: 'notify_manager',
          recipient: 'property_manager',
          delay: 48,
          message: 'Payment escalation to manager',
        },
        {
          order: 4,
          action: 'send_legal_notice',
          recipient: 'tenant',
          delay: 72,
          message: 'Legal notice of overdue payment',
        },
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-600" />;
      case 'sms':
        return <Phone className="h-5 w-5 text-green-600" />;
      case 'push':
        return <Bell className="h-5 w-5 text-purple-600" />;
      case 'in-app':
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Edit className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary"><Send className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="text-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'read':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Read</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="text-blue-600">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="text-orange-600">High</Badge>;
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'maintenance':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'lease':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Communication System</h1>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <MessageSquare className="h-3 w-3 mr-1" />
              Multi-Channel
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage messages, notifications, and communication workflows
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" className="btn-ormi" onClick={() => setShowComposeDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <Input
                      placeholder="Search messages..."
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
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="in-app">In-App</SelectItem>
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">&nbsp;</label>
                    <div className="text-sm text-gray-500">
                      {messages.length} messages
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages List */}
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getMessageIcon(message.type)}
                            <div>
                              <div className="font-medium">{message.subject}</div>
                              <div className="text-sm text-gray-500">
                                To: {message.recipients.join(', ')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {message.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(message.status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(message.priority)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(message.sentDate || '')}</div>
                            {message.readDate && (
                              <div className="text-gray-500">
                                Read: {formatDate(message.readDate)}
                              </div>
                            )}
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
                              <DropdownMenuItem onClick={() => setSelectedMessage(message)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Reply className="mr-2 h-4 w-4" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="mr-2 h-4 w-4" />
                                Forward
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{notification.title}</h4>
                            {getPriorityBadge(notification.priority)}
                            {notification.actionRequired && (
                              <Badge variant="destructive">Action Required</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>To: {notification.recipient}</span>
                            <span>Sent: {formatDate(notification.sentDate)}</span>
                            {notification.readDate && (
                              <span>Read: {formatDate(notification.readDate)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(notification.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                            {notification.actionUrl && (
                              <DropdownMenuItem>
                                <Link className="mr-2 h-4 w-4" />
                                Take Action
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Communication Templates</h3>
              <Button onClick={() => setShowTemplateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.category}</CardDescription>
                      </div>
                      <Badge variant={template.isActive ? 'default' : 'outline'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subject</label>
                      <p className="text-sm">{template.subject}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Content Preview</label>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Usage Count</span>
                      <span className="text-sm font-medium">{template.usageCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Variables</span>
                      <span className="text-sm font-medium">{template.variables.length}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Escalation Workflows</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>

            <div className="space-y-4">
              {escalationWorkflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{workflow.name}</CardTitle>
                        <CardDescription>Trigger: {workflow.trigger}</CardDescription>
                      </div>
                      <Badge variant={workflow.isActive ? 'default' : 'outline'}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Conditions</h4>
                        <div className="space-y-2">
                          {workflow.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{condition.field}</span>
                              <span>{condition.operator}</span>
                              <span className="text-gray-600">{condition.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">Escalation Steps</h4>
                        <div className="space-y-2">
                          {workflow.steps.map((step) => (
                            <div key={step.order} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{step.order}</span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{step.action}</div>
                                <div className="text-sm text-gray-500">
                                  To: {step.recipient} • Delay: {step.delay}h
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Message Details Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Message Details</DialogTitle>
                  {selectedMessage && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedMessage.subject}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMessage(null)}
                className="h-10 w-10 p-0 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md hover:bg-background/90 transition-all duration-200 hover:scale-105"
              >
                <X className="h-5 w-5 text-foreground/80 hover:text-foreground transition-colors" />
              </Button>
            </div>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedMessage.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <div className="mt-1">{getPriorityBadge(selectedMessage.priority)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sender</label>
                  <p className="font-medium">{selectedMessage.sender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Recipients</label>
                  <p className="font-medium">{selectedMessage.recipients.join(', ')}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Content</label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMessage.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline" className="flex-1">
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </Button>
                <Button className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Resend
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 