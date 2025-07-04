import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
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
  Trash2,
  Calendar,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Download,
  Upload,
  Copy,
  Star,
  Phone,
  Mail,
  Globe,
  Camera,
  FileText,
  Shield,
  Zap,
  Target,
  Clock,
  PieChart,
  Activity,
  Layers,
  Archive,
  RefreshCw,
  Database,
  FileSpreadsheet,
  Send,
  MessageSquare,
  BookOpen,
  Bookmark,
  Tag,
  Navigation,
  Compass,
  Map,
  Maximize,
  Minimize,
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data - replace with API calls
const mockProperties = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    type: 'Apartment Complex',
    yearBuilt: 2015,
    totalUnits: 24,
    occupiedUnits: 22,
    vacantUnits: 2,
    monthlyRent: 76800,
    expenses: 15200,
    netIncome: 61600,
    occupancyRate: 91.7,
    avgRentPerUnit: 3200,
    marketValue: 2800000,
    description: 'Modern apartment complex with luxury amenities and prime location',
    amenities: ['Pool', 'Gym', 'Parking', 'Laundry', 'Pet-friendly', 'Security'],
    images: ['/api/placeholder/400/300'],
    lastInspection: '2024-01-15',
    nextInspection: '2024-07-15',
    status: 'Active',
    manager: 'John Smith',
    purchaseDate: '2020-03-15',
    purchasePrice: 2400000,
    maintenanceRequests: 3,
    paymentStatus: 'current',
    leaseExpirations: 5,
    rating: 4.8,
    reviews: 127,
    tags: ['Premium', 'High-demand', 'Luxury'],
    notes: 'Recently renovated lobby and common areas. Planning pool maintenance for next month.',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    neighborhood: 'Mission District',
    walkScore: 89,
    transitScore: 95,
    bikeScore: 82,
    schools: [
      { name: 'Mission High School', rating: 8.5, distance: 0.3 },
      { name: 'Buena Vista Elementary', rating: 9.2, distance: 0.5 }
    ],
    nearbyPlaces: [
      { name: 'Grocery Store', distance: 0.2 },
      { name: 'BART Station', distance: 0.4 },
      { name: 'Hospital', distance: 0.8 }
    ]
  },
  {
    id: '2',
    name: 'Oak Grove Condos',
    address: '456 Oak Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    type: 'Condominium',
    yearBuilt: 2018,
    totalUnits: 18,
    occupiedUnits: 16,
    vacantUnits: 2,
    monthlyRent: 50400,
    expenses: 9800,
    netIncome: 40600,
    occupancyRate: 88.9,
    avgRentPerUnit: 2800,
    marketValue: 2100000,
    description: 'Luxury condos with bay views and premium finishes',
    amenities: ['Rooftop Deck', 'Concierge', 'Storage', 'Bike Storage', 'EV Charging'],
    images: ['/api/placeholder/400/300'],
    lastInspection: '2024-01-10',
    nextInspection: '2024-07-10',
    status: 'Active',
    manager: 'Sarah Johnson',
    purchaseDate: '2021-06-20',
    purchasePrice: 1800000,
    maintenanceRequests: 1,
    paymentStatus: 'current',
    leaseExpirations: 3,
    rating: 4.6,
    reviews: 89,
    tags: ['Waterfront', 'Luxury', 'New Construction'],
    notes: 'Excellent tenant satisfaction. Minor elevator maintenance scheduled.',
    coordinates: { lat: 37.7849, lng: -122.4094 },
    neighborhood: 'SOMA',
    walkScore: 92,
    transitScore: 87,
    bikeScore: 78,
    schools: [
      { name: 'SF Community College', rating: 8.8, distance: 0.6 }
    ],
    nearbyPlaces: [
      { name: 'Whole Foods', distance: 0.3 },
      { name: 'Caltrain Station', distance: 0.5 }
    ]
  }
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

type ViewMode = 'grid' | 'list' | 'map';

