import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import useSWR from 'swr';
import { tenantsApi, propertiesApi, unitsApi } from '@/lib/api';
import { getFileUrl } from '@/lib/utils';
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
  Wrench,
  X,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Building
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ConfirmationDialog as UnsavedChangesDialog } from '@/components/ui/confirmation-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tenant Wizard Step Schemas
const tenantStep1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  socialSecurityNumber: z.string().optional(),
});

const tenantStep2Schema = z.object({
  currentAddress: z.string().min(1, 'Current address is required'),
  previousAddress: z.string().optional(),
  employerName: z.string().min(1, 'Employer name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  monthlyIncome: z.number().min(1, 'Monthly income is required'),
  employmentLength: z.string().min(1, 'Employment length is required'),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
  emergencyContactRelationship: z.string().min(1, 'Emergency contact relationship is required'),
});

const tenantStep3Schema = z.object({
  propertyId: z.string().min(1, 'Property selection is required'),
  unitId: z.string().min(1, 'Unit selection is required'),
  leaseStartDate: z.string().min(1, 'Lease start date is required'),
  leaseEndDate: z.string().min(1, 'Lease end date is required'),
  monthlyRent: z.number().min(1, 'Monthly rent is required'),
  securityDeposit: z.number().min(0, 'Security deposit must be positive'),
  petDeposit: z.number().min(0, 'Pet deposit must be positive').optional(),
  leaseType: z.enum(['Fixed', 'Month-to-Month']).default('Fixed'),
});

const tenantStep4Schema = z.object({
  backgroundCheckConsent: z.boolean().refine(val => val === true, 'Background check consent is required'),
  creditCheckConsent: z.boolean().refine(val => val === true, 'Credit check consent is required'),
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional(),
  hasPets: z.boolean().default(false),
  petDescription: z.string().optional(),
  additionalNotes: z.string().optional(),
});

const tenantStep5Schema = z.object({
  reviewConfirmation: z.boolean().default(false),
});

const tenantWizardSchema = tenantStep1Schema
  .merge(tenantStep2Schema)
  .merge(tenantStep3Schema)
  .merge(tenantStep4Schema)
  .merge(tenantStep5Schema);

type TenantStep1Data = z.infer<typeof tenantStep1Schema>;
type TenantStep2Data = z.infer<typeof tenantStep2Schema>;
type TenantStep3Data = z.infer<typeof tenantStep3Schema>;
type TenantStep4Data = z.infer<typeof tenantStep4Schema>;
type TenantStep5Data = z.infer<typeof tenantStep5Schema>;
type TenantWizardData = z.infer<typeof tenantWizardSchema>;

// Tenant Wizard step configuration
const TENANT_WIZARD_STEPS = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Basic personal and contact information',
    icon: User,
    schema: tenantStep1Schema,
  },
  {
    id: 2,
    title: 'Background',
    description: 'Employment and background information',
    icon: Building,
    schema: tenantStep2Schema,
  },
  {
    id: 3,
    title: 'Lease Details',
    description: 'Property, unit, and lease terms',
    icon: Home,
    schema: tenantStep3Schema,
  },
  {
    id: 4,
    title: 'Screening',
    description: 'Background checks and additional requirements',
    icon: Shield,
    schema: tenantStep4Schema,
  },
  {
    id: 5,
    title: 'Review',
    description: 'Review and create tenant profile',
    icon: CheckCircle2,
    schema: tenantStep5Schema,
  },
];

// Types
interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'Active' | 'Late' | 'Notice' | 'Inactive';
  unit?: {
    id: string;
    number: string;
    property: {
      id: string;
      name: string;
      address: string;
    };
  };
  lease?: {
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    status: 'Active' | 'Expired' | 'Expiring Soon';
  };
  balance?: number;
  lastPayment?: {
    date: string;
    amount: number;
  } | null;
  moveInDate?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  rating?: number;
  maintenanceRequests?: number;
  paymentHistory?: {
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

// Tenant Wizard Step Components
const TenantStep1PersonalInfo: React.FC<{ form: any; formErrors: any; formValues: any }> = ({ form, formErrors, formValues }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center space-y-4">
      <div className="relative inline-flex">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
          <User className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">1</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Let's start with the basic personal details for your new tenant.</p>
    </div>

    <div className="bg-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
                          <Label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">First Name *</Label>
                <Input {...form.register('firstName')} id="firstName" placeholder="John" className="h-12 text-base transition-all duration-200 border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500/20 hover:border-gray-300 dark:hover:border-gray-600" />
                  {formErrors.firstName && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.firstName.message}
              </p>
            </div>
          )}
      </div>
      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                <Input {...form.register('lastName')} id="lastName" placeholder="Doe" className="mt-1" />
                  {formErrors.lastName && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.lastName.message}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input {...form.register('email')} type="email" placeholder="john.doe@email.com" className="mt-1" />
          {formErrors.email && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.email.message}
              </p>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input {...form.register('phone')} placeholder="+1 (555) 123-4567" className="mt-1" />
          {formErrors.phone && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.phone.message}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <DatePicker
            date={form.watch('dateOfBirth') ? new Date(form.watch('dateOfBirth')) : undefined}
            onDateChange={(date) => form.setValue('dateOfBirth', date ? date.toISOString().split('T')[0] : '')}
            placeholder="Select date of birth"
            className="mt-1"
          />
          {formErrors.dateOfBirth && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formErrors.dateOfBirth.message}
              </p>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="socialSecurityNumber">Social Security Number (Optional)</Label>
          <Input {...form.register('socialSecurityNumber')} placeholder="XXX-XX-XXXX" className="mt-1" />
        </div>
      </div>
    </div>
  </motion.div>
);

const TenantStep2Background: React.FC<{ form: any; formErrors: any }> = ({ form, formErrors }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Background Information</h3>
      <p className="text-sm text-gray-600">Employment history and emergency contact details.</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          Employment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employerName">Employer Name *</Label>
            <Input {...form.register('employerName')} placeholder="Company Inc." className="mt-1" />
            {formErrors.employerName && (
              <p className="text-sm text-red-600 mt-1">{formErrors.employerName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input {...form.register('jobTitle')} placeholder="Software Engineer" className="mt-1" />
            {formErrors.jobTitle && (
              <p className="text-sm text-red-600 mt-1">{formErrors.jobTitle.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyIncome">Monthly Income *</Label>
            <Input 
              {...form.register('monthlyIncome', { 
                setValueAs: (value) => value === '' ? undefined : Number(value) 
              })} 
              type="number" 
              placeholder="5000" 
              className="mt-1" 
            />
            {formErrors.monthlyIncome && (
              <p className="text-sm text-red-600 mt-1">{formErrors.monthlyIncome.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="employmentLength">Employment Length *</Label>
            <Select onValueChange={(value) => form.setValue('employmentLength', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Less than 6 months">Less than 6 months</SelectItem>
                <SelectItem value="6 months - 1 year">6 months - 1 year</SelectItem>
                <SelectItem value="1-2 years">1-2 years</SelectItem>
                <SelectItem value="2-5 years">2-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.employmentLength && (
              <p className="text-sm text-red-600 mt-1">{formErrors.employmentLength.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Phone className="h-5 w-5 text-green-600" />
          Emergency Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="emergencyContactName">Contact Name *</Label>
          <Input {...form.register('emergencyContactName')} placeholder="Jane Doe" className="mt-1" />
          {formErrors.emergencyContactName && (
            <p className="text-sm text-red-600 mt-1">{formErrors.emergencyContactName.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
            <Input {...form.register('emergencyContactPhone')} placeholder="+1 (555) 987-6543" className="mt-1" />
            {formErrors.emergencyContactPhone && (
              <p className="text-sm text-red-600 mt-1">{formErrors.emergencyContactPhone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
            <Select onValueChange={(value) => form.setValue('emergencyContactRelationship', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Other Family">Other Family</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.emergencyContactRelationship && (
              <p className="text-sm text-red-600 mt-1">{formErrors.emergencyContactRelationship.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Address Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="currentAddress">Current Address *</Label>
          <Textarea 
            {...form.register('currentAddress')} 
            placeholder="123 Main St, City, State 12345"
            className="mt-1 min-h-[60px]"
          />
          {formErrors.currentAddress && (
            <p className="text-sm text-red-600 mt-1">{formErrors.currentAddress.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="previousAddress">Previous Address (Optional)</Label>
          <Textarea 
            {...form.register('previousAddress')} 
            placeholder="456 Oak Ave, City, State 54321"
            className="mt-1 min-h-[60px]"
          />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const TenantStep3LeaseDetails: React.FC<{ 
  form: any; 
  formErrors: any; 
  formValues: any;
  properties: any[];
  units: any[];
  onPropertyChange: (propertyId: string) => void;
}> = ({ form, formErrors, formValues, properties, units, onPropertyChange }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Lease Details</h3>
      <p className="text-sm text-gray-600">Select the property, unit, and define lease terms.</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Home className="h-5 w-5 text-purple-600" />
          Property & Unit Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyId">Property *</Label>
            <Select onValueChange={(value) => {
              form.setValue('propertyId', value);
              form.setValue('unitId', ''); // Reset unit when property changes
              onPropertyChange(value);
            }}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.propertyId && (
              <p className="text-sm text-red-600 mt-1">{formErrors.propertyId.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="unitId">Unit *</Label>
            <Select 
              onValueChange={(value) => form.setValue('unitId', value)}
              disabled={!formValues.propertyId}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={formValues.propertyId ? "Select unit" : "Select property first"} />
              </SelectTrigger>
              <SelectContent>
                {units.map(unit => (
                  <SelectItem key={unit.id} value={unit.id}>
                    Unit {unit.number} - ${unit.monthlyRent}/month
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.unitId && (
              <p className="text-sm text-red-600 mt-1">{formErrors.unitId.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Lease Terms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="leaseStartDate">Lease Start Date *</Label>
            <DatePicker
              date={form.watch('leaseStartDate') ? new Date(form.watch('leaseStartDate')) : undefined}
              onDateChange={(date) => form.setValue('leaseStartDate', date ? date.toISOString().split('T')[0] : '')}
              placeholder="Select lease start date"
              className="mt-1"
            />
            {formErrors.leaseStartDate && (
              <p className="text-sm text-red-600 mt-1">{formErrors.leaseStartDate.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="leaseEndDate">Lease End Date *</Label>
            <DatePicker
              date={form.watch('leaseEndDate') ? new Date(form.watch('leaseEndDate')) : undefined}
              onDateChange={(date) => form.setValue('leaseEndDate', date ? date.toISOString().split('T')[0] : '')}
              placeholder="Select lease end date"
              className="mt-1"
            />
            {formErrors.leaseEndDate && (
              <p className="text-sm text-red-600 mt-1">{formErrors.leaseEndDate.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="leaseType">Lease Type</Label>
            <Select onValueChange={(value) => form.setValue('leaseType', value)} defaultValue="Fixed">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fixed">Fixed Term</SelectItem>
                <SelectItem value="Month-to-Month">Month-to-Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="monthlyRent">Monthly Rent *</Label>
            <Input 
              {...form.register('monthlyRent', { 
                setValueAs: (value) => value === '' ? undefined : Number(value) 
              })} 
              type="number" 
              placeholder="1500" 
              className="mt-1" 
            />
            {formErrors.monthlyRent && (
              <p className="text-sm text-red-600 mt-1">{formErrors.monthlyRent.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="securityDeposit">Security Deposit</Label>
            <Input 
              {...form.register('securityDeposit', { 
                setValueAs: (value) => value === '' ? 0 : Number(value) 
              })} 
              type="number" 
              placeholder="1500" 
              className="mt-1" 
            />
            {formErrors.securityDeposit && (
              <p className="text-sm text-red-600 mt-1">{formErrors.securityDeposit.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="petDeposit">Pet Deposit (Optional)</Label>
            <Input 
              {...form.register('petDeposit', { 
                setValueAs: (value) => value === '' ? 0 : Number(value) 
              })} 
              type="number" 
              placeholder="200" 
              className="mt-1" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const TenantStep4Screening: React.FC<{ form: any; formValues: any; formErrors: any }> = ({ form, formValues, formErrors }) => {
  const [hasInsurance, setHasInsurance] = useState(formValues.hasInsurance || false);
  const [hasPets, setHasPets] = useState(formValues.hasPets || false);

  useEffect(() => {
    form.setValue('hasInsurance', hasInsurance);
    form.setValue('hasPets', hasPets);
  }, [hasInsurance, hasPets, form]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tenant Screening</h3>
        <p className="text-sm text-gray-600">Background checks, insurance, and additional requirements.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Required Consents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="backgroundCheckConsent"
                checked={form.watch('backgroundCheckConsent')}
                onCheckedChange={(checked) => form.setValue('backgroundCheckConsent', !!checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="backgroundCheckConsent" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Background Check Consent *
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-300">I consent to a comprehensive background check including criminal history verification.</p>
                {formErrors.backgroundCheckConsent && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.backgroundCheckConsent.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="creditCheckConsent"
                checked={form.watch('creditCheckConsent')}
                onCheckedChange={(checked) => form.setValue('creditCheckConsent', !!checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="creditCheckConsent" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Credit Check Consent *
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-300">I consent to a credit check and financial verification.</p>
                {formErrors.creditCheckConsent && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.creditCheckConsent.message}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="hasInsurance"
                checked={hasInsurance}
                onCheckedChange={(checked) => setHasInsurance(!!checked)}
                className="mt-1"
              />
              <label htmlFor="hasInsurance" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                I have renter's insurance
              </label>
            </div>
            
            {hasInsurance && (
              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input {...form.register('insuranceProvider')} placeholder="State Farm, Allstate, etc." className="mt-1" />
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="hasPets"
                checked={hasPets}
                onCheckedChange={(checked) => setHasPets(!!checked)}
                className="mt-1"
              />
              <label htmlFor="hasPets" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                I have pets
              </label>
            </div>
            
            {hasPets && (
              <div>
                <Label htmlFor="petDescription">Pet Description</Label>
                <Textarea 
                  {...form.register('petDescription')} 
                  placeholder="Describe your pets (type, breed, size, etc.)"
                  className="mt-1 min-h-[80px]"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea 
                {...form.register('additionalNotes')} 
                placeholder="Any additional information or special requests..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TenantStep5Review: React.FC<{ 
  form: any; 
  formValues: any; 
  onEditStep: (step: number) => void;
  properties: any[];
  units: any[];
}> = ({ form, formValues, onEditStep, properties, units }) => {
  const selectedProperty = properties.find(p => p.id === formValues.propertyId);
  const selectedUnit = units.find(u => u.id === formValues.unitId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Create</h3>
        <p className="text-sm text-gray-600">Please review all information before creating the tenant profile.</p>
      </div>

      <div className="space-y-4">
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onEditStep(1)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Name:</span> {formValues.firstName} {formValues.lastName}</div>
            <div><span className="font-medium">Email:</span> {formValues.email}</div>
            <div><span className="font-medium">Phone:</span> {formValues.phone}</div>
            <div><span className="font-medium">Date of Birth:</span> {formValues.dateOfBirth}</div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Employment & Background</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onEditStep(2)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Employer:</span> {formValues.employerName}</div>
            <div><span className="font-medium">Job Title:</span> {formValues.jobTitle}</div>
            <div><span className="font-medium">Monthly Income:</span> ${formValues.monthlyIncome?.toLocaleString()}</div>
            <div><span className="font-medium">Employment Length:</span> {formValues.employmentLength}</div>
            <div><span className="font-medium">Emergency Contact:</span> {formValues.emergencyContactName}</div>
            <div><span className="font-medium">Emergency Phone:</span> {formValues.emergencyContactPhone}</div>
          </CardContent>
        </Card>

        {/* Lease Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Lease Details</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onEditStep(3)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="font-medium">Property:</span> {selectedProperty?.name}</div>
            <div><span className="font-medium">Unit:</span> {selectedUnit?.number}</div>
            <div><span className="font-medium">Lease Period:</span> {formValues.leaseStartDate} to {formValues.leaseEndDate}</div>
            <div><span className="font-medium">Monthly Rent:</span> ${formValues.monthlyRent?.toLocaleString()}</div>
            <div><span className="font-medium">Security Deposit:</span> ${formValues.securityDeposit?.toLocaleString()}</div>
            <div><span className="font-medium">Lease Type:</span> {formValues.leaseType}</div>
          </CardContent>
        </Card>

        {/* Screening Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Screening & Additional Info</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onEditStep(4)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>✓ Background Check Consent</div>
              <div>✓ Credit Check Consent</div>
              {formValues.hasInsurance && <div>✓ Has Renter's Insurance ({formValues.insuranceProvider})</div>}
              {formValues.hasPets && <div>✓ Has Pets</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

// Main Add Tenant Wizard Sheet
function AddTenantSheet({ isOpen, onClose, onSubmit, isLoading }: any) {
  console.log('🔍 AddTenantSheet - isOpen:', isOpen, 'isLoading:', isLoading);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const form = useForm<TenantWizardData>({
    resolver: zodResolver(tenantWizardSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      socialSecurityNumber: '',
      currentAddress: '',
      previousAddress: '',
      employerName: '',
      jobTitle: '',
      monthlyIncome: undefined,
      employmentLength: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      propertyId: '',
      unitId: '',
      leaseStartDate: '',
      leaseEndDate: '',
      monthlyRent: undefined,
      securityDeposit: 0,
      petDeposit: 0,
      leaseType: 'Fixed',
      backgroundCheckConsent: false,
      creditCheckConsent: false,
      hasInsurance: false,
      insuranceProvider: '',
      hasPets: false,
      petDescription: '',
      additionalNotes: '',
      reviewConfirmation: false,
    }
  });

  const formValues = form.watch();
  const formErrors = form.formState.errors;

  // Check if current step is valid
  const isCurrentStepValid = useMemo(() => {
    const currentStepConfig = TENANT_WIZARD_STEPS.find(step => step.id === currentStep);
    if (!currentStepConfig) return false;

    try {
      currentStepConfig.schema.parse(formValues);
      return true;
    } catch (error) {
      return false;
    }
  }, [currentStep, formValues]);

  // Fetch properties for selection
  const { data: propertiesData } = useSWR('/api/properties', () => propertiesApi.getAll());
  const properties = (propertiesData as any)?.data || [];

  // Fetch units when property is selected
  const handlePropertyChange = useCallback(async (propertyId: string) => {
    if (propertyId) {
      try {
        const response = await unitsApi.getByProperty(propertyId);
        const units = (response as any)?.data || [];
        // Filter for available units only
        const available = units.filter((unit: any) => !unit.tenantId);
        setAvailableUnits(available);
      } catch (error) {
        console.error('Failed to fetch units:', error);
        setAvailableUnits([]);
      }
    } else {
      setAvailableUnits([]);
    }
  }, []);

  // Step validation and navigation
  const validateStep = async (step: number) => {
    const stepSchema = TENANT_WIZARD_STEPS.find(s => s.id === step)?.schema;
    if (!stepSchema) return true;

    try {
      stepSchema.parse(formValues);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < TENANT_WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleStepClick = async (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
      // Smooth scroll to top of form content
      setTimeout(() => {
        const formContent = document.querySelector('.overflow-y-auto');
        if (formContent) {
          formContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Form submission
  const handleSubmit = async (data: TenantWizardData) => {
    try {
      await onSubmit(data);
      
      // Reset form and close
      form.reset();
      setCurrentStep(1);
      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  // Handle close with dirty check
  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    form.reset();
    setCurrentStep(1);
    setIsDirty(false);
    onClose();
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

  // Reset when sheet opens
  useEffect(() => {
    if (isOpen) {
      form.reset();
      setCurrentStep(1);
      setIsDirty(false);
      setAvailableUnits([]);
    }
  }, [isOpen, form]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isDirty]);

  const currentStepConfig = TENANT_WIZARD_STEPS.find(step => step.id === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TENANT_WIZARD_STEPS.length;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="flex flex-col h-full p-0 gap-0 [&>button]:hidden">
        {/* Header with Progress */}
        <div className="border-b bg-card relative">
          {/* Enhanced Mobile-Friendly Close Button - Same as Properties View */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-4 top-4 h-12 w-12 p-0 rounded-full bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 shadow-xl hover:shadow-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 z-10"
          >
            <X className="h-6 w-6 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-bold" />
          </Button>
          
          {/* Header */}
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Add New Tenant
            </SheetTitle>
            <SheetDescription>
              Step {currentStep} of {TENANT_WIZARD_STEPS.length}: {currentStepConfig?.description}
            </SheetDescription>
          </SheetHeader>

          {/* Progress Indicator */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              {TENANT_WIZARD_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="relative">
                    <button
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
                    </button>
                    
                    {/* Step label */}
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 text-center">
                      <div className={`text-xs font-medium transition-colors duration-200 ${
                        step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  
                  {index < TENANT_WIZARD_STEPS.length - 1 && (
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
                  style={{ width: `${(currentStep / TENANT_WIZARD_STEPS.length) * 100}%` }}
                />
                {/* Add subtle pulsing animation to the end of the progress bar */}
                <div 
                                      className="absolute top-0 h-full w-4 bg-primary/30 rounded-full transition-all duration-500 ease-in-out animate-pulse"
                  style={{ 
                    left: `${Math.max(0, (currentStep / TENANT_WIZARD_STEPS.length) * 100 - 4)}%`,
                    opacity: currentStep < TENANT_WIZARD_STEPS.length ? 1 : 0
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Step {currentStep} of {TENANT_WIZARD_STEPS.length}</span>
                <span>{Math.round((currentStep / TENANT_WIZARD_STEPS.length) * 100)}% Complete</span>
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
          
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <TenantStep1PersonalInfo 
                  form={form} 
                  formErrors={formErrors} 
                  formValues={formValues}
                />
              )}

              {/* Step 2: Background */}
              {currentStep === 2 && (
                <TenantStep2Background 
                  form={form} 
                  formErrors={formErrors}
                />
              )}

              {/* Step 3: Lease Details */}
              {currentStep === 3 && (
                <TenantStep3LeaseDetails 
                  form={form} 
                  formErrors={formErrors}
                  formValues={formValues}
                  properties={properties}
                  units={availableUnits}
                  onPropertyChange={handlePropertyChange}
                />
              )}

              {/* Step 4: Screening */}
              {currentStep === 4 && (
                <TenantStep4Screening 
                  form={form}
                  formValues={formValues}
                  formErrors={formErrors}
                />
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <TenantStep5Review 
                  form={form} 
                  formValues={formValues}
                  onEditStep={setCurrentStep}
                  properties={properties}
                  units={availableUnits}
                />
              )}
            </AnimatePresence>

            {/* Bottom padding to ensure content is not hidden behind sticky footer */}
            <div className="h-16" />
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="border-t bg-card px-6 py-4 flex-shrink-0 shadow-lg">
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
              {!isFirstStep && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            
            {!isLastStep ? (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={!isCurrentStepValid}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isLoading || !isCurrentStepValid}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Tenant
                  </>
                )}
              </Button>
            )}
          </div>
          </div>
        </div>
      </SheetContent>

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
    </Sheet>
  );
}

export function Tenants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  
  // Debug state changes
  useEffect(() => {
    console.log('🔍 Tenants - showAddTenant state changed to:', showAddTenant);
  }, [showAddTenant]);

  // Handle Quick Add events
  useEffect(() => {
    const handleOpenAddTenant = () => {
      console.log('🎯 Quick Add Tenant event received!');
      setShowAddTenant(true);
      console.log('🎯 setShowAddTenant(true) called');
    };

    console.log('🎯 Adding openAddTenant event listener');
    window.addEventListener('openAddTenant', handleOpenAddTenant);
    
    return () => {
      console.log('🎯 Removing openAddTenant event listener');
      window.removeEventListener('openAddTenant', handleOpenAddTenant);
    };
  }, []);

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
        (tenant.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (tenant.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (tenant.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (tenant.unit?.number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (tenant.unit?.property?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || (tenant.status?.toLowerCase() || '') === filterStatus.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [tenants, searchTerm, filterStatus]);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter(t => t.status === 'Active').length;
    const late = tenants.filter(t => t.status === 'Late').length;
    const totalRent = tenants.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0);
    const totalBalance = tenants.reduce((sum, t) => sum + Math.abs(t.balance || 0), 0);
    const avgRating = tenants.reduce((sum, t) => sum + (t.rating || 0), 0) / total;
    const expiringLeases = tenants.filter(t => t.lease?.status === 'Expiring Soon').length;

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
                            <AvatarImage src={getFileUrl(tenant.avatar || '')} alt={`${tenant.firstName} ${tenant.lastName}`} />
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
                          <p className="font-medium">{tenant.unit?.number || 'No Unit'}</p>
                          <p className="text-sm text-gray-500">{tenant.unit?.property?.name || 'No Property'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">${(tenant.lease?.monthlyRent || 0).toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(tenant.status)}`}>
                          {getStatusIcon(tenant.status)}
                          {tenant.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className={`font-medium ${(tenant.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {(tenant.balance || 0) === 0 ? '$0' : (tenant.balance || 0) < 0 ? `-$${Math.abs(tenant.balance || 0)}` : `$${tenant.balance || 0}`}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{tenant.rating || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{tenant.lease?.endDate ? new Date(tenant.lease.endDate).toLocaleDateString() : 'No End Date'}</p>
                        {tenant.lease?.status === 'Expiring Soon' && (
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
                        <AvatarImage src={getFileUrl(tenant.avatar || '')} alt={`${tenant.firstName} ${tenant.lastName}`} />
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
                      <span className="font-medium">{tenant.unit?.number || 'No Unit'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Monthly Rent</span>
                      <span className="font-medium">${(tenant.lease?.monthlyRent || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Balance</span>
                      <span className={`font-medium ${(tenant.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {(tenant.balance || 0) === 0 ? '$0' : (tenant.balance || 0) < 0 ? `-$${Math.abs(tenant.balance || 0)}` : `$${tenant.balance || 0}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{tenant.rating || 0}</span>
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
                        Lease ends {tenant.lease?.endDate ? new Date(tenant.lease.endDate).toLocaleDateString() : 'No End Date'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Tenant Detail Sheet */}
      <Sheet open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
        <SheetContent className="overflow-y-auto">
          {selectedTenant && (
            <>
              <SheetHeader className="sticky top-0 bg-white z-10 pb-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30">
                    <Users className="h-6 w-6 text-green-700" />
                  </div>
                  <Avatar className="h-14 w-14 border-3 border-white shadow-lg">
                    <AvatarImage src={selectedTenant.avatar} alt={`${selectedTenant.firstName} ${selectedTenant.lastName}`} />
                    <AvatarFallback className="bg-gradient-to-br from-green-100 to-blue-100 text-green-700 text-lg font-semibold">
                      {selectedTenant.firstName[0]}{selectedTenant.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <SheetTitle className="text-xl font-bold text-gray-900">
                      {selectedTenant.firstName} {selectedTenant.lastName}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Unit {selectedTenant.unit?.number || 'No Unit'} • {selectedTenant.unit?.property?.name || 'No Property'}
                    </SheetDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={selectedTenant.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                        {selectedTenant.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>
              
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
                            <p className="font-semibold text-lg">${(selectedTenant.lease?.monthlyRent || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Security Deposit</p>
                            <p className="font-medium">${(selectedTenant.lease?.securityDeposit || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lease Start</p>
                            <p className="font-medium">{selectedTenant.lease?.startDate ? new Date(selectedTenant.lease.startDate).toLocaleDateString() : 'No Start Date'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lease End</p>
                            <p className="font-medium">{selectedTenant.lease?.endDate ? new Date(selectedTenant.lease.endDate).toLocaleDateString() : 'No End Date'}</p>
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
                          <p className="text-2xl font-bold text-gray-900">{selectedTenant.paymentHistory?.onTime || 0}</p>
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
                            {selectedTenant.moveInDate ? Math.floor((new Date().getTime() - new Date(selectedTenant.moveInDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0}
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
                            <p className="text-2xl font-bold text-green-600">{selectedTenant.paymentHistory?.onTime || 0}</p>
                            <p className="text-sm text-gray-500">On Time</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{selectedTenant.paymentHistory?.late || 0}</p>
                            <p className="text-sm text-gray-500">Late</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{selectedTenant.paymentHistory?.total || 0}</p>
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
        </SheetContent>
      </Sheet>

      {/* Add Tenant Wizard Sheet */}
      <AddTenantSheet
        isOpen={showAddTenant}
        onClose={() => setShowAddTenant(false)}
        onSubmit={async (data) => {
          try {
            await tenantsApi.create(data);
            toast.success('Tenant created successfully!');
            mutateTenants();
          } catch (error) {
            console.error('Failed to create tenant:', error);
            toast.error('Failed to create tenant. Please try again.');
          }
        }}
        isLoading={false} // Set to true if the wizard has async operations
      />
    </motion.div>
  );
} 