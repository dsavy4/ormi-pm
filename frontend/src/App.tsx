import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Error Handling
import ErrorPage from './pages/ErrorPage';
import RouteErrorPage from './pages/RouteErrorPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Main Pages
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { PropertyUnits } from './pages/PropertyUnits';
import { Tenants } from './pages/Tenants';
import { Maintenance } from './pages/Maintenance';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

// Tenant Portal Pages (temporarily commented out)
// import TenantLogin from './pages/tenant/TenantLogin';
// import TenantDashboard from './pages/tenant/TenantDashboard';

// Advanced Features (commented out for now to avoid TypeScript errors)
import Managers from './pages/Managers';
import Team from './pages/Team';
import Documents from './pages/Documents';
// import Payments from './pages/Payments';
// import DocumentManagement from './pages/DocumentManagement';
// import AdvancedMaintenance from './pages/AdvancedMaintenance';
// import AIAnalytics from './pages/AIAnalytics';
// import CommunicationSystem from './pages/CommunicationSystem';
// import MultiPropertyManagement from './pages/MultiPropertyManagement';
// import TenantDocumentManagement from './pages/tenant/DocumentManagement';
// import TenantMaintenanceRequest from './pages/tenant/MaintenanceRequest';
// import TenantDashboard from './pages/tenant/TenantDashboard';
// import TenantLogin from './pages/tenant/TenantLogin';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
              {/* Public Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              
              {/* Redirect /login to /auth/login for convenience */}
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              
              {/* Error Pages */}
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              
              {/* Tenant Portal Routes (temporarily commented out) */}
              {/* <Route path="/tenant/login" element={<TenantLogin />} /> */}
              {/* <Route path="/tenant/dashboard" element={<TenantDashboard />} /> */}
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />
              <Route path="/properties" element={<ProtectedRoute><DashboardLayout><Properties /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />
              <Route path="/properties/:propertyId" element={<ProtectedRoute><DashboardLayout><Properties /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />

              <Route path="/properties/:propertyId/units" element={<ProtectedRoute><DashboardLayout><PropertyUnits /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />
              <Route path="/tenants" element={<ProtectedRoute><DashboardLayout><Tenants /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />
              <Route path="/maintenance" element={<ProtectedRoute><DashboardLayout><Maintenance /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />
              <Route path="/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />
              <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} errorElement={<RouteErrorPage />} />
              
              {/* Advanced Features (commented out for now) */}
                      <Route path="/managers" element={<ProtectedRoute><DashboardLayout><Managers /></DashboardLayout></ProtectedRoute>} />
        <Route path="/managers/:managerId" element={<ProtectedRoute><DashboardLayout><Managers /></DashboardLayout></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><DashboardLayout><Team /></DashboardLayout></ProtectedRoute>} />
        <Route path="/team/:teamMemberId" element={<ProtectedRoute><DashboardLayout><Team /></DashboardLayout></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DashboardLayout><Documents /></DashboardLayout></ProtectedRoute>} />
        <Route path="/documents/:documentId" element={<ProtectedRoute><DashboardLayout><Documents /></DashboardLayout></ProtectedRoute>} />
              {/* <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} /> */}
              {/* <Route path="/document-management" element={<ProtectedRoute><DocumentManagement /></ProtectedRoute>} /> */}
              {/* <Route path="/advanced-maintenance" element={<ProtectedRoute><AdvancedMaintenance /></ProtectedRoute>} /> */}
              {/* <Route path="/ai-analytics" element={<ProtectedRoute><AIAnalytics /></ProtectedRoute>} /> */}
              {/* <Route path="/communication" element={<ProtectedRoute><CommunicationSystem /></ProtectedRoute>} /> */}
              {/* <Route path="/multi-property" element={<ProtectedRoute><MultiPropertyManagement /></ProtectedRoute>} /> */}
              
              {/* Tenant Portal Protected Routes (commented out for now) */}
              {/* <Route path="/tenant/document-management" element={<ProtectedRoute><TenantDocumentManagement /></ProtectedRoute>} /> */}
              {/* <Route path="/tenant/maintenance-request" element={<ProtectedRoute><TenantMaintenanceRequest /></ProtectedRoute>} /> */}
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
  );
}

export default App;
