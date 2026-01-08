import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Auth/Login';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminLeads from './pages/Admin/Leads';
import AdminLeadDetail from './pages/Admin/LeadDetail';
import AdminUsers from './pages/Admin/Users';
import AdminReports from './pages/Admin/Reports';

// Sales Pages
import SalesDashboard from './pages/Sales/Dashboard';
import SalesLeadDetail from './pages/Sales/LeadDetail';

const LeadDetailRedirect = () => {
  const { user } = useAuth();
  if (user.role === 'ADMIN') return <AdminLeadDetail />;
  return <SalesLeadDetail />;
};

const ProtectedRoute = ({ children }) => {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <DashboardLayout user={user} logout={logout}>
      {children}
    </DashboardLayout>
  );
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user.role === 'ADMIN') return <AdminDashboard />;
  return <SalesDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthConsumerLogin />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          <Route path="/leads" element={
            <ProtectedRoute>
              <AdminLeads />
            </ProtectedRoute>
          } />

          <Route path="/leads/:id" element={
            <ProtectedRoute>
              <LeadDetailRedirect />
            </ProtectedRoute>
          } />

          <Route path="/sales-team" element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <AdminReports />
            </ProtectedRoute>
          } />

          <Route path="/audit" element={
            <ProtectedRoute>
              <div className="card" style={{ padding: '2rem' }}>
                <h1 style={{ fontWeight: '800', marginBottom: '1rem' }}>Global Activity Logs</h1>
                <p style={{ color: '#64748b' }}>Full audit trail of all system actions (Coming soon).</p>
              </div>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Helper to pass login function
const AuthConsumerLogin = () => {
  const { login } = useAuth();
  return <Login onLogin={login} />;
};

export default App;