export function Properties() {
  const [properties] = useState(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || property.status.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'value':
        return b.marketValue - a.marketValue;
      case 'occupancy':
        return b.occupancyRate - a.occupancyRate;
      case 'income':
        return b.netIncome - a.netIncome;
      default:
        return 0;
    }
  });

  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const totalOccupied = properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const totalRevenue = properties.reduce((sum, p) => sum + p.monthlyRent, 0);
  const totalExpenses = properties.reduce((sum, p) => sum + p.expenses, 0);
  const totalNetIncome = totalRevenue - totalExpenses;
  const avgOccupancy = totalUnits > 0 ? (totalOccupied / totalUnits) * 100 : 0;

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
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your property portfolio with advanced analytics and insights
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" className="btn-ormi" onClick={() => setShowAddProperty(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2 this month
                </p>
              </div>
              <Building2 className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {totalOccupied} occupied
                </p>
              </div>
              <Home className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{avgOccupancy.toFixed(1)}%</p>
                <Progress value={avgOccupancy} className="mt-2" />
              </div>
              <Users className="h-8 w-8 text-ormi-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-gray-900">${totalNetIncome.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% vs last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-ormi-blue" />
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
                    placeholder="Search properties..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="value">Sort by Value</option>
                  <option value="occupancy">Sort by Occupancy</option>
                  <option value="income">Sort by Income</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Layers className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Properties Grid/List */}
      {viewMode === 'grid' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </motion.div>
      )}

      {viewMode === 'list' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {sortedProperties.map((property) => (
            <PropertyListItem key={property.id} property={property} />
          ))}
        </motion.div>
      )}

      {viewMode === 'map' && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Map View</h3>
                  <p className="text-gray-600">Interactive map showing all property locations</p>
                  <p className="text-sm text-gray-500 mt-2">Map integration coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Property Modal */}
      {showAddProperty && (
        <AddPropertyModal onClose={() => setShowAddProperty(false)} />
      )}
    </motion.div>
  );
}

// Property Card Component
function PropertyCard({ property }: { property: any }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="card-hover overflow-hidden">
      <div className="relative">
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <Badge variant="secondary" className="bg-white/90">
            {property.type}
          </Badge>
          {property.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-white/90">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2">
            <Badge className="bg-ormi-blue">
              {property.occupancyRate.toFixed(1)}% Occupied
            </Badge>
            <div className="flex items-center text-white text-sm">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              {property.rating}
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
          <div className="flex items-center space-x-1">
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

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{property.totalUnits}</p>
            <p className="text-xs text-gray-600">Total Units</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">${property.netIncome.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Monthly Net</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Occupancy</span>
            <span className="text-sm font-medium">{property.occupiedUnits}/{property.totalUnits}</span>
          </div>
          <Progress value={property.occupancyRate} className="h-2" />
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {property.maintenanceRequests} requests
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                {property.leaseExpirations} expiring
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
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Year Built</p>
                <p className="font-medium">{property.yearBuilt}</p>
              </div>
              <div>
                <p className="text-gray-600">Market Value</p>
                <p className="font-medium">${property.marketValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Avg Rent</p>
                <p className="font-medium">${property.avgRentPerUnit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Manager</p>
                <p className="font-medium">{property.manager}</p>
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1">
                {property.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-2">Notes</p>
              <p className="text-xs text-gray-700">{property.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Property List Item Component
function PropertyListItem({ property }: { property: any }) {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {property.address}, {property.city}, {property.state}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">{property.type}</Badge>
                <span className="text-sm text-gray-600">{property.totalUnits} units</span>
                <span className="text-sm text-gray-600">{property.occupancyRate.toFixed(1)}% occupied</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-gray-600">Monthly Net</p>
              <p className="text-lg font-bold text-green-600">${property.netIncome.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Market Value</p>
              <p className="text-lg font-bold text-gray-900">${property.marketValue.toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-1">
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
      </CardContent>
    </Card>
  );
}

// Add Property Modal Component
function AddPropertyModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'Apartment Complex',
    totalUnits: 1,
    yearBuilt: new Date().getFullYear(),
    purchasePrice: '',
    description: '',
    amenities: [] as string[],
  });

  const propertyTypes = [
    'Apartment Complex',
    'Single Family Home',
    'Duplex',
    'Townhouse',
    'Condominium',
    'Commercial Building',
    'Mixed Use',
    'Other'
  ];

  const amenityOptions = [
    'Pool', 'Gym', 'Parking', 'Laundry', 'Pet-friendly', 'Security',
    'Rooftop Deck', 'Concierge', 'Storage', 'Bike Storage', 'EV Charging',
    'Elevator', 'Balcony', 'Fireplace', 'Dishwasher', 'Air Conditioning',
    'Hardwood Floors', 'Walk-in Closet', 'Garden', 'Playground'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Property data:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add New Property</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter property name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ormi-blue focus:border-ormi-blue"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter street address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Enter state"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <Input
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="Enter ZIP code"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Units
              </label>
              <Input
                type="number"
                value={formData.totalUnits}
                onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built
              </label>
              <Input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: parseInt(e.target.value) })}
                min="1800"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price
              </label>
              <Input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="Enter purchase price"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter property description"
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ormi-blue focus:border-ormi-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {amenityOptions.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          amenities: [...formData.amenities, amenity]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          amenities: formData.amenities.filter(a => a !== amenity)
                        });
                      }
                    }}
                    className="text-ormi-blue focus:ring-ormi-blue"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="btn-ormi">
              Add Property
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Properties; 