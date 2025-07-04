import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Plus,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Users,
  Settings,
  Eye,
  Edit,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Key,
  Wrench,
  FileText,
  Camera,
  Upload,
  Download,
  MoreHorizontal,
  Bed,
  Bath,
  Square,
  Wifi,
  Car,
  PawPrint,
  Thermometer,
  Shield,
  Star,
  TrendingUp,
  Activity,
  Building2,
  Phone,
  Mail,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data
const mockUnits = [
  {
    id: '1',
    unitNumber: 'A-101',
    property: { id: '1', name: 'Sunset Apartments', address: '123 Main Street' },
    type: '2BR/2BA',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    monthlyRent: 3200,
    securityDeposit: 3200,
    leaseStatus: 'OCCUPIED',
    tenant: { name: 'John Smith', email: 'john@example.com', phone: '(555) 123-4567', moveIn: '2023-06-01', leaseEnd: '2024-06-01' },
    utilities: ['Water', 'Trash', 'Internet'],
    amenities: ['Balcony', 'Dishwasher', 'AC', 'Parking'],
    lastInspection: '2024-01-15',
    nextInspection: '2024-07-15',
    maintenanceRequests: 1,
    condition: 'Excellent',
    marketRent: 3400,
    photos: ['/api/placeholder/400/300'],
    description: 'Modern 2-bedroom with city views and premium finishes',
    floor: 1,
    features: ['Hardwood Floors', 'Stainless Appliances', 'Walk-in Closet'],
    notes: 'Recently renovated kitchen. Tenant very satisfied.',
    rating: 4.8,
    yearRenovated: 2023,
    energyRating: 'A+',
    accessCode: '1234',
    keyLocation: 'Office lockbox #15',
    lastCleaned: '2024-01-10',
    cleaningStatus: 'Clean'
  },
  {
    id: '2',
    unitNumber: 'A-102',
    property: { id: '1', name: 'Sunset Apartments', address: '123 Main Street' },
    type: '1BR/1BA',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 800,
    monthlyRent: 2800,
    securityDeposit: 2800,
    leaseStatus: 'VACANT',
    tenant: null,
    utilities: ['Water', 'Trash'],
    amenities: ['Balcony', 'AC', 'Parking'],
    lastInspection: '2024-01-20',
    nextInspection: '2024-07-20',
    maintenanceRequests: 0,
    condition: 'Good',
    marketRent: 2900,
    photos: ['/api/placeholder/400/300'],
    description: 'Cozy 1-bedroom with garden views',
    floor: 1,
    features: ['Garden View', 'Updated Kitchen'],
    notes: 'Ready for new tenant. Minor touch-ups completed.',
    rating: 4.5,
    yearRenovated: 2022,
    energyRating: 'B+',
    accessCode: '5678',
    keyLocation: 'Office lockbox #16',
    lastCleaned: '2024-01-22',
    cleaningStatus: 'Clean'
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

export function Units() {
  const [units] = useState(mockUnits);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.property.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || unit.leaseStatus.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.leaseStatus === 'OCCUPIED').length;
  const vacantUnits = units.filter(u => u.leaseStatus === 'VACANT').length;
  const totalRent = units.reduce((sum, u) => sum + u.monthlyRent, 0);
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unit Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage individual units with detailed tracking and analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="btn-ormi">
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
              </div>
              <Home className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-green-600">{occupiedUnits}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vacant</p>
                <p className="text-2xl font-bold text-orange-600">{vacantUnits}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</p>
                <Progress value={occupancyRate} className="mt-2" />
              </div>
              <TrendingUp className="h-8 w-8 text-ormi-blue" />
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
                    placeholder="Search units..."
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
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                  Grid
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Units Grid */}
      {viewMode === 'grid' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </motion.div>
      )}

      {/* Units List */}
      {viewMode === 'list' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredUnits.map((unit) => (
            <UnitListItem key={unit.id} unit={unit} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function UnitCard({ unit }: { unit: any }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="card-hover overflow-hidden">
      <div className="relative">
        <img src={unit.photos[0]} alt={unit.unitNumber} className="w-full h-48 object-cover" />
        <div className="absolute top-4 right-4">
          <Badge className={unit.leaseStatus === 'OCCUPIED' ? 'bg-green-600' : 'bg-orange-600'}>
            {unit.leaseStatus}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="bg-white/90">
            {unit.type}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
            <p className="text-sm text-gray-600">{unit.property.name}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Bed className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-sm font-medium">{unit.bedrooms} BR</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Bath className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-sm font-medium">{unit.bathrooms} BA</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Square className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-sm font-medium">{unit.sqft} sqft</p>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-gray-900">${unit.monthlyRent.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Monthly Rent</p>
        </div>

        {unit.tenant && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{unit.tenant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{unit.tenant.name}</p>
                <p className="text-xs text-gray-600">Lease ends {new Date(unit.tenant.leaseEnd).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {unit.maintenanceRequests > 0 && (
              <div className="flex items-center text-orange-600">
                <Wrench className="h-4 w-4 mr-1" />
                <span className="text-xs">{unit.maintenanceRequests}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Star className="h-4 w-4 mr-1" />
              <span className="text-xs">{unit.rating}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Less' : 'More'}
          </Button>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Condition</p>
                <p className="font-medium">{unit.condition}</p>
              </div>
              <div>
                <p className="text-gray-600">Floor</p>
                <p className="font-medium">{unit.floor}</p>
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1">
                {unit.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-2">Notes</p>
              <p className="text-xs text-gray-700">{unit.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UnitListItem({ unit }: { unit: any }) {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={unit.photos[0]} alt={unit.unitNumber} className="w-16 h-16 object-cover rounded-lg" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
              <p className="text-sm text-gray-600">{unit.property.name}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">{unit.type}</span>
                <span className="text-sm text-gray-600">{unit.sqft} sqft</span>
                <Badge className={unit.leaseStatus === 'OCCUPIED' ? 'bg-green-600' : 'bg-orange-600'}>
                  {unit.leaseStatus}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-gray-600">Monthly Rent</p>
              <p className="text-lg font-bold text-gray-900">${unit.monthlyRent.toLocaleString()}</p>
            </div>
            {unit.tenant && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Tenant</p>
                <p className="text-sm font-medium">{unit.tenant.name}</p>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Units; 