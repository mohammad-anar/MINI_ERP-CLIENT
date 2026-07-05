import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/Products';
import { CreateSale } from '../pages/CreateSale';
import { SalesHistory } from '../pages/SalesHistory';
import { Notifications } from '../pages/Notifications';
import { CreateStaff } from '../pages/CreateStaff';
import { ProtectedRoute } from '../components/guard/ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';

const wrapInLayout = (component: React.ReactNode, allowedRoles?: ('SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE')[]) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardLayout>{component}</DashboardLayout>
    </ProtectedRoute>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: wrapInLayout(<Dashboard />),
  },
  {
    path: '/products',
    element: wrapInLayout(<Products />),
  },
  {
    path: '/create-sale',
    element: wrapInLayout(<CreateSale />),
  },
  {
    path: '/sales-history',
    element: wrapInLayout(<SalesHistory />),
  },
  {
    path: '/notifications',
    element: wrapInLayout(<Notifications />),
  },
  {
    path: '/create-staff',
    element: wrapInLayout(<CreateStaff />, ['SUPER_ADMIN', 'ADMIN']),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
