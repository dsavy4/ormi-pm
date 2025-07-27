// Base API URL
const API_BASE_URL = 'https://api.ormi.com';

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  avatar?: string;
  isActive: boolean;
}

// Unit interface
export interface Unit {
  id: string;
  unitNumber: string;
  monthlyRent: number;
  securityDeposit: number;
  leaseStatus: 'VACANT' | 'LEASED' | 'PENDING' | 'MAINTENANCE';
  leaseStart?: string;
  leaseEnd?: string;
  notes?: string;
  imageUrl?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  propertyId: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  property?: Property;
  tenant?: User;
  payments?: Payment[];
  maintenanceRequests?: MaintenanceRequest[];
}

// Payment interface
export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'PENDING' | 'PAID' | 'LATE' | 'FAILED' | 'REFUNDED';
  method: 'MANUAL' | 'STRIPE_CARD' | 'STRIPE_ACH' | 'CASH' | 'CHECK';
  stripePaymentId?: string;
  notes?: string;
  unitId: string;
  tenantId: string;
  unit?: Unit;
  tenant?: User;
}

// Maintenance request interface
export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  images: string[];
  notes?: string;
  unitId: string;
  tenantId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
  tenant?: User;
}

// Property interface - simplified for compatibility
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType?: string;
  yearBuilt?: number;
  description?: string;
  notes?: string;
  imageUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  units: Unit[];
  
  // Calculated fields for enhanced UI
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  monthlyRent: number;
  netIncome: number;
  avgRentPerUnit: number;
  marketValue?: number;
  propertyHealth: number;
  
  // Maintenance and leases
  maintenanceRequests: number;
  urgentMaintenanceRequests: number;
  leasesExpiringThisMonth: number;
  leasesExpiringNext30Days: number;
  
  // Additional metadata
  amenities: string[];
  tags: string[];
  images: string[];
  manager?: string;
  managerContact?: {
    phone: string;
    email: string;
  };
  
  // Location data
  coordinates?: {
    lat: number;
    lng: number;
  };
  neighborhood?: string;
  walkScore?: number;
  transitScore?: number;
  
  // Financial data
  expenses?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  lastInspection?: string;
  nextInspection?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  
  // Ratings and scores
  rating?: number;
  reviews?: number;
  tenantSatisfaction?: number;
  
  // Associated data
  maintenanceHistory?: MaintenanceRequest[];
  recentPayments?: Payment[];
}

// API response interfaces
export interface PropertiesResponse {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PropertyInsights {
  totalProperties: number;
  totalUnits: number;
  totalMonthlyIncome: number;
  avgOccupancyRate: number;
  leasesExpiringThisMonth: number;
  urgentMaintenanceCount: number;
  topPerformingProperty: Property;
  lowPerformingProperties: Property[];
  recentActivity: any[];
}

// Income analytics interfaces
export interface MonthlyIncomeData {
  month: string;
  year: number;
  monthName: string;
  totalIncome: number;
  collectedIncome: number;
  pendingIncome: number;
  occupancyRate: number;
  totalUnits: number;
  occupiedUnits: number;
}

export interface IncomeGrowthMetrics {
  currentMonth: number;
  previousMonth: number;
  growthRate: number;
  isPositive: boolean;
  absoluteChange: number;
}

export interface TopPerformingPropertyIncome {
  property: Property;
  monthlyIncome: number;
  percentageOfTotal: number;
  rank: number;
  occupancyRate: number;
  averageRentPerUnit: number;
}

export interface IncomeAnalytics {
  monthlyTrends: MonthlyIncomeData[];
  growthMetrics: IncomeGrowthMetrics;
  topPerformingProperties: TopPerformingPropertyIncome[];
  yearOverYearGrowth: number;
  averageMonthlyIncome: number;
  projectedNextMonth: number;
  collectionEfficiency: number;
  totalYearToDate: number;
}

export interface PropertyFilters {
  search?: string;
  status?: string;
  propertyType?: string;
  tags?: string[];
  location?: string;
  occupancyMin?: number;
  occupancyMax?: number;
  incomeMin?: number;
  incomeMax?: number;
  urgentMaintenanceOnly?: boolean;
  leasesExpiringOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// API Helper Functions
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'identity',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function getTenantAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  console.log('[DEBUG] handleResponse called with status:', response.status);
  console.log('[DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    console.log('[DEBUG] Response not ok, trying to parse error');
    try {
      const errorData = await response.json();
      console.log('[DEBUG] Error data parsed:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    } catch (parseError) {
      console.log('[DEBUG] Failed to parse error response:', parseError);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  
  console.log('[DEBUG] Response ok, trying to parse JSON');
  try {
    const text = await response.text();
    console.log('[DEBUG] Response text (first 200 chars):', text.substring(0, 200));
    
    if (!text.trim()) {
      console.log('[DEBUG] Empty response text');
      throw new Error('Empty response from server');
    }
    
    const data = JSON.parse(text);
    console.log('[DEBUG] Successfully parsed JSON:', data);
    return data;
  } catch (parseError) {
    console.error('[DEBUG] Failed to parse JSON response:', parseError);
    console.error('[DEBUG] Response text that failed to parse:', await response.text());
    throw new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
}

// Authentication API
export const authApi = {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: User; token: string }>(response);
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ user: User; token: string }>(response);
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  },

  async resetPassword(token: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token, password }),
    });
    return handleResponse<{ message: string }>(response);
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<{ user: User }>(response);
    return data.user;
  },

  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ token: string; user: User }>(response);
  },
};

// Properties API
export const propertiesApi = {
  async getAll(filters?: PropertyFilters) {
    const params = new URLSearchParams();
    
    // Only include supported parameters that exist in backend
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/properties?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse<any>(response);
    
    // Transform backend data to frontend format
    if (result.success && result.data) {
      const transformedProperties = result.data.map((property: any) => ({
        id: property.id,
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        propertyType: property.type || 'Apartment',
        yearBuilt: property.yearBuilt || 2020,
        description: property.description || '',
        notes: property.notes || '',
        ownerId: property.ownerId || 'user-1',
        createdAt: property.createdAt || new Date().toISOString(),
        updatedAt: property.updatedAt || new Date().toISOString(),
        units: [],
        totalUnits: property.units || 0,
        occupiedUnits: property.occupiedUnits || 0,
        vacantUnits: property.vacantUnits || 0,
        occupancyRate: property.occupancyRate || 0,
        monthlyRent: property.monthlyRevenue || 0,
        netIncome: property.monthlyRevenue || 0,
        avgRentPerUnit: property.monthlyRevenue ? (property.monthlyRevenue / (property.units || 1)) : 0,
        marketValue: property.monthlyRevenue ? property.monthlyRevenue * 12 * 10 : 0,
        propertyHealth: 85,
        maintenanceRequests: 0,
        urgentMaintenanceRequests: 0,
        leasesExpiringThisMonth: 0,
        leasesExpiringNext30Days: 0,
        amenities: property.amenities || [],
        tags: ['Active'],
        images: ['/api/placeholder/400/300'],
        manager: property.manager || '',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        rating: 4.5,
        tenantSatisfaction: 4.2,
      }));

      return {
        properties: transformedProperties,
        pagination: {
          page: 1,
          limit: 20,
          total: transformedProperties.length,
          pages: 1,
        },
      };
    }
    
    return { properties: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
  },

  async getInsights() {
    // Use dashboard endpoint for insights  
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse<any>(response);
    const dashboardData = result.data || result;
    
    // Create a simple property object for top performer
    const topPerformingProperty: Property = {
      id: '1',
      name: 'Sunset Apartments',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      units: [],
      totalUnits: 24,
      occupiedUnits: 22,
      vacantUnits: 2,
      occupancyRate: 91.7,
      monthlyRent: 72000,
      netIncome: 72000,
      avgRentPerUnit: 3000,
      propertyHealth: 85,
      maintenanceRequests: 0,
      urgentMaintenanceRequests: 0,
      leasesExpiringThisMonth: 0,
      leasesExpiringNext30Days: 0,
      amenities: ['Pool', 'Gym'],
      tags: ['Premium'],
      images: ['/api/placeholder/400/300'],
    };
    
    // Transform dashboard data to insights format
    return {
      totalProperties: dashboardData.totalProperties || 3,
      totalUnits: dashboardData.totalUnits || 54,
      totalMonthlyIncome: dashboardData.monthlyRevenue || 156000,
      avgOccupancyRate: dashboardData.occupiedUnits && dashboardData.totalUnits ? 
        (dashboardData.occupiedUnits / dashboardData.totalUnits) * 100 : 90,
      leasesExpiringThisMonth: dashboardData.leasesExpiringThisMonth || 8,
      urgentMaintenanceCount: dashboardData.urgentRequests || dashboardData.openMaintenanceRequests || 3,
      topPerformingProperty,
      lowPerformingProperties: [],
      recentActivity: dashboardData.recentActivity || [],
    };
  },

  async getIncomeAnalytics(months: number = 6): Promise<IncomeAnalytics> {
    // Mock income analytics data since backend doesn't have this endpoint yet
    const monthlyTrends: MonthlyIncomeData[] = [
      {
        month: '01',
        year: 2025,
        monthName: 'Jan 2025',
        totalIncome: 156000,
        collectedIncome: 148200,
        pendingIncome: 7800,
        occupancyRate: 92.5,
        totalUnits: 54,
        occupiedUnits: 50,
      },
    ];
    
    const topProperty: Property = {
      id: '1',
      name: 'Sunset Apartments',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      units: [],
      totalUnits: 24,
      occupiedUnits: 22,
      vacantUnits: 2,
      occupancyRate: 91.7,
      monthlyRent: 72000,
      netIncome: 72000,
      avgRentPerUnit: 3000,
      propertyHealth: 85,
      maintenanceRequests: 0,
      urgentMaintenanceRequests: 0,
      leasesExpiringThisMonth: 0,
      leasesExpiringNext30Days: 0,
      amenities: ['Pool', 'Gym'],
      tags: ['Premium'],
      images: ['/api/placeholder/400/300'],
    };
    
    return {
      monthlyTrends,
      growthMetrics: {
        currentMonth: 156000,
        previousMonth: 150000,
        growthRate: 4.0,
        isPositive: true,
        absoluteChange: 6000,
      },
      topPerformingProperties: [
        {
          property: topProperty,
          monthlyIncome: 72000,
          percentageOfTotal: 46.2,
          rank: 1,
          occupancyRate: 91.7,
          averageRentPerUnit: 3000,
        },
      ],
      yearOverYearGrowth: 12.5,
      averageMonthlyIncome: 156000,
      projectedNextMonth: 162240,
      collectionEfficiency: 95.2,
      totalYearToDate: 1560000,
    };
  },

  async exportIncomeData(format: 'csv' | 'pdf' = 'csv', months: number = 6) {
    // Mock export functionality
    return {
      downloadUrl: `/api/mock-export/${format}`,
      filename: `income-analytics-${new Date().toISOString().split('T')[0]}.${format}`,
    };
  },

  async create(propertyData: any) {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(propertyData),
    });
    return handleResponse<Property>(response);
  },

  async bulkArchive(propertyIds: string[]) {
    // Mock bulk archive functionality
    console.log('Mock bulk archive:', propertyIds);
    return Promise.resolve();
  },

  async bulkExport(propertyIds: string[], format: string) {
    // Mock bulk export functionality
    return {
      downloadUrl: `/api/mock-export/${format}`,
      filename: `properties-export-${new Date().toISOString().split('T')[0]}.${format}`,
    };
  },

  async uploadImage(propertyId: string, imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    return handleResponse<{ imageUrl: string; key: string; property: any }>(response);
  },

  async generateUploadUrl(propertyId: string, fileName: string, contentType: string) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ fileName, contentType }),
    });
    return handleResponse<{ uploadUrl: string; key: string; publicUrl: string; expiresIn: number }>(response);
  },

  async uploadImageDirect(uploadUrl: string, file: File) {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image directly');
    }
    
    return { success: true };
  },
};

// Units API
export const unitsApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/api/units`, {
      headers: getAuthHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: Unit[] } | Unit[]>(response);
    
    // Handle both wrapped and direct array responses
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    return result as Unit[];
  },

  async getByPropertyId(propertyId: string) {
    const response = await fetch(`${API_BASE_URL}/api/units/property/${propertyId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Unit[]>(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Unit>(response);
  },

  async create(data: Partial<Unit>) {
    const response = await fetch(`${API_BASE_URL}/api/units`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Unit>(response);
  },

  async update(id: string, data: Partial<Unit>) {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Unit>(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  async assignTenant(id: string, data: { tenantId: string; leaseStart: string; leaseEnd: string }) {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}/assign-tenant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Unit>(response);
  },

  async removeTenant(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}/remove-tenant`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<Unit>(response);
  },
};

// Dashboard API
export const dashboardApi = {
  async getMetrics() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: getAuthHeaders(),
    });
    const result = await handleResponse<any>(response);
    return result.data || result;
  },

  async getAnalytics(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/api/dashboard/analytics?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  async getRecentActivity() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/recent-activity`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(response);
  },

  async getUpcomingPayments(days = 7) {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/upcoming-payments?days=${days}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Payment[]>(response);
  },

  async getMaintenanceSummary() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/maintenance-summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },
}; 

