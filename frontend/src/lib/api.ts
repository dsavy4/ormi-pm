// API Configuration
const API_BASE_URL = 'https://api.ormi.com';

// Types
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
  description?: string;
  notes?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  units?: Unit[];
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
  propertyId: string;
  tenantId?: string;
  property?: Property;
  tenant?: User;
  payments?: Payment[];
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

// API Helper Functions
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
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
};

// Properties API
export const propertiesApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Property[]>(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Property>(response);
  },

  async create(data: Partial<Property>) {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Property>(response);
  },

  async update(id: string, data: Partial<Property>) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Property>(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Units API
export const unitsApi = {
  async getByPropertyId(propertyId: string) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/units`, {
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

// Tenants API
export const tenantsApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/api/tenants`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User[]>(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },

  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    password: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/tenants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  async update(id: string, data: Partial<User>) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  async getPaymentHistory(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}/payments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Payment[]>(response);
  },

  async getMaintenanceRequests(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/${id}/maintenance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<MaintenanceRequest[]>(response);
  },
};

// Payments API
export const paymentsApi = {
  async getAll(params?: { page?: number; limit?: number; status?: string; propertyId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);

    const response = await fetch(`${API_BASE_URL}/api/payments?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Payment[]>(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Payment>(response);
  },

  async create(data: Partial<Payment>) {
    const response = await fetch(`${API_BASE_URL}/api/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Payment>(response);
  },

  async update(id: string, data: Partial<Payment>) {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Payment>(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  async markAsPaid(id: string, data: { paymentDate?: string; method?: string; notes?: string }) {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}/mark-paid`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Payment>(response);
  },

  async generateRecurring(data: { unitId: string; months?: number; startDate: string }) {
    const response = await fetch(`${API_BASE_URL}/api/payments/generate-recurring`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; payments: Payment[] }>(response);
  },

  async getSummary(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/api/payments/summary?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },
};

// Maintenance API
export const maintenanceApi = {
  async getAll(params?: { status?: string; priority?: string; propertyId?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/maintenance?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<MaintenanceRequest[]>(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<MaintenanceRequest>(response);
  },

  async create(data: Partial<MaintenanceRequest>) {
    const response = await fetch(`${API_BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MaintenanceRequest>(response);
  },

  async update(id: string, data: Partial<MaintenanceRequest>) {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MaintenanceRequest>(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  async updateStatus(id: string, data: { status: string; notes?: string }) {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MaintenanceRequest>(response);
  },

  async addComment(id: string, data: { content: string }) {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async getComments(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}/comments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(response);
  },

  async getSummary(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/api/maintenance/summary?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },
};

// Reports API
export const reportsApi = {
  async getRentRoll(params?: { propertyId?: string; date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.date) searchParams.append('date', params.date);

    const response = await fetch(`${API_BASE_URL}/api/reports/rent-roll?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  async getPaymentHistory(params?: { propertyId?: string; startDate?: string; endDate?: string; tenantId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);

    const response = await fetch(`${API_BASE_URL}/api/reports/payment-history?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  async getMaintenanceLog(params?: { propertyId?: string; startDate?: string; endDate?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.status) searchParams.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/api/reports/maintenance-log?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  async getFinancialSummary(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/api/reports/financial-summary?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  async getVacancyReport(params?: { propertyId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);

    const response = await fetch(`${API_BASE_URL}/api/reports/vacancy?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  async getLeaseExpirationReport(params?: { propertyId?: string; months?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.months) searchParams.append('months', params.months.toString());

    const response = await fetch(`${API_BASE_URL}/api/reports/lease-expiration?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },
};

// Dashboard API
export const dashboardApi = {
  async getMetrics() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  async getAnalytics(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/api/dashboard/analytics?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },
};

// Export all APIs
export default {
  auth: authApi,
  properties: propertiesApi,
  units: unitsApi,
  tenants: tenantsApi,
  payments: paymentsApi,
  maintenance: maintenanceApi,
  reports: reportsApi,
  dashboard: dashboardApi,
}; 