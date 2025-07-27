import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TenantLayout } from '@/components/layout/TenantLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

import { Dashboard } from '@/pages/Dashboard';

import { Properties } from '@/pages/Properties';
// import { Managers } from '@/pages/Managers';
import { Units } from '@/pages/Units';
import { Tenants } from '@/pages/Tenants';
// import { Payments } from '@/pages/Payments';
import { Maintenance } from '@/pages/Maintenance';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

// Tenant Portal Pages
import { TenantDashboard } from '@/pages/tenant/TenantDashboard';
import { TenantLogin } from '@/pages/tenant/TenantLogin';
// import { DocumentManagement } from '@/pages/tenant/DocumentManagement';

import './App.css';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Tenant Portal Routes */}
                <Route path="/tenant/login" element={<TenantLogin />} />

                {/* Property Manager Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/properties" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Properties />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                {/* <Route path="/managers" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Managers />
                    </DashboardLayout>
                  </ProtectedRoute>
                } /> */}
                <Route path="/units" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Units />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/tenants" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Tenants />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                {/* Temporarily commented out due to TypeScript errors */}
                {/* <Route path="/payments" element={<Payments />} /> */}
                {/* <Route path="/managers" element={<Managers />} /> */}
                {/* <Route path="/document-management" element={<DocumentManagement />} /> */}
                {/* <Route path="/advanced-maintenance" element={<AdvancedMaintenance />} /> */}
                <Route path="/maintenance" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Maintenance />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Reports />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Tenant Portal Routes */}
                <Route path="/tenant/dashboard" element={
                  <TenantLayout>
                    <TenantDashboard />
                  </TenantLayout>
                } />
                {/* <Route path="/tenant/documents" element={
                  <TenantLayout>
                    <DocumentManagement />
                  </TenantLayout>
                } /> */}

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