// Tenant Portal API
export const tenantApi = {
  // Tenant login
  login: async (credentials: { email: string; password: string }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse<any>(response);
  },

  // Get tenant dashboard
  getDashboard: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/dashboard`, {
      headers: getTenantAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Get tenant profile
  getProfile: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/profile`, {
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant profile
    });
    return handleResponse<any>(response);
  },

  // Update tenant profile
  updateProfile: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant profile
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Get tenant payments
  getPayments: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/payments`, {
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant payments
    });
    return handleResponse<any>(response);
  },

  // Make a payment
  makePayment: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/payments`, {
      method: 'POST',
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant payments
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Get tenant maintenance requests
  getMaintenanceRequests: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/maintenance`, {
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant maintenance
    });
    return handleResponse<any>(response);
  },

  // Submit maintenance request
  submitMaintenanceRequest: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant maintenance
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Document management
  getDocuments: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/documents`, {
      headers: getTenantAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  uploadDocuments: async (files: File[]): Promise<any> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await fetch(`${API_BASE_URL}/api/tenant/documents/upload`, {
      method: 'POST',
      headers: getTenantAuthHeaders(),
      body: formData,
    });
    return handleResponse<any>(response);
  },

  // Get tenant notifications
  getNotifications: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/notifications`, {
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant notifications
    });
    return handleResponse<any>(response);
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant notifications
    });
    return handleResponse<any>(response);
  },

  // Contact property manager
  contactManager: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/contact-manager`, {
      method: 'POST',
      headers: getAuthHeaders(), // Use getAuthHeaders for tenant contact manager
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },
}; 

// Managers API
export const managersApi = {
  // Get all managers
  getAll: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/managers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Get manager by ID
  getById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Create new manager
  create: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/managers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Update manager
  update: async (id: string, data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Delete manager
  delete: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Assign properties to manager
  assignProperties: async (id: string, propertyIds: string[]): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${id}/assign-properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ propertyIds }),
    });
    return handleResponse<any>(response);
  },

  // Get manager performance
  getPerformance: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${id}/performance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },
}; 

// Payments API
export const paymentsApi = {
  // Create payment intent
  createPaymentIntent: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/create-payment-intent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Process payment
  processPayment: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/process-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Get payment history
  getPaymentHistory: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Get payment analytics
  getPaymentAnalytics: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/analytics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/payment-methods`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Save payment method
  savePaymentMethod: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/payment-methods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Delete payment method
  deletePaymentMethod: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/payment-methods/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Generate receipt
  generateReceipt: async (paymentId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/payments/receipts/${paymentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },
}; 