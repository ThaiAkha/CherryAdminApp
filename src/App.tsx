import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { ScrollToTop } from "./components/common/ScrollToTop";
import AgencyDashboard from "./pages/AgencyDashboard";
import BookingPage from "./pages/BookingPage";
import BookingOverview from "./pages/BookingOverview";
import Logistics from "./pages/Logistics";
import DriverDashboard from "./pages/DriverDashboard";
import MarketRunner from "./pages/MarketRunner";
import StoreFront from "./pages/StoreFront";
import StoreManager from "./pages/StoreManager";
import AgencyReservations from "./pages/AgencyReservations";
import AgencyPortal from "./pages/AgencyPortal";
import MarketShop from "./pages/MarketShop";
import Reports from "./pages/Reports";
import AdminBookingCreate from "./pages/admin/AdminBookingCreate";
import AgencyBooking from "./pages/AgencyBooking";
import AgencyReports from "./pages/AgencyReports";
import AgencyNews from "./pages/AgencyNews";
import AgencyRates from "./pages/AgencyRates";
import AgencyTerms from "./pages/AgencyTerms";
import AgencyAssets from "./pages/AgencyAssets";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout - PROTECTED */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<AgencyPortal />} />
              <Route path="/agency-dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyDashboard /></ProtectedRoute>} />
              <Route path="/booking" element={<BookingPage />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/market-shop" element={<MarketShop />} />




              {/* Admin Pages (Migrated to AppLayout) */}
              <Route path="/booking-overview" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}><BookingOverview onNavigate={() => { }} /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency', 'driver']}><Reports /></ProtectedRoute>} />

              <Route path="/agency-reservations" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyReservations /></ProtectedRoute>} />
              <Route path="/agency-booking" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyBooking /></ProtectedRoute>} />
              <Route path="/agency-reports" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyReports /></ProtectedRoute>} />
              <Route path="/agency-news" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyNews /></ProtectedRoute>} />
              <Route path="/agency-rates" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyRates /></ProtectedRoute>} />
              <Route path="/agency-terms" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyTerms /></ProtectedRoute>} />
              <Route path="/agency-assets" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyAssets /></ProtectedRoute>} />
              <Route path="/admin-booking-new" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminBookingCreate /></ProtectedRoute>} />
              <Route path="/logistics" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Logistics onNavigate={() => { }} /></ProtectedRoute>} />
              <Route path="/driver" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'driver']}><DriverDashboard onNavigate={() => { }} /></ProtectedRoute>} />
              <Route path="/market-runner" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><MarketRunner /></ProtectedRoute>} />
              <Route path="/store-front" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}><StoreFront onNavigate={() => { }} /></ProtectedRoute>} />
              <Route path="/store-manager" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><StoreManager /></ProtectedRoute>} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router >
    </>
  );
}
