import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

import { Dashboard } from '@/pages/Dashboard';

import { Properties } from '@/pages/Properties';
import { Units } from '@/pages/Units';
import { Tenants } from '@/pages/Tenants';
import { Payments } from '@/pages/Payments';
import { Maintenance } from '@/pages/Maintenance';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

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
                <Route path="/login" element={
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                } />
                <Route path="/register" element={
                  <AuthLayout>
                    <Register />
                  </AuthLayout>
                } />
                <Route path="/forgot-password" element={
                  <AuthLayout>
                    <ForgotPassword />
                  </AuthLayout>
                } />
                <Route path="/reset-password" element={
                  <AuthLayout>
                    <ResetPassword />
                  </AuthLayout>
                } />

                {/* Protected routes */}
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
                <Route path="/payments" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Payments />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
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

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App; 