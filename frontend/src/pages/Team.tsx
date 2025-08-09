import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Grid3X3,
  User,
  Camera,
  Shield,
  DollarSign,
  CheckCircle2,
  Upload,
  Download,
  Eye,
  MoreHorizontal,
  HardDrive,
  BarChart3,
  AlertTriangle,
  Building,
  MapPin,
  Settings,
  Users,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin as LocationIcon,
  Star,
  Clock,
  FileText,
  Wrench,
  DollarSign as MoneyIcon,
  Scale,
  FolderOpen,
  Clock as TimeIcon,
  X,
  Loader2,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileSpreadsheet,
  Database,
  ChevronDown,
  RefreshCw,
  UserPlus,
  Trash2,
  Archive,
  Edit,
  UserCheck,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmationDialog as UnsavedChangesDialog } from '@/components/ui/confirmation-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { teamApi } from '@/lib/api';
import { getFileUrl } from '@/lib/utils';

// Types
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  bio?: string;
  department?: string;
  hireDate?: string;
  salary?: number;
  employmentStatus?: string;
  accessLevel?: string;
  canManageProperties?: boolean;
  canManageTenants?: boolean;
  canManageMaintenance?: boolean;
  canViewReports?: boolean;
  assignedProperties?: number;
  performanceScore?: number;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

interface StorageAnalytics {
  accountId: string;
  totalStorage: number;
  storageBreakdown: {
    teamMembers: number;
    properties: number;
    tenants: number;
    maintenance: number;
    financial: number;
    marketing: number;
    legal: number;
    templates: number;
    shared: number;
  };
  fileCounts: {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  };
  billingTier: 'basic' | 'professional' | 'enterprise';
  storageLimit: number;
  overageAmount: number;
  estimatedCost: number;
}

type ViewMode = 'grid' | 'list' | 'tile';
type SortOption = 'name-asc' | 'name-desc' | 'role-asc' | 'role-desc' | 'status-asc' | 'status-desc' | 'hireDate-asc' | 'hireDate-desc' | 'performance-asc' | 'performance-desc' | 'properties-asc' | 'properties-desc' | 'recent' | 'oldest';

interface ConfirmationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  type: 'destructive' | 'warning' | 'info';
}

// Wizard Steps Configuration
const TEAM_WIZARD_STEPS = [
  {
    id: 1,
    title: 'Personal Info',
    description: '',
    icon: User,
    schema: z.object({
      firstName: z.string().min(2).max(50),
      lastName: z.string().min(2).max(50),
      email: z.string().email(),
      phoneNumber: z.string().optional(),
    }),
  },
  {
    id: 2,
    title: 'Profile',
    description: '',
    icon: UserCheck,
    schema: z.object({
      bio: z.string().max(500).optional(),
      department: z.string().min(1),
      hireDate: z.string().min(1),
      employmentStatus: z.string().min(1),
    }),
  },
  {
    id: 3,
    title: 'Role & Access',
    description: '',
    icon: Shield,
    schema: z.object({
      role: z.string().min(1, 'Role is required'),
      accessLevel: z.string().min(1, 'Access level is required'),
      canManageProperties: z.boolean(),
      canManageTenants: z.boolean(),
      canManageMaintenance: z.boolean(),
      canViewReports: z.boolean(),
      canManageFinancials: z.boolean(),
      canManageTeam: z.boolean(),
      canAssignProperties: z.boolean(),
      canViewAnalytics: z.boolean(),
      // New advanced permissions
      canManageVendors: z.boolean(),
      canManageLeases: z.boolean(),
      canManageMarketing: z.boolean(),
      canManageLegal: z.boolean(),
      canManageSettings: z.boolean(),
      canExportData: z.boolean(),
      canImportData: z.boolean(),
      canManageTemplates: z.boolean(),
      canViewAuditLogs: z.boolean(),
      canManageIntegrations: z.boolean(),
    }),
  },
  {
    id: 4,
    title: 'Employment',
    description: '',
    icon: DollarSign,
    schema: z.object({
      salary: z.number().min(0, 'Salary must be positive').optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      address: z.string().optional(),
    }),
  },
  {
    id: 5,
    title: 'Review',
    description: '',
    icon: CheckCircle2,
    schema: z.object({
      assignedProperties: z.array(z.string()).min(1, 'At least one property must be assigned'),
    }),
  },
];

// Enhanced role definitions with detailed descriptions and permission presets
const ROLE_DEFINITIONS = {
  PROPERTY_MANAGER: {
    name: 'Property Manager',
    description: 'Full property management access with tenant and maintenance oversight',
    department: 'Property Management',
    permissions: {
      canManageProperties: true,
      canManageTenants: true,
      canManageMaintenance: true,
      canViewReports: true,
      canManageFinancials: false,
      canManageTeam: false,
      canAssignProperties: false,
      canViewAnalytics: true,
      canManageVendors: true,
      canManageLeases: true,
      canManageMarketing: false,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: true,
      canImportData: false,
      canManageTemplates: false,
      canViewAuditLogs: false,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Standard',
  },
  ASSISTANT_MANAGER: {
    name: 'Assistant Manager',
    description: 'Limited property access with no financial data access',
    department: 'Property Management',
    permissions: {
      canManageProperties: true,
      canManageTenants: true,
      canManageMaintenance: true,
      canViewReports: true,
      canManageFinancials: false,
      canManageTeam: false,
      canAssignProperties: false,
      canViewAnalytics: false,
      canManageVendors: true,
      canManageLeases: false,
      canManageMarketing: false,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: false,
      canImportData: false,
      canManageTemplates: false,
      canViewAuditLogs: false,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Basic',
  },
  MAINTENANCE_STAFF: {
    name: 'Maintenance Staff',
    description: 'Maintenance and vendor management with limited property access',
    department: 'Maintenance',
    permissions: {
      canManageProperties: false,
      canManageTenants: false,
      canManageMaintenance: true,
      canViewReports: true,          // ✅ ADDED - Should see maintenance reports
      canManageFinancials: false,
      canManageTeam: false,
      canAssignProperties: false,
      canViewAnalytics: false,
      canManageVendors: true,
      canManageLeases: false,
      canManageMarketing: false,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: true,           // ✅ ADDED - Should export maintenance data
      canImportData: false,
      canManageTemplates: false,
      canViewAuditLogs: true,        // ✅ ADDED - Should see maintenance audit logs
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Basic',
  },
  ACCOUNTING_STAFF: {
    name: 'Accounting Staff',
    description: 'Financial data and reporting access with limited property management',
    department: 'Accounting',
    permissions: {
      canManageProperties: false,
      canManageTenants: false,
      canManageMaintenance: false,
      canViewReports: true,
      canManageFinancials: true,
      canManageTeam: false,
      canAssignProperties: false,
      canViewAnalytics: true,
      canManageVendors: false,
      canManageLeases: false,
      canManageMarketing: false,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: true,
      canImportData: false,
      canManageTemplates: false,
      canViewAuditLogs: false,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Standard',
  },
  LEASING_AGENT: {
    name: 'Leasing Agent',
    description: 'Tenant management and leasing operations only',
    department: 'Leasing',
    permissions: {
      canManageProperties: false,
      canManageTenants: true,
      canManageMaintenance: false,
      canViewReports: true,
      canManageFinancials: false,
      canManageTeam: false,
      canAssignProperties: false,
      canViewAnalytics: false,
      canManageVendors: false,
      canManageLeases: true,
      canManageMarketing: false,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: false,
      canImportData: false,
      canManageTemplates: false,
      canViewAuditLogs: false,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Basic',
  },
  REGIONAL_MANAGER: {
    name: 'Regional Manager',
    description: 'Multi-property oversight with team management capabilities',
    department: 'Property Management',
    permissions: {
      canManageProperties: true,
      canManageTenants: true,
      canManageMaintenance: true,
      canViewReports: true,
      canManageFinancials: true,
      canManageTeam: true,
      canAssignProperties: true,
      canViewAnalytics: true,
      canManageVendors: true,
      canManageLeases: true,
      canManageMarketing: false,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: true,
      canImportData: true,
      canManageTemplates: false,
      canViewAuditLogs: true,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Advanced',
  },
  SENIOR_MANAGER: {
    name: 'Senior Manager',
    description: 'Advanced permissions and comprehensive system access',
    department: 'Property Management',
    permissions: {
      canManageProperties: true,
      canManageTenants: true,
      canManageMaintenance: true,
      canViewReports: true,
      canManageFinancials: true,
      canManageTeam: true,
      canAssignProperties: true,
      canViewAnalytics: true,
      canManageVendors: true,
      canManageLeases: true,
      canManageMarketing: true,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: true,
      canImportData: true,
      canManageTemplates: true,
      canViewAuditLogs: true,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Advanced',
  },
  FINANCIAL_CONTROLLER: {
    name: 'Financial Controller',
    description: 'Complete financial oversight and reporting capabilities',
    department: 'Accounting',
    permissions: {
      canManageProperties: false,
      canManageTenants: false,
      canManageMaintenance: false,
      canViewReports: true,
      canManageFinancials: true,
      canManageTeam: false,
      canAssignProperties: false,
      canViewAnalytics: true,
      canManageVendors: false,
      canManageLeases: false,
      canManageMarketing: false,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: true,
      canImportData: true,
      canManageTemplates: false,
      canViewAuditLogs: true,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Advanced',
  },
  LEGAL_ADVISOR: {
    name: 'Legal Advisor',
    description: 'Legal document management and compliance oversight',
    department: 'Administration',
    permissions: {
      canManageProperties: false,
      canManageTenants: false,
      canManageMaintenance: false,
      canViewReports: true,
      canManageFinancials: false,
      canManageTeam: false,
      canAssignProperties: false,
      canViewAnalytics: false,
      canManageVendors: false,
      canManageLeases: true,
      canManageMarketing: false,
      canManageLegal: true,
      canManageSettings: false,
      canExportData: true,
      canImportData: false,
      canManageTemplates: true,
      canViewAuditLogs: true,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Standard',
  },
  MARKETING_SPECIALIST: {
    name: 'Marketing Specialist',
    description: 'Marketing and tenant acquisition focused role',
    department: 'Leasing',
    permissions: {
      canManageProperties: false,
      canManageTenants: false,
      canManageMaintenance: false,
      canViewReports: true,
      canManageFinancials: false,
      canManageTeam: false,
      canAssignProperties: false,
      canViewAnalytics: true,
      canManageVendors: false,
      canManageLeases: false,
      canManageMarketing: true,
      canManageLegal: false,
      canManageSettings: false,
      canExportData: true,
      canImportData: false,
      canManageTemplates: true,
      canViewAuditLogs: false,
      canManageIntegrations: false,
    },
    defaultAccessLevel: 'Standard',
  },
  SYSTEM_ADMINISTRATOR: {
    name: 'System Administrator',
    description: 'Complete system access and configuration management',
    department: 'Administration',
    permissions: {
      canManageProperties: true,
      canManageTenants: true,
      canManageMaintenance: true,
      canViewReports: true,
      canManageFinancials: true,
      canManageTeam: true,
      canAssignProperties: true,
      canViewAnalytics: true,
      canManageVendors: true,
      canManageLeases: true,
      canManageMarketing: true,
      canManageLegal: true,
      canManageSettings: true,
      canExportData: true,
      canImportData: true,
      canManageTemplates: true,
      canViewAuditLogs: true,
      canManageIntegrations: true,
    },
    defaultAccessLevel: 'Admin',
  },
};

// Department to roles mapping for filtering
const DEPARTMENT_ROLES_MAP = {
  'Property Management': ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'REGIONAL_MANAGER', 'SENIOR_MANAGER'],
  'Maintenance': ['MAINTENANCE_STAFF'],
  'Accounting': ['ACCOUNTING_STAFF', 'FINANCIAL_CONTROLLER'],
  'Leasing': ['LEASING_AGENT', 'MARKETING_SPECIALIST'],
  'Administration': ['LEGAL_ADVISOR', 'SYSTEM_ADMINISTRATOR'],
};

// Form schemas
const teamMemberFormSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500).optional(),
  department: z.string().min(1),
  hireDate: z.string().min(1),
  employmentStatus: z.string().min(1),
  role: z.string().min(1),
  accessLevel: z.string().min(1),
  canManageProperties: z.boolean(),
  canManageTenants: z.boolean(),
  canManageMaintenance: z.boolean(),
  canViewReports: z.boolean(),
  canManageFinancials: z.boolean(),
  canManageTeam: z.boolean(),
  canAssignProperties: z.boolean(),
  canViewAnalytics: z.boolean(),
  // New advanced permissions
  canManageVendors: z.boolean(),
  canManageLeases: z.boolean(),
  canManageMarketing: z.boolean(),
  canManageLegal: z.boolean(),
  canManageSettings: z.boolean(),
  canExportData: z.boolean(),
  canImportData: z.boolean(),
  canManageTemplates: z.boolean(),
  canViewAuditLogs: z.boolean(),
  canManageIntegrations: z.boolean(),
  salary: z.number().min(0).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  address: z.string().optional(),
  assignedProperties: z.array(z.string()).optional(),
  avatar: z.any().optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberFormSchema>;

// Utility functions
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export default function Team() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showStorageAnalytics, setShowStorageAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    type: 'info',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamApi.getAll().then((res: any) => res.data),
  });

  const { data: storageAnalytics } = useQuery({
    queryKey: ['storage-analytics'],
    queryFn: () => teamApi.getStorageAnalytics().then((res: any) => res.data),
  });

  // Mutations
  const createTeamMemberMutation = useMutation({
    mutationFn: (data: any) => teamApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setShowAddSheet(false);
      toast({
        title: 'Success',
        description: 'Team member created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create team member',
        variant: 'destructive',
      });
    },
  });

  const handleViewModeChange = (value: string) => {
    if (value) setViewMode(value as ViewMode);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'PROPERTY_MANAGER': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'ASSISTANT_MANAGER': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'MAINTENANCE_STAFF': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'ACCOUNTING_STAFF': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'LEASING_AGENT': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'REGIONAL_MANAGER': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'SENIOR_MANAGER': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getRoleDisplayName = (roleEnum: string) => {
    switch (roleEnum) {
      case 'PROPERTY_MANAGER':
        return 'Property Manager';
      case 'ASSISTANT_MANAGER':
        return 'Assistant Manager';
      case 'MAINTENANCE_STAFF':
        return 'Maintenance Staff';
      case 'ACCOUNTING_STAFF':
        return 'Accounting Staff';
      case 'LEASING_AGENT':
        return 'Leasing Agent';
      case 'REGIONAL_MANAGER':
        return 'Regional Manager';
      case 'SENIOR_MANAGER':
        return 'Senior Manager';
      default:
        return roleEnum;
    }
  };

  const filteredTeamMembers = teamMembers.filter((member: TeamMember) => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAddTeamMember = () => {
    setShowAddSheet(true);
  };

  const handleCloseAddSheet = () => {
    setShowAddSheet(false);
  };

  // Empty state component
  if (teamMembers.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-16 items-center px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Staff - Team Management</h1>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="ml-auto flex items-center gap-2">
              <Button onClick={handleOpenAddTeamMember} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Team Member
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import Team
              </Button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-2xl mx-auto">
            {/* Icon */}
            <div className="relative inline-flex mb-6">
              <div className="p-6 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 rounded-full">
                <Users className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Build Your Dream Team
            </h2>

            {/* Description */}
            <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
              Start by adding your first team member. Manage roles, track performance, and streamline property assignments all in one place.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleOpenAddTeamMember} className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Team Member
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="h-5 w-5 mr-2" />
                Import Team
              </Button>
            </div>
          </div>

          {/* Feature Cards - Outside the constrained container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-6xl">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Track Performance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Monitor occupancy rates, response times, and tenant satisfaction with comprehensive analytics.
                </p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Assign Properties</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Efficiently distribute properties and balance workloads with intelligent assignment algorithms.
                </p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Manage Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Control permissions and roles with granular access control and security features.
                </p>
              </Card>
            </div>
          </div>

        {/* Add Team Member Sheet */}
        <AddTeamMemberSheet 
          isOpen={showAddSheet} 
          onClose={handleCloseAddSheet} 
          onSuccess={() => {
            setShowAddSheet(false);
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
          }}
          createTeamMemberMutation={createTeamMemberMutation}
        />

        {/* Import Dialog */}
        <ImportTeamDialog 
          open={showImportDialog} 
          onOpenChange={setShowImportDialog}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Staff - Team Management</h1>
            </div>
            
            {/* Storage Usage Indicator */}
            {storageAnalytics && (
              <div className="flex items-center gap-2 ml-4">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(storageAnalytics.totalStorage)} / {formatBytes(storageAnalytics.storageLimit)}
                  </span>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${(storageAnalytics.totalStorage / storageAnalytics.storageLimit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleOpenAddTeamMember}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
            <Button variant="outline" onClick={() => setShowStorageAnalytics(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Storage Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        {/* Filters and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="PROPERTY_MANAGER">Property Manager</SelectItem>
                <SelectItem value="ASSISTANT_MANAGER">Assistant Manager</SelectItem>
                <SelectItem value="MAINTENANCE_STAFF">Maintenance Staff</SelectItem>
                <SelectItem value="ACCOUNTING_STAFF">Accounting Staff</SelectItem>
                <SelectItem value="LEASING_AGENT">Leasing Agent</SelectItem>
                <SelectItem value="REGIONAL_MANAGER">Regional Manager</SelectItem>
                <SelectItem value="SENIOR_MANAGER">Senior Manager</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* View Mode Toggle */}
          <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tile" aria-label="Tile view">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTeamMembers.length} of {teamMembers.length} staff members
          </p>
        </div>

        {/* Team Members Grid/List/Tile */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTeamMembers.map((member: TeamMember) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredTeamMembers.map((member: TeamMember) => (
              <TeamMemberListItem key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeamMembers.map((member: TeamMember) => (
              <TeamMemberTile key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>

      {/* Add Team Member Sheet */}
      <AddTeamMemberSheet 
        isOpen={showAddSheet} 
        onClose={handleCloseAddSheet} 
        onSuccess={() => {
          setShowAddSheet(false);
          queryClient.invalidateQueries({ queryKey: ['team-members'] });
        }}
        createTeamMemberMutation={createTeamMemberMutation}
      />

      {/* Storage Analytics Dialog */}
      <StorageAnalyticsDialog 
        open={showStorageAnalytics} 
        onOpenChange={setShowStorageAnalytics}
        analytics={storageAnalytics}
      />

      {/* Confirmation Dialog */}
      <UnsavedChangesDialog
        open={confirmationDialog.isOpen}
        onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmationDialog.title}
        description={confirmationDialog.message}
        confirmText={confirmationDialog.confirmText}
        onConfirm={confirmationDialog.onConfirm}
        type={confirmationDialog.type}
      />
    </div>
  );
}

// Team Member Card Component
const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getFileUrl(member.avatar || '')} alt={`${member.firstName} ${member.lastName}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {member.firstName[0]}{member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                  {member.role.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getStatusColor(member.status)}`}>
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Properties</span>
            <span className="font-medium">{member.assignedProperties || 0}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Performance</span>
            <span className="font-medium">{member.performanceScore || 0}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Team Member List Item Component
const TeamMemberListItem: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getFileUrl(member.avatar || '')} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {member.firstName[0]}{member.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
              <h3 className="font-semibold text-sm">{member.firstName} {member.lastName}</h3>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
            
            <div>
              <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                {member.role.replace('_', ' ')}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{member.department}</p>
            </div>
            
            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground">Properties: {member.assignedProperties || 0}</p>
              <p className="text-xs text-muted-foreground">Performance: {member.performanceScore || 0}%</p>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`text-xs ${getStatusColor(member.status)}`}>
                {member.status}
              </Badge>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Team Member Tile Component
const TeamMemberTile: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarImage src={getFileUrl(member.avatar || '')} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
              {member.firstName[0]}{member.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-semibold text-lg mb-2">{member.firstName} {member.lastName}</h3>
          <p className="text-sm text-muted-foreground mb-3">{member.email}</p>
          
          <div className="flex justify-center gap-2 mb-4">
            <Badge className={getRoleColor(member.role)}>
              {member.role.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={getStatusColor(member.status)}>
              {member.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{member.assignedProperties || 0}</p>
              <p className="text-xs text-muted-foreground">Properties</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{member.performanceScore || 0}%</p>
              <p className="text-xs text-muted-foreground">Performance</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add Team Member Sheet Component
interface AddTeamMemberSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  createTeamMemberMutation: any;
}

const AddTeamMemberSheet: React.FC<AddTeamMemberSheetProps> = ({ isOpen, onClose, onSuccess, createTeamMemberMutation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Role display function
  const getRoleDisplayName = (roleEnum: string) => {
    switch (roleEnum) {
      case 'PROPERTY_MANAGER':
        return 'Property Manager';
      case 'ASSISTANT_MANAGER':
        return 'Assistant Manager';
      case 'MAINTENANCE_STAFF':
        return 'Maintenance Staff';
      case 'ACCOUNTING_STAFF':
        return 'Accounting Staff';
      case 'LEASING_AGENT':
        return 'Leasing Agent';
      case 'REGIONAL_MANAGER':
        return 'Regional Manager';
      case 'SENIOR_MANAGER':
        return 'Senior Manager';
      case 'FINANCIAL_CONTROLLER':
        return 'Financial Controller';
      case 'LEGAL_ADVISOR':
        return 'Legal Advisor';
      case 'MARKETING_SPECIALIST':
        return 'Marketing Specialist';
      case 'SYSTEM_ADMINISTRATOR':
        return 'System Administrator';
      default:
        return roleEnum;
    }
  };

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberFormSchema),
    mode: 'onChange',
          defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        bio: '',
        department: '',
        hireDate: '',
        employmentStatus: '',
        role: '',
        accessLevel: 'Basic',
        canManageProperties: false,
        canManageTenants: false,
        canManageMaintenance: false,
        canViewReports: false,
        canManageFinancials: false,
        canManageTeam: false,
        canAssignProperties: false,
        canViewAnalytics: false,
        // New advanced permissions
        canManageVendors: false,
        canManageLeases: false,
        canManageMarketing: false,
        canManageLegal: false,
        canManageSettings: false,
        canExportData: false,
        canImportData: false,
        canManageTemplates: false,
        canViewAuditLogs: false,
        canManageIntegrations: false,
        salary: 0,
        emergencyContactName: '',
        emergencyContactPhone: '',
        address: '',
        assignedProperties: [],
        avatar: null,
      },
  });

  const formValues = form.watch();
  const formErrors = form.formState.errors;

  // Track form dirty state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Check if current step is valid
  const isCurrentStepValid = useMemo(() => {
    const currentStepConfig = TEAM_WIZARD_STEPS.find(step => step.id === currentStep);
    if (!currentStepConfig) return false;

    try {
      // Only validate the fields required for the current step
      const stepData: any = {};
      
      // Step 1: Personal Information
      if (currentStep === 1) {
        stepData.firstName = formValues.firstName;
        stepData.lastName = formValues.lastName;
        stepData.email = formValues.email;
        stepData.phoneNumber = formValues.phoneNumber;
      }
      
      // Step 2: Profile Photo
      if (currentStep === 2) {
        stepData.bio = formValues.bio;
        stepData.department = formValues.department;
        stepData.hireDate = formValues.hireDate;
        stepData.employmentStatus = formValues.employmentStatus;
      }
      
      // Step 3: Role & Access
      if (currentStep === 3) {
        stepData.role = formValues.role;
        stepData.accessLevel = formValues.accessLevel;
        stepData.canManageProperties = formValues.canManageProperties;
        stepData.canManageTenants = formValues.canManageTenants;
        stepData.canManageMaintenance = formValues.canManageMaintenance;
        stepData.canViewReports = formValues.canViewReports;
        stepData.canManageFinancials = formValues.canManageFinancials;
        stepData.canManageTeam = formValues.canManageTeam;
        stepData.canAssignProperties = formValues.canAssignProperties;
        stepData.canViewAnalytics = formValues.canViewAnalytics;
        // Add missing new permission fields
        stepData.canManageVendors = formValues.canManageVendors;
        stepData.canManageLeases = formValues.canManageLeases;
        stepData.canManageMarketing = formValues.canManageMarketing;
        stepData.canManageLegal = formValues.canManageLegal;
        stepData.canManageSettings = formValues.canManageSettings;
        stepData.canExportData = formValues.canExportData;
        stepData.canImportData = formValues.canImportData;
        stepData.canManageTemplates = formValues.canManageTemplates;
        stepData.canViewAuditLogs = formValues.canViewAuditLogs;
        stepData.canManageIntegrations = formValues.canManageIntegrations;
      }
      
      // Step 4: Employment Details
      if (currentStep === 4) {
        stepData.salary = formValues.salary;
        stepData.emergencyContactName = formValues.emergencyContactName;
        stepData.emergencyContactPhone = formValues.emergencyContactPhone;
        stepData.address = formValues.address;
      }
      
      // Step 5: Property Assignment & Review
      if (currentStep === 5) {
        stepData.assignedProperties = formValues.assignedProperties;
      }
      
      currentStepConfig.schema.parse(stepData);
      return true;
    } catch (error) {
      console.log(`Step ${currentStep} validation error:`, error);
      return false;
    }
  }, [currentStep, formValues]);

  // Check if entire form is valid for submission (all required fields across all steps)
  const isFormValidForSubmission = useMemo(() => {
    try {
      // Validate the complete form data using the main schema
      teamMemberFormSchema.parse(formValues);
      return true;
    } catch (error) {
      console.log('Form submission validation error:', error);
      return false;
    }
  }, [formValues]);

  // Get validation message for current step
  const getValidationMessage = () => {
    // For the final step, check if the entire form is valid for submission
    if (currentStep === TEAM_WIZARD_STEPS.length) {
      if (isFormValidForSubmission) {
        return `Step ${currentStep} of ${TEAM_WIZARD_STEPS.length} - All required fields completed`;
      } else {
        return `Step ${currentStep} of ${TEAM_WIZARD_STEPS.length} - Complete required fields to continue`;
      }
    }
    
    // For other steps, check current step validity
    if (isCurrentStepValid) {
      return `Step ${currentStep} of ${TEAM_WIZARD_STEPS.length} - All required fields completed`;
    } else {
      return `Step ${currentStep} of ${TEAM_WIZARD_STEPS.length} - Complete required fields to continue`;
    }
  };

  // Track form dirty state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Avatar upload handlers
  const onAvatarDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
      form.setValue('avatar', file);
      setIsDirty(true);
    }
  }, [form]);

  const {
    getRootProps: getAvatarRootProps,
    getInputProps: getAvatarInputProps,
    isDragActive: isAvatarDragActive,
  } = useDropzone({
    onDrop: onAvatarDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleNext = () => {
    if (isCurrentStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, TEAM_WIZARD_STEPS.length));
      // Smooth scroll to top of form content
      setTimeout(() => {
        // Try multiple selectors to find the scrollable container
        const selectors = [
          '[data-radix-scroll-area-viewport]',
          '.overflow-y-auto',
          '.scroll-area-viewport',
          '[role="dialog"] [data-radix-scroll-area-viewport]',
          '.sheet-content [data-radix-scroll-area-viewport]'
        ];
        
        let scrollableElement = null;
        for (const selector of selectors) {
          scrollableElement = document.querySelector(selector);
          if (scrollableElement) break;
        }
        
        if (scrollableElement) {
          // Force scroll to absolute top
          scrollableElement.scrollTo({ top: 0, behavior: 'smooth' });
          // Also try scrolling the parent if needed
          const parent = scrollableElement.parentElement;
          if (parent && parent.scrollTop !== undefined) {
            parent.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 150);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Smooth scroll to top of form content
    setTimeout(() => {
      // Try multiple selectors to find the scrollable container
      const selectors = [
        '[data-radix-scroll-area-viewport]',
        '.overflow-y-auto',
        '.scroll-area-viewport',
        '[role="dialog"] [data-radix-scroll-area-viewport]',
        '.sheet-content [data-radix-scroll-area-viewport]'
      ];
      
      let scrollableElement: Element | null = null;
      for (const selector of selectors) {
        scrollableElement = document.querySelector(selector);
        if (scrollableElement) break;
      }
      
              if (scrollableElement) {
          // Force scroll to absolute top with multiple attempts
          (scrollableElement as any).scrollTo({ top: 0, behavior: 'smooth' });
          
          // Also try immediate scroll to top
          setTimeout(() => {
            (scrollableElement as any).scrollTop = 0;
          }, 50);
          
          // Also try scrolling the parent if needed
          const parent = scrollableElement.parentElement;
          if (parent && (parent as any).scrollTop !== undefined) {
            (parent as any).scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              (parent as any).scrollTop = 0;
            }, 50);
          }
        }
        
        // Additional fallback: try to scroll the sheet content directly
        const sheetContent = document.querySelector('[data-radix-sheet-content]');
        if (sheetContent) {
          (sheetContent as any).scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            (sheetContent as any).scrollTop = 0;
          }, 50);
        }
        
        // Last resort: scroll the entire dialog
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          (dialog as any).scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            (dialog as any).scrollTop = 0;
          }, 50);
        }
        
        // Force scroll all possible scrollable elements
        const allScrollableElements = document.querySelectorAll('[data-radix-scroll-area-viewport], .overflow-y-auto, .scroll-area-viewport, [data-radix-sheet-content], [role="dialog"]');
        allScrollableElements.forEach((element) => {
          if ((element as any).scrollTop !== undefined) {
            (element as any).scrollTop = 0;
          }
        });
        
        // Direct approach: try to scroll the form content area specifically
        const formContentArea = document.querySelector('.sheet-content .overflow-y-auto, [data-radix-sheet-content] .overflow-y-auto');
        if (formContentArea) {
          (formContentArea as any).scrollTop = 0;
        }
        
        // Nuclear option: scroll everything that might be scrollable
        document.querySelectorAll('*').forEach((element) => {
          const style = window.getComputedStyle(element);
          if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
            if ((element as any).scrollTop !== undefined) {
              (element as any).scrollTop = 0;
            }
          }
        });
    }, 150);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
      // Smooth scroll to top of form content
      setTimeout(() => {
        // Try multiple selectors to find the scrollable container
        const selectors = [
          '[data-radix-scroll-area-viewport]',
          '.overflow-y-auto',
          '.scroll-area-viewport',
          '[role="dialog"] [data-radix-scroll-area-viewport]',
          '.sheet-content [data-radix-scroll-area-viewport]'
        ];
        
        let scrollableElement: Element | null = null;
        for (const selector of selectors) {
          scrollableElement = document.querySelector(selector);
          if (scrollableElement) break;
        }
        
        if (scrollableElement) {
          // Force scroll to absolute top with multiple attempts
          (scrollableElement as any).scrollTo({ top: 0, behavior: 'smooth' });
          
          // Also try immediate scroll to top
          setTimeout(() => {
            (scrollableElement as any).scrollTop = 0;
          }, 50);
          
          // Also try scrolling the parent if needed
          const parent = scrollableElement.parentElement;
          if (parent && (parent as any).scrollTop !== undefined) {
            (parent as any).scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              (parent as any).scrollTop = 0;
            }, 50);
          }
        }
        
        // Additional fallback: try to scroll the sheet content directly
        const sheetContent = document.querySelector('[data-radix-sheet-content]');
        if (sheetContent) {
          (sheetContent as any).scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            (sheetContent as any).scrollTop = 0;
          }, 50);
        }
        
        // Last resort: scroll the entire dialog
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          (dialog as any).scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            (dialog as any).scrollTop = 0;
          }, 50);
        }
        
        // Force scroll all possible scrollable elements
        const allScrollableElements = document.querySelectorAll('[data-radix-scroll-area-viewport], .overflow-y-auto, .scroll-area-viewport, [data-radix-sheet-content], [role="dialog"]');
        allScrollableElements.forEach((element) => {
          if ((element as any).scrollTop !== undefined) {
            (element as any).scrollTop = 0;
          }
        });
      }, 150);
    }
  };

  const handleEditStep = (stepId: number) => {
    setCurrentStep(stepId);
    // Smooth scroll to top of form content
    setTimeout(() => {
      // Try multiple selectors to find the scrollable container
      const selectors = [
        '[data-radix-scroll-area-viewport]',
        '.overflow-y-auto',
        '.scroll-area-viewport',
        '[role="dialog"] [data-radix-scroll-area-viewport]',
        '.sheet-content [data-radix-scroll-area-viewport]'
      ];
      
      let scrollableElement: Element | null = null;
      for (const selector of selectors) {
        scrollableElement = document.querySelector(selector);
        if (scrollableElement) break;
      }
      
      if (scrollableElement) {
        // Force scroll to absolute top with multiple attempts
        (scrollableElement as any).scrollTo({ top: 0, behavior: 'smooth' });
        
        // Also try immediate scroll to top
        setTimeout(() => {
          (scrollableElement as any).scrollTop = 0;
        }, 50);
        
        // Also try scrolling the parent if needed
        const parent = scrollableElement.parentElement;
        if (parent && (parent as any).scrollTop !== undefined) {
          (parent as any).scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            (parent as any).scrollTop = 0;
          }, 50);
        }
      }
      
      // Additional fallback: try to scroll the sheet content directly
      const sheetContent = document.querySelector('[data-radix-sheet-content]');
      if (sheetContent) {
        (sheetContent as any).scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          (sheetContent as any).scrollTop = 0;
        }, 50);
      }
      
      // Last resort: scroll the entire dialog
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        (dialog as any).scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          (dialog as any).scrollTop = 0;
        }, 50);
      }
      
      // Force scroll all possible scrollable elements
      const allScrollableElements = document.querySelectorAll('[data-radix-scroll-area-viewport], .overflow-y-auto, .scroll-area-viewport, [data-radix-sheet-content], [role="dialog"]');
      allScrollableElements.forEach((element) => {
        if ((element as any).scrollTop !== undefined) {
          (element as any).scrollTop = 0;
        }
      });
    }, 150);
  };

  const onSubmit = async (data: TeamMemberFormData) => {
    setIsSubmitting(true);
    try {
      await createTeamMemberMutation.mutateAsync(data);
      onSuccess();
      setCurrentStep(1);
      setIsDirty(false);
      setAvatarPreview('');
      form.reset();
    } catch (error) {
      console.error('Error creating team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedDialog(false);
    setCurrentStep(1);
    setIsDirty(false);
    setAvatarPreview('');
    form.reset();
    onClose();
  };

  const currentStepConfig = TEAM_WIZARD_STEPS.find(step => step.id === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TEAM_WIZARD_STEPS.length;

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
                              form.reset({
                          firstName: '',
                          lastName: '',
                          email: '',
                          phoneNumber: '',
                          bio: '',
                          department: '',
                          hireDate: '',
                          employmentStatus: '',
                          role: '',
                          accessLevel: 'Basic',
                          canManageProperties: false,
                          canManageTenants: false,
                          canManageMaintenance: false,
                          canViewReports: false,
                          canManageFinancials: false,
                          canManageTeam: false,
                          canAssignProperties: false,
                          canViewAnalytics: false,
                          // New advanced permissions
                          canManageVendors: false,
                          canManageLeases: false,
                          canManageMarketing: false,
                          canManageLegal: false,
                          canManageSettings: false,
                          canExportData: false,
                          canImportData: false,
                          canManageTemplates: false,
                          canViewAuditLogs: false,
                          canManageIntegrations: false,
                          salary: 0,
                          emergencyContactName: '',
                          emergencyContactPhone: '',
                          address: '',
                          assignedProperties: [],
                          avatar: null,
                        });
      setCurrentStep(1);
      setIsDirty(false);
      setAvatarPreview('');
    }
  }, [isOpen, form]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isDirty, handleClose]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="right" className="w-full sm:w-[45%] md:w-[40%] flex flex-col h-full p-0 gap-0">
                  {/* Header with Progress */}
        <div className="border-b bg-card">
          {/* Header */}
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Add New Team Member
            </SheetTitle>
          </SheetHeader>

          {/* Progress Indicator */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              {TEAM_WIZARD_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="relative">
                    <Button
                      type="button"
                      onClick={() => handleStepClick(step.id)}
                      disabled={step.id > currentStep}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 transform hover:scale-105 ${
                        step.id < currentStep 
                          ? 'bg-primary border-primary text-white cursor-pointer hover:bg-primary/90 shadow-lg shadow-primary/25' :
                        step.id === currentStep 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' :
                        'bg-card border-gray-300 text-gray-400 cursor-not-allowed hover:scale-100'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                      {step.id === currentStep && (
                        <div className="absolute -inset-2 rounded-full border-2 border-primary/20"></div>
                      )}
                    </Button>
                    
                    {/* Step label */}
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 text-center">
                      <div className={`text-xs font-medium transition-colors duration-200 ${
                        step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  
                  {index < TEAM_WIZARD_STEPS.length - 1 && (
                    <div className="flex-1 mx-4 mt-2">
                      <div className={`h-1 rounded-full transition-all duration-500 ease-in-out ${
                        step.id < currentStep 
                          ? 'bg-primary' 
                          : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Enhanced step info */}
            <div className="text-center mt-8">
              {/* Progress bar */}
              <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
                  style={{ width: `${(currentStep / TEAM_WIZARD_STEPS.length) * 100}%` }}
                />
                {/* Add subtle pulsing animation to the end of the progress bar */}
                <div 
                  className="absolute top-0 h-full w-4 bg-primary/30 rounded-full transition-all duration-500 ease-in-out animate-pulse"
                  style={{ 
                    left: `${Math.max(0, (currentStep / TEAM_WIZARD_STEPS.length) * 100 - 4)}%`,
                    opacity: currentStep < TEAM_WIZARD_STEPS.length ? 1 : 0
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Step {currentStep} of {TEAM_WIZARD_STEPS.length}</span>
                <span>{Math.round((currentStep / TEAM_WIZARD_STEPS.length) * 100)}% Complete</span>
              </div>
            </div>
          </div>
        </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Step Description */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">{currentStepConfig?.description}</p>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step1PersonalInfo form={form} formErrors={formErrors} formValues={formValues} />
                  </motion.div>
                )}
                
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step2ProfessionalDetails 
                      form={form} 
                      formErrors={formErrors} 
                      formValues={formValues}
                      avatarPreview={avatarPreview}
                      getAvatarRootProps={getAvatarRootProps}
                      getAvatarInputProps={getAvatarInputProps}
                      isAvatarDragActive={isAvatarDragActive}
                    />
                  </motion.div>
                )}
                
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step3RolePermissions form={form} formErrors={formErrors} formValues={formValues} />
                  </motion.div>
                )}
                
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step4EmploymentDetails form={form} formErrors={formErrors} formValues={formValues} />
                  </motion.div>
                )}
                
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step5PropertyAssignment form={form} formErrors={formErrors} formValues={formValues} getRoleDisplayName={getRoleDisplayName} onEditStep={handleEditStep} />
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="border-t bg-card p-6 flex-shrink-0 shadow-lg">
            {/* Validation Status - Full Width on Mobile */}
            {(!isCurrentStepValid || isCurrentStepValid) && !isLastStep && (
              <div className="mb-4">
                {!isCurrentStepValid && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">Complete required fields to continue</span>
                  </div>
                )}
                
                {isCurrentStepValid && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">Step completed</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={isFirstStep ? handleClose : handleBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-md"
                >
                  {isFirstStep ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                
                {isLastStep ? (
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting || !isFormValidForSubmission}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Create Team Member
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentStepValid}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onClose={() => setShowUnsavedDialog(false)}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to close?"
        confirmText="Close Without Saving"
        cancelText="Continue Editing"
        variant="warning"
      />
    </>
  );
};

// Step Components
interface StepProps {
  form: any;
  formErrors: any;
  formValues: TeamMemberFormData;
  getRoleDisplayName?: (roleEnum: string) => string;
}

const Step1PersonalInfo: React.FC<StepProps> = ({ form, formErrors, formValues }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
            <User className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Personal Information</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Let's start with the basic contact information for your new team member.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...form.register('firstName')}
            placeholder="e.g., John"
            className={`h-12 text-base transition-all duration-200 ${
              formErrors.firstName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
            }`}
          />
          {formErrors.firstName && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.firstName.message}
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...form.register('lastName')}
            placeholder="e.g., Doe"
            className={`h-12 text-base transition-all duration-200 ${
              formErrors.lastName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
            }`}
          />
          {formErrors.lastName && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.lastName.message}
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            {...form.register('email')}
            type="email"
            placeholder="e.g., john.doe@company.com"
            className={`h-12 text-base transition-all duration-200 ${
              formErrors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
            }`}
          />
          {formErrors.email && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.email.message}
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            {...form.register('phoneNumber')}
            placeholder="+1 (555) 123-4567"
            className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

const Step2ProfessionalDetails: React.FC<StepProps & {
  avatarPreview: string;
  getAvatarRootProps: any;
  getAvatarInputProps: any;
  isAvatarDragActive: boolean;
}> = ({ form, formErrors, formValues, avatarPreview, getAvatarRootProps, getAvatarInputProps, isAvatarDragActive }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
            <UserCheck className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">2</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Professional Details</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Add professional information, department assignment, and employment details.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <Label>Profile Photo</Label>
          <div
            {...getAvatarRootProps()}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
              isAvatarDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <input {...getAvatarInputProps()} />
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="h-32 w-32 rounded-full object-cover mb-4 shadow-md" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">Drag 'n' drop a profile photo here, or click to select one</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">(Max 5MB, JPG, PNG, GIF)</p>
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            {...form.register('bio')}
            placeholder="A brief professional summary..."
            className="min-h-[80px] resize-y transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 dark:border-gray-700 dark:focus:border-blue-500 dark:hover:border-gray-600"
          />
        </div>

        <div>
          <Label htmlFor="department">Department *</Label>
          <Select value={form.watch('department')} onValueChange={(value) => form.setValue('department', value)}>
            <SelectTrigger className={`h-12 text-base ${
              formErrors.department
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
            }`}>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Property Management">Property Management</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Accounting">Accounting</SelectItem>
              <SelectItem value="Leasing">Leasing</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.department && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.department.message}
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="hireDate">Hire Date *</Label>
          <DatePicker
            date={form.watch('hireDate') ? new Date(form.watch('hireDate')) : undefined}
            onDateChange={(date) => form.setValue('hireDate', date ? date.toISOString().split('T')[0] : '')}
            placeholder="Select hire date"
            className={`h-12 text-base ${
              formErrors.hireDate
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
            }`}
          />
          {formErrors.hireDate && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.hireDate.message}
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="employmentStatus">Employment Status *</Label>
          <Select value={form.watch('employmentStatus')} onValueChange={(value) => form.setValue('employmentStatus', value)}>
            <SelectTrigger className={`h-12 text-base ${
              formErrors.employmentStatus
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
            }`}>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Intern">Intern</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.employmentStatus && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.employmentStatus.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step3RolePermissions: React.FC<StepProps> = ({ form, formErrors, formValues }) => {
  const selectedRole = form.watch('role');
  const selectedDepartment = form.watch('department');
  const roleDefinition = selectedRole ? ROLE_DEFINITIONS[selectedRole as keyof typeof ROLE_DEFINITIONS] : null;

  // Get available roles based on selected department
  const getAvailableRoles = () => {
    console.log('getAvailableRoles called with selectedDepartment:', selectedDepartment);
    if (!selectedDepartment) {
      console.log('No department selected, returning all roles');
      return Object.keys(ROLE_DEFINITIONS);
    }
    const availableRoles = DEPARTMENT_ROLES_MAP[selectedDepartment as keyof typeof DEPARTMENT_ROLES_MAP] || [];
    console.log('Available roles for department', selectedDepartment, ':', availableRoles);
    return availableRoles;
  };

  // Get permissions that should be visible for the selected role
  const getVisiblePermissions = () => {
    if (!selectedRole || !ROLE_DEFINITIONS[selectedRole as keyof typeof ROLE_DEFINITIONS]) {
      return [];
    }
    
    // Show ALL permissions for transparency and flexibility
    // This allows users to see the complete permission system
    const allPermissions = [
      'canManageProperties',
      'canManageTenants', 
      'canManageMaintenance',
      'canManageVendors',
      'canManageFinancials',
      'canViewReports',
      'canViewAnalytics',
      'canViewAuditLogs',
      'canManageTeam',
      'canAssignProperties',
      'canManageSettings',
      'canManageIntegrations',
      'canManageLeases',
      'canManageMarketing',
      'canManageLegal',
      'canManageTemplates',
      'canExportData',
      'canImportData'
    ];
    
    return allPermissions;
  };

  // Determine if a permission is relevant for a role (even if not enabled by default)
  const isPermissionRelevantForRole = (role: string, permission: string) => {
    const roleDef = ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS];
    if (!roleDef) return false;
    
    // Define permission relevance by role type
    const relevanceMap: Record<string, string[]> = {
      // Property Management roles
      'PROPERTY_MANAGER': ['canManageProperties', 'canManageTenants', 'canManageMaintenance', 'canManageVendors', 'canManageLeases', 'canViewReports', 'canViewAnalytics', 'canExportData'],
      'ASSISTANT_MANAGER': ['canManageProperties', 'canManageTenants', 'canManageMaintenance', 'canManageVendors', 'canViewReports'],
      'REGIONAL_MANAGER': ['canManageProperties', 'canManageTenants', 'canManageMaintenance', 'canManageVendors', 'canManageLeases', 'canManageFinancials', 'canManageTeam', 'canAssignProperties', 'canViewReports', 'canViewAnalytics', 'canExportData', 'canImportData', 'canViewAuditLogs'],
      'SENIOR_MANAGER': ['canManageProperties', 'canManageTenants', 'canManageMaintenance', 'canManageVendors', 'canManageLeases', 'canManageFinancials', 'canManageTeam', 'canAssignProperties', 'canViewReports', 'canViewAnalytics', 'canManageMarketing', 'canExportData', 'canImportData', 'canManageTemplates', 'canViewAuditLogs'],
      
      // Maintenance role
      'MAINTENANCE_STAFF': ['canManageMaintenance', 'canManageVendors', 'canViewReports', 'canExportData', 'canViewAuditLogs'],
      
      // Accounting roles
      'ACCOUNTING_STAFF': ['canViewReports', 'canManageFinancials', 'canViewAnalytics', 'canExportData'],
      'FINANCIAL_CONTROLLER': ['canViewReports', 'canManageFinancials', 'canViewAnalytics', 'canExportData', 'canImportData', 'canViewAuditLogs'],
      
      // Leasing roles
      'LEASING_AGENT': ['canManageTenants', 'canManageLeases', 'canViewReports'],
      'MARKETING_SPECIALIST': ['canViewReports', 'canViewAnalytics', 'canManageMarketing', 'canExportData', 'canManageTemplates'],
      
      // Administration roles
      'LEGAL_ADVISOR': ['canViewReports', 'canManageLeases', 'canManageLegal', 'canExportData', 'canManageTemplates', 'canViewAuditLogs'],
      'SYSTEM_ADMINISTRATOR': Object.keys(ROLE_DEFINITIONS.PROPERTY_MANAGER.permissions), // All permissions
    };
    
    return relevanceMap[role]?.includes(permission) || false;
  };

  // Get permission category for grouping
  const getPermissionCategory = (permission: string) => {
    const categories: Record<string, string> = {
      // Core Management
      'canManageProperties': 'Core Management',
      'canManageTenants': 'Core Management',
      'canManageMaintenance': 'Core Management',
      'canManageVendors': 'Core Management',
      
      // Financial & Reporting
      'canManageFinancials': 'Financial & Reporting',
      'canViewReports': 'Financial & Reporting',
      'canViewAnalytics': 'Financial & Reporting',
      'canViewAuditLogs': 'Financial & Reporting',
      
      // Administrative
      'canManageTeam': 'Administrative',
      'canAssignProperties': 'Administrative',
      'canManageSettings': 'Administrative',
      'canManageIntegrations': 'Administrative',
      
      // Specialized Operations
      'canManageLeases': 'Specialized Operations',
      'canManageMarketing': 'Specialized Operations',
      'canManageLegal': 'Specialized Operations',
      'canManageTemplates': 'Specialized Operations',
      
      // Data Management
      'canExportData': 'Data Management',
      'canImportData': 'Data Management',
    };
    
    return categories[permission] || 'Other';
  };

  const handleRoleChange = (role: string) => {
    form.setValue('role', role);
    
    // Define ALL possible permission fields to ensure comprehensive reset
    const allPermissionFields = [
      'canManageProperties',
      'canManageTenants', 
      'canManageMaintenance',
      'canViewReports',
      'canManageFinancials',
      'canManageTeam',
      'canAssignProperties',
      'canViewAnalytics',
      'canManageVendors',
      'canManageLeases',
      'canManageMarketing',
      'canManageLegal',
      'canManageSettings',
      'canExportData',
      'canImportData',
      'canManageTemplates',
      'canViewAuditLogs',
      'canManageIntegrations'
    ];
    
    // Reset ALL permissions to false to ensure clean slate
    // This includes visible, invisible, and hidden permissions
    allPermissionFields.forEach(permissionField => {
      form.setValue(permissionField as any, false);
    });
    
    // Then apply role-based permission presets
    if (role && ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS]) {
      const preset = ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS];
      Object.entries(preset.permissions).forEach(([key, value]) => {
        form.setValue(key as any, value);
      });
      form.setValue('accessLevel', preset.defaultAccessLevel);
    }
  };

  // Clear role if department changes and current role is not available for new department
  // OR auto-select if only one role is available
  React.useEffect(() => {
    const currentRole = form.watch('role');
    const availableRoles = getAvailableRoles();
    
    if (selectedDepartment) {
      // If current role is not available for new department, clear it
      if (currentRole && !availableRoles.includes(currentRole)) {
        form.setValue('role', '');
        // Clear all permissions when role is cleared using the same comprehensive list
        const allPermissionFields = [
          'canManageProperties',
          'canManageTenants', 
          'canManageMaintenance',
          'canViewReports',
          'canManageFinancials',
          'canManageTeam',
          'canAssignProperties',
          'canViewAnalytics',
          'canManageVendors',
          'canManageLeases',
          'canManageMarketing',
          'canManageLegal',
          'canManageSettings',
          'canExportData',
          'canImportData',
          'canManageTemplates',
          'canViewAuditLogs',
          'canManageIntegrations'
        ];
        allPermissionFields.forEach(permissionField => {
          form.setValue(permissionField as any, false);
        });
        form.setValue('accessLevel', 'Basic');
      }
      
      // Auto-select if only one role is available and no role is currently selected
      if (availableRoles.length === 1 && !currentRole) {
        const singleRole = availableRoles[0];
        console.log('Auto-selecting single role:', singleRole);
        handleRoleChange(singleRole);
      }
    }
  }, [selectedDepartment, form]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
            <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Role & Permissions</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Assign a role and define access permissions for the team member.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Role Selection */}
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select value={form.watch('role')} onValueChange={handleRoleChange}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder={selectedDepartment ? `Select Role for ${selectedDepartment}` : "Select Role"} />
            </SelectTrigger>
            <SelectContent>
              {getAvailableRoles().map((roleKey) => {
                const roleDef = ROLE_DEFINITIONS[roleKey as keyof typeof ROLE_DEFINITIONS];
                return (
                  <SelectItem key={roleKey} value={roleKey}>
                    {roleDef.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {/* Department-Role Guidance */}
          {selectedDepartment && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {getAvailableRoles().length === 1 ? (
                  <>
                    <strong>Auto-selected:</strong> Only one role available for <strong>{selectedDepartment}</strong> department
                  </>
                ) : (
                  <>
                    Showing roles available for <strong>{selectedDepartment}</strong> department
                  </>
                )}
              </p>
            </div>
          )}
          
          {/* No Department Selected Warning */}
          {!selectedDepartment && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Please select a department first to see relevant roles
              </p>
            </div>
          )}
          
          {/* Role Description */}
          {roleDefinition && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">{roleDefinition.description}</p>
            </div>
          )}
        </div>

        {/* Access Level */}
        <div>
          <Label htmlFor="accessLevel">Access Level *</Label>
          <Select value={form.watch('accessLevel')} onValueChange={(value) => form.setValue('accessLevel', value)}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Select Access Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Basic">Basic - Limited access to assigned properties only</SelectItem>
              <SelectItem value="Standard">Standard - Access to all properties and basic reports</SelectItem>
              <SelectItem value="Advanced">Advanced - Full access with advanced analytics</SelectItem>
              <SelectItem value="Admin">Admin - Complete system access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Permission Groups */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Permissions</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Reset all permissions to false using comprehensive list
                const allPermissionFields = [
                  'canManageProperties',
                  'canManageTenants', 
                  'canManageMaintenance',
                  'canViewReports',
                  'canManageFinancials',
                  'canManageTeam',
                  'canAssignProperties',
                  'canViewAnalytics',
                  'canManageVendors',
                  'canManageLeases',
                  'canManageMarketing',
                  'canManageLegal',
                  'canManageSettings',
                  'canExportData',
                  'canImportData',
                  'canManageTemplates',
                  'canViewAuditLogs',
                  'canManageIntegrations'
                ];
                allPermissionFields.forEach(permissionField => {
                  form.setValue(permissionField as any, false);
                });
              }}
            >
              Clear All
            </Button>
          </div>

          {/* No Role Selected Message */}
          {!selectedRole && (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  Please select a role to see relevant permissions
                </p>
              </div>
            </div>
          )}

          {/* Dynamic Permission Categories */}
          {selectedRole && (() => {
            const visiblePermissions = getVisiblePermissions();
            const permissionGroups: Record<string, string[]> = {};
            
            // Group permissions by category
            visiblePermissions.forEach(permission => {
              const category = getPermissionCategory(permission);
              if (!permissionGroups[category]) {
                permissionGroups[category] = [];
              }
              permissionGroups[category].push(permission);
            });

            return Object.entries(permissionGroups).map(([category, permissions]) => {
              // Count permissions in this category that are relevant to the selected role
              const relevantPermissions = permissions.filter(permission => 
                isPermissionRelevantForRole(selectedRole, permission)
              );
              const hasRelevantPermissions = relevantPermissions.length > 0;
              
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{category}</h4>
                    {hasRelevantPermissions && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                        {relevantPermissions.length} relevant
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map(permission => {
                      const permissionLabels: Record<string, { label: string; description: string }> = {
                        canManageProperties: { label: 'Manage Properties', description: 'Property creation, editing, and deletion' },
                        canManageTenants: { label: 'Manage Tenants', description: 'Tenant management and operations' },
                        canManageMaintenance: { label: 'Manage Maintenance', description: 'Maintenance requests and scheduling' },
                        canManageVendors: { label: 'Manage Vendors', description: 'Vendor management and contracts' },
                        canManageFinancials: { label: 'Financial Access', description: 'Financial data and accounting features' },
                        canViewReports: { label: 'View Reports', description: 'Analytics and reporting features' },
                        canViewAnalytics: { label: 'Advanced Analytics', description: 'Advanced analytics and insights' },
                        canViewAuditLogs: { label: 'View Audit Logs', description: 'System audit and activity logs' },
                        canManageTeam: { label: 'Team Management', description: 'Manage other team members' },
                        canAssignProperties: { label: 'Assign Properties', description: 'Assign properties to team members' },
                        canManageSettings: { label: 'System Settings', description: 'System configuration and settings' },
                        canManageIntegrations: { label: 'Manage Integrations', description: 'Third-party integrations and APIs' },
                        canManageLeases: { label: 'Manage Leases', description: 'Lease agreements and contracts' },
                        canManageMarketing: { label: 'Manage Marketing', description: 'Marketing campaigns and materials' },
                        canManageLegal: { label: 'Manage Legal', description: 'Legal documents and compliance' },
                        canManageTemplates: { label: 'Manage Templates', description: 'Document and email templates' },
                        canExportData: { label: 'Export Data', description: 'Export data and reports' },
                        canImportData: { label: 'Import Data', description: 'Import data and bulk operations' },
                      };

                      const { label, description } = permissionLabels[permission] || { label: permission, description: 'Permission' };
                      const isEnabled = form.watch(permission as any);
                      const isDefaultEnabled = roleDefinition?.permissions[permission as keyof typeof roleDefinition.permissions];
                      const isRelevant = isPermissionRelevantForRole(selectedRole, permission);

                      return (
                        <div 
                          key={permission} 
                          className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                            isEnabled 
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                              : isRelevant
                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Checkbox
                            id={permission}
                            checked={isEnabled}
                            onCheckedChange={(checked) => form.setValue(permission as any, checked)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={permission} className="text-sm font-medium">{label}</Label>
                              {isDefaultEnabled && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                  Default
                                </span>
                              )}
                              {!isDefaultEnabled && isRelevant && (
                                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                                  Optional
                                </span>
                              )}
                              {!isRelevant && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                                  Advanced
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

const Step4EmploymentDetails: React.FC<StepProps> = ({ form, formErrors, formValues }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
            <DollarSign className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">4</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Employment Details</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Enter employment and compensation details.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            {...form.register('salary', { valueAsNumber: true })}
            type="number"
            placeholder="e.g., 60000"
            className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-all duration-200"
          />
        </div>

        <div>
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            {...form.register('emergencyContactName')}
            placeholder="e.g., Jane Doe"
            className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-all duration-200"
          />
        </div>

        <div>
          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhone"
            {...form.register('emergencyContactPhone')}
            placeholder="+1 (555) 123-4567"
            className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-all duration-200"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            {...form.register('address')}
            placeholder="Enter complete address..."
            className="min-h-[80px] resize-y transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 dark:border-gray-700 dark:focus:border-blue-500 dark:hover:border-gray-600"
          />
        </div>
      </div>
    </div>
  );
};

const Step5PropertyAssignment: React.FC<StepProps & { onEditStep?: (step: number) => void }> = ({ form, formErrors, formValues, getRoleDisplayName, onEditStep }) => {
  // Helper function to get permission count
  const getPermissionCount = () => {
    const permissions = [
      formValues.canManageProperties,
      formValues.canManageTenants,
      formValues.canManageMaintenance,
      formValues.canViewReports,
      formValues.canManageFinancials,
      formValues.canManageTeam,
      formValues.canAssignProperties,
      formValues.canViewAnalytics,
      formValues.canManageVendors,
      formValues.canManageLeases,
      formValues.canManageMarketing,
      formValues.canManageLegal,
      formValues.canManageSettings,
      formValues.canExportData,
      formValues.canImportData,
      formValues.canManageTemplates,
      formValues.canViewAuditLogs,
      formValues.canManageIntegrations,
    ];
    return permissions.filter(Boolean).length;
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="p-4 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">5</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Review & Create Team Member</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Please review all details before creating your team member.</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(1)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
              <p className="font-medium">{formValues.firstName} {formValues.lastName}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Email Address:</span>
              <p className="font-medium">{formValues.email}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Phone Number:</span>
              <p className="font-medium">{formValues.phoneNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Professional Details
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(2)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Department:</span>
              <p className="font-medium">{formValues.department}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Hire Date:</span>
              <p className="font-medium">{formValues.hireDate}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Employment Status:</span>
              <p className="font-medium">{formValues.employmentStatus}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Profile Photo:</span>
              <p className="font-medium">{formValues.avatar ? 'Uploaded' : 'Not uploaded'}</p>
            </div>
          </div>
          {formValues.bio && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Professional Bio:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{formValues.bio}</p>
            </div>
          )}
        </div>

        {/* Role & Permissions */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role & Permissions
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(3)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Role:</span>
              <p className="font-medium">{getRoleDisplayName ? getRoleDisplayName(formValues.role) : formValues.role}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Access Level:</span>
              <p className="font-medium">{formValues.accessLevel}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Permissions Granted:</span>
              <p className="font-medium">{getPermissionCount()} of 18 permissions</p>
            </div>
          </div>
          
          {/* Permission Summary */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Active Permissions:</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {formValues.canManageProperties && <Badge variant="secondary" className="text-xs">Properties</Badge>}
              {formValues.canManageTenants && <Badge variant="secondary" className="text-xs">Tenants</Badge>}
              {formValues.canManageMaintenance && <Badge variant="secondary" className="text-xs">Maintenance</Badge>}
              {formValues.canViewReports && <Badge variant="secondary" className="text-xs">Reports</Badge>}
              {formValues.canManageFinancials && <Badge variant="secondary" className="text-xs">Financial</Badge>}
              {formValues.canManageTeam && <Badge variant="secondary" className="text-xs">Team</Badge>}
              {formValues.canAssignProperties && <Badge variant="secondary" className="text-xs">Assign</Badge>}
              {formValues.canViewAnalytics && <Badge variant="secondary" className="text-xs">Analytics</Badge>}
              {formValues.canManageVendors && <Badge variant="secondary" className="text-xs">Vendors</Badge>}
              {formValues.canManageLeases && <Badge variant="secondary" className="text-xs">Leases</Badge>}
              {formValues.canManageMarketing && <Badge variant="secondary" className="text-xs">Marketing</Badge>}
              {formValues.canManageLegal && <Badge variant="secondary" className="text-xs">Legal</Badge>}
              {formValues.canManageSettings && <Badge variant="secondary" className="text-xs">Settings</Badge>}
              {formValues.canExportData && <Badge variant="secondary" className="text-xs">Export</Badge>}
              {formValues.canImportData && <Badge variant="secondary" className="text-xs">Import</Badge>}
              {formValues.canManageTemplates && <Badge variant="secondary" className="text-xs">Templates</Badge>}
              {formValues.canViewAuditLogs && <Badge variant="secondary" className="text-xs">Audit</Badge>}
              {formValues.canManageIntegrations && <Badge variant="secondary" className="text-xs">Integrations</Badge>}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Employment Details
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(4)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Salary:</span>
              <p className="font-medium">{formValues.salary ? formatCurrency(formValues.salary) : 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Emergency Contact:</span>
              <p className="font-medium">
                {formValues.emergencyContactName ? 
                  `${formValues.emergencyContactName} (${formValues.emergencyContactPhone})` : 
                  'Not provided'
                }
              </p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-600 dark:text-gray-400">Address:</span>
              <p className="font-medium">{formValues.address || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Property Assignment */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property Assignment
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(5)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Assigned Properties:</span>
              <span className="font-medium">{formValues.assignedProperties?.length || 0} properties</span>
            </div>
            {formValues.assignedProperties && formValues.assignedProperties.length > 0 ? (
              <div className="space-y-1">
                {formValues.assignedProperties.map((propertyId, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Building className="h-3 w-3" />
                    <span>Property {propertyId}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No properties assigned yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Properties can be assigned after team member creation</p>
              </div>
            )}
          </div>
        </div>

        {/* Final Validation */}
        {Object.keys(formErrors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Please fix the following errors:</span>
            </div>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(formErrors).map(([field, error]: [string, any]) => (
                <li key={field}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Team Member Summary
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{getPermissionCount()}</div>
              <div className="text-blue-700 dark:text-blue-300">Permissions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formValues.assignedProperties?.length || 0}</div>
              <div className="text-blue-700 dark:text-blue-300">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formValues.accessLevel}</div>
              <div className="text-blue-700 dark:text-blue-300">Access Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formValues.employmentStatus}</div>
              <div className="text-blue-700 dark:text-blue-300">Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Storage Analytics Dialog
interface StorageAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analytics?: StorageAnalytics;
}

const StorageAnalyticsDialog: React.FC<StorageAnalyticsDialogProps> = ({ open, onOpenChange, analytics }) => {
  if (!analytics) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Storage Analytics</DialogTitle>
          <DialogDescription>
            Detailed breakdown of your account's storage usage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Storage Used:</span>
            <span>{formatBytes(analytics.totalStorage)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Storage Limit:</span>
            <span>{formatBytes(analytics.storageLimit)} ({analytics.billingTier} tier)</span>
          </div>
          {analytics.overageAmount > 0 && (
            <div className="flex items-center justify-between text-red-500">
              <span className="font-medium">Overage:</span>
              <span>{formatBytes(analytics.overageAmount)} (Estimated Cost: ${analytics.estimatedCost.toFixed(2)})</span>
            </div>
          )}
          <Separator />
          <h4 className="font-semibold mt-2">Storage Breakdown by Category:</h4>
          {Object.entries(analytics.storageBreakdown).map(([category, size]) => (
            <div key={category} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{category.charAt(0).toUpperCase() + category.slice(1)}:</span>
              <span>{formatBytes(size)}</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Import Team Dialog
interface ImportTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportTeamDialog: React.FC<ImportTeamDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Team Members</DialogTitle>
          <DialogDescription>
            Import team members from a CSV or Excel file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Import functionality coming soon</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ); 
}