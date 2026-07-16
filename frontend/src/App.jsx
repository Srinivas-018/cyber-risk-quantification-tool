import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetForm from './pages/AssetForm';
import AssetDetail from './pages/AssetDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Protected Application Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/assets" element={
            <ProtectedRoute>
              <AssetList />
            </ProtectedRoute>
          } />
          <Route path="/assets/new" element={
            <ProtectedRoute>
              <AssetForm />
            </ProtectedRoute>
          } />
          <Route path="/assets/:id" element={
            <ProtectedRoute>
              <AssetDetail />
            </ProtectedRoute>
          } />
          <Route path="/assets/:id/edit" element={
            <ProtectedRoute>
              <AssetForm />
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
