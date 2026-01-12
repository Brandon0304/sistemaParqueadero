import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Vehiculos from './components/Vehiculos';
import Tickets from './components/Tickets';
import TicketsActivos from './components/TicketsActivos';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/vehiculos" 
            element={
              <PrivateRoute>
                <Vehiculos />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/tickets" 
            element={
              <PrivateRoute>
                <Tickets />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/tickets/activos" 
            element={
              <PrivateRoute>
                <TicketsActivos />
              </PrivateRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
