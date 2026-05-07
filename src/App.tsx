import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useStore } from './store';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import CampSelectionPage from './pages/CampSelectionPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import ComponentEntryPage from './pages/ComponentEntryPage';
import BookingReviewPage from './pages/BookingReviewPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import FailureQueuePage from './pages/FailureQueuePage';

function ProtectedRoute() {
  const agent = useStore(state => state.agent);
  if (!agent) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function CampRoute() {
  const selectedCamp = useStore(state => state.selectedCamp);
  if (!selectedCamp) return <Navigate to="/select-camp" replace />;
  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/select-camp" element={<CampSelectionPage />} />

          <Route element={<CampRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/component-entry/:userId" element={<ComponentEntryPage />} />
            <Route path="/booking-review/:userId" element={<BookingReviewPage />} />
            <Route path="/appointment/:id" element={<AppointmentDetailPage />} />
            <Route path="/failures" element={<FailureQueuePage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
