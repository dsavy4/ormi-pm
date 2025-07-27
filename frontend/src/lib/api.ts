// API Configuration
const API_BASE_URL = 'https://api.ormi.com';

// TypeScript Interfaces
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

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'identity',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  console.log('[DEBUG] getAuthHeaders called, headers:', headers);
  return headers;
}

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    console.log('[DEBUG] getAuthToken called, token found:', !!token);
    console.log('[DEBUG] Token value:', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  }
  return null;
}

// Enhanced response handler with better error handling
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

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  resetPassword: async (token: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify({ token, password }),
    });
    return handleResponse(response);
  },
};

// Dashboard API
export const dashboardApi = {
  getMetrics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Property Management API
export const propertiesApi = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/properties?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  uploadImage: async (propertyId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Remove Content-Type to let browser set it for FormData
      },
      body: formData,
    });
    return handleResponse(response);
  },

  export: async () => {
    const response = await fetch(`${API_BASE_URL}/api/export/properties`, {
      headers: getAuthHeaders(),
    });
    return response.blob();
  },

  bulkDelete: async (ids: string[]) => {
    const response = await fetch(`${API_BASE_URL}/api/bulk/delete-properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });
    return handleResponse(response);
  },

  // Additional methods referenced in components
  getInsights: async () => {
    const response = await fetch(`${API_BASE_URL}/api/properties/insights`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  bulkArchive: async (ids: string[]) => {
    const response = await fetch(`${API_BASE_URL}/api/properties/bulk-archive`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });
    return handleResponse(response);
  },

  bulkExport: async (ids: string[], format: string) => {
    const response = await fetch(`${API_BASE_URL}/api/properties/bulk-export`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids, format }),
    });
    return handleResponse(response);
  },

  getIncomeAnalytics: async (months: number) => {
    const response = await fetch(`${API_BASE_URL}/api/properties/income-analytics?months=${months}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  exportIncomeData: async (format: string, months: number) => {
    const response = await fetch(`${API_BASE_URL}/api/properties/export-income?format=${format}&months=${months}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Unit Management API
export const unitsApi = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await fetch(`${API_BASE_URL}/api/units?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/units`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  assignTenant: async (unitId: string, tenantId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/units/${unitId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tenantId }),
    });
    return handleResponse(response);
  },

  removeTenant: async (unitId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/units/${unitId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tenantId: null }),
    });
    return handleResponse(response);
  },
};

// Tenant Management API
export const tenantsApi = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await fetch(`${API_BASE_URL}/api/tenants?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPayments: async (tenantId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}/payments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMaintenance: async (tenantId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}/maintenance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Payment Management API
export const paymentsApi = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.unitId) params.append('unitId', filters.unitId);
    if (filters?.tenantId) params.append('tenantId', filters.tenantId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await fetch(`${API_BASE_URL}/api/payments?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markPaid: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: 'PAID', paymentDate: new Date().toISOString() }),
    });
    return handleResponse(response);
  },

  generateRecurring: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/generate-recurring`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/api/payments/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Additional methods referenced in components
  createPaymentIntent: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/create-payment-intent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  processPayment: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/process-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Tenant API (alias for tenantsApi for backward compatibility)
export const tenantApi = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await fetch(`${API_BASE_URL}/api/tenants?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPayments: async (tenantId?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${tenantId || 'me'}/payments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMaintenance: async (tenantId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}/maintenance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Tenant-specific login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/tenant-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Additional methods referenced in components
  makePayment: async (paymentData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },

  getDocuments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/documents`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  uploadDocuments: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`${API_BASE_URL}/api/tenants/documents/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Remove Content-Type to let browser set it for FormData
      },
      body: formData,
    });
    return handleResponse(response);
  },

  submitMaintenanceRequest: async (data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/maintenance`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Remove Content-Type to let browser set it for FormData
      },
      body: data,
    });
    return handleResponse(response);
  },

  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tenants/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Maintenance Management API
export const maintenanceApi = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.unitId) params.append('unitId', filters.unitId);
    if (filters?.tenantId) params.append('tenantId', filters.tenantId);
    
    const response = await fetch(`${API_BASE_URL}/api/maintenance?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  addComment: async (id: string, comment: string) => {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content: comment }),
    });
    return handleResponse(response);
  },

  getComments: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}/comments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Manager Management API
export const managersApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/managers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/managers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  assignProperty: async (managerId: string, propertyId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${managerId}/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ propertyId }),
    });
    return handleResponse(response);
  },

  unassignProperty: async (managerId: string, propertyId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${managerId}/properties/${propertyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPerformance: async (managerId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/managers/${managerId}/performance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Analytics API
export const analyticsApi = {
  getOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMetrics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getRevenue: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await fetch(`${API_BASE_URL}/api/analytics/revenue?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getOccupancy: async () => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/occupancy`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMaintenance: async () => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/maintenance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// File Upload API
export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Remove Content-Type to let browser set it for FormData
      },
      body: formData,
    });
    return handleResponse(response);
  },

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload/document`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Remove Content-Type to let browser set it for FormData
      },
      body: formData,
    });
    return handleResponse(response);
  },
};

// Search API
export const searchApi = {
  search: async (query: string, type: string = 'all') => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/api/search?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markRead: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markAllRead: async () => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Settings API
export const settingsApi = {
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  update: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Reports API
export const reportsApi = {
  getRentRoll: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await fetch(`${API_BASE_URL}/api/reports/rent-roll?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPaymentHistory: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.tenantId) params.append('tenantId', filters.tenantId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await fetch(`${API_BASE_URL}/api/reports/payment-history?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMaintenanceLog: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await fetch(`${API_BASE_URL}/api/reports/maintenance-log?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getFinancialSummary: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await fetch(`${API_BASE_URL}/api/reports/financial-summary?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getVacancy: async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/vacancy`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getLeaseExpiration: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.months) params.append('months', filters.months.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/reports/lease-expiration?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
}; 