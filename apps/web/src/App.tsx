import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { ComparePage } from './pages/ComparePage';
import { MapPage } from './pages/MapPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SeekerDashboardPage } from './pages/SeekerDashboardPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AddPropertyPage } from './pages/AddPropertyPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const fetchMe = useAuthStore(state => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/property/:slug" element={<PropertyDetailsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Seeker Protected Routes */}
          <Route path="/app" element={<SeekerDashboardPage />} />
          <Route path="/app/*" element={<SeekerDashboardPage />} />

          {/* Owner Dashboard Routes */}
          <Route path="/owner" element={<OwnerDashboardPage />} />
          <Route path="/owner/properties" element={<OwnerDashboardPage />} />
          <Route path="/owner/properties/new" element={<AddPropertyPage />} />
          <Route path="/owner/*" element={<OwnerDashboardPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
