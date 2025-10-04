import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import SweetAlert2 styles
import './styles/sweetAlert.css';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Projects from './pages/Projects';
import Quotations from './pages/Quotations';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import AdminAttendance from './pages/AdminAttendance';
import AttendancePage from "./pages/AttendancePage";
import Leaves from './pages/Leaves';
import Payments from './pages/Payments';
import Hosting from './pages/Hosting';
import Roles from './pages/Roles';
import Domains from './pages/Domains';
import Clients from './pages/Clients';
import FileDocs from './pages/FileDocs';
import Tasks from './pages/Tasks';
import Designations from './pages/Designations';
import Technologies from './pages/Technologies';
import AppModes from './pages/AppModes';
import ProjectProfitLoss from './pages/ProjectProfitLoss';
import MyProfile from './pages/MyProfile';

// Import layout
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Import API test utility for debugging
if (process.env.NODE_ENV === 'development') {
  import('./utils/apiTest');
}


// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('AdminRoute Check:', { isLoading, isAuthenticated, user });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Staff Route component (for employees who can access certain pages)
const StaffRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow all authenticated users (both admin and regular employees)
  // In the original Python project, all employees can access attendance and leaves
  return children;
};

// Component to handle dynamic redirects
const DynamicRedirect = () => {
  const { user } = useAuth();
  const targetPath = user?.is_superuser ? "/admin" : "/dashboard";
  return <Navigate to={targetPath} replace />;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <DynamicRedirect />
          ) : (
            <Login />
          )
        }
      />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DynamicRedirect />} />

        {/* Staff Dashboard - Available to all authenticated users */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Admin Only Routes */}
        <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="projects" element={<AdminRoute><Projects /></AdminRoute>} />
        <Route path="quotations" element={<AdminRoute><Quotations /></AdminRoute>} />
        <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="admin-attendance" element={<AdminRoute><AdminAttendance /></AdminRoute>} />
        <Route path="roles" element={<AdminRoute><Roles /></AdminRoute>} />
        <Route path="payments" element={<AdminRoute><Payments /></AdminRoute>} />
        <Route path="hosting" element={<AdminRoute><Hosting /></AdminRoute>} />
        <Route path="domains" element={<AdminRoute><Domains /></AdminRoute>} />
        <Route path="clients" element={<AdminRoute><Clients /></AdminRoute>} />
        <Route path="file-docs" element={<AdminRoute><FileDocs /></AdminRoute>} />
        <Route path="tasks" element={<AdminRoute><Tasks /></AdminRoute>} />
        <Route path="designations" element={<AdminRoute><Designations /></AdminRoute>} />
        <Route path="technologies" element={<AdminRoute><Technologies /></AdminRoute>} />
        <Route path="app-modes" element={<AdminRoute><AppModes /></AdminRoute>} />
        <Route path="project-profit-loss" element={<AdminRoute><ProjectProfitLoss /></AdminRoute>} />

        {/* Staff Routes - Available to all authenticated users */}
        <Route path="attendance" element={<StaffRoute><Attendance /></StaffRoute>} />
        <Route path="leaves" element={<StaffRoute><Leaves /></StaffRoute>} />
        <Route path="my-profile" element={<StaffRoute><MyProfile /></StaffRoute>} />
        <Route path="my-tasks" element={<StaffRoute><Tasks /></StaffRoute>} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: 'green',
                    secondary: 'black',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
