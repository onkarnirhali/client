import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AdminRoute } from './auth/AdminRoute';
import { AppLayout } from './components/layout/AppLayout';

const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const TodosPage = lazy(() => import('./pages/TodosPage').then((m) => ({ default: m.TodosPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export default function App() {
  // Top-level route map: login, protected app layout (todos + AI widget), fallback 404
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TodosPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AppLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
