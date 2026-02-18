import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import NotFound from "./pages/common/NotFound";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { ScrollToTop } from "./components/common/ScrollToTop";
import DriverRoute from "./pages/driver/DriverRoute";

// Manager Pages
import ManagerKitchen from "./pages/manager/ManagerKitchen";
import AdminCalendar from "./pages/admin/AdminCalendar";
import ManagerLogistic from "./pages/manager/ManagerLogistic";
import AdminInventory from "./pages/admin/AdminInventory";
import ManagerPos from "./pages/manager/ManagerPos";
import ManagerHome from "./pages/manager/ManagerHome";
import MarketShop from "./pages/market/MarketShop";
import MarketRunner from "./pages/market/MarketRunner";
import AgencyReservations from "./pages/agency/AgencyReservations";
import DriverHome from "./pages/driver/DriverHome";
import ManagerBooking from "./pages/manager/ManagerBooking";
import AgencyBooking from "./pages/agency/AgencyBooking";
import AgencyReports from "./pages/agency/AgencyReports";
import AgencyNews from "./pages/agency/AgencyNews";
import AgencyRates from "./pages/agency/AgencyRates";
import AgencyTerms from "./pages/agency/AgencyTerms";
import AgencyAssets from "./pages/agency/AgencyAssets";
import AdminReport from "./pages/admin/AdminReport";
import AdminDatabase from "./pages/admin/AdminDatabase";
import AdminStorage from "./pages/admin/AdminStorage";
import AdminHotels from "./pages/admin/AdminHotels";
import AdminHome from "./pages/admin/AdminHome";
import AgencyDashboard from "./pages/agency/AgencyDashboard";
import AgencyPortal from "./pages/agency/AgencyPortal";
import KitchenHome from "./pages/kitchen/KitchenHome";
import LogisticHome from "./pages/logistics/LogisticHome";
import Home from "./pages/common/Home";
import ComponentShowcase from "./pages/admin/ComponentShowcase";

function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            {/* Admin & Manager Pages */}
            <Route path="/manager-kitchen" element={<ProtectedRoute allowedRoles={['manager']}><ManagerKitchen onNavigate={() => { }} /></ProtectedRoute>} />
            <Route path="/driver-home" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency', 'driver']}><DriverHome /></ProtectedRoute>} />
            <Route path="/admin-reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReport /></ProtectedRoute>} />
            <Route path="/admin-hotels" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminHotels /></ProtectedRoute>} />
            <Route path="/admin-database" element={<ProtectedRoute allowedRoles={['admin']}><AdminDatabase /></ProtectedRoute>} />
            <Route path="/admin-storage" element={<ProtectedRoute allowedRoles={['admin']}><AdminStorage /></ProtectedRoute>} />
            <Route path="/admin/showcase" element={<ProtectedRoute allowedRoles={['admin']}><ComponentShowcase /></ProtectedRoute>} />

            <Route path="/agency-reservations" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyReservations /></ProtectedRoute>} />
            <Route path="/agency-booking" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyBooking /></ProtectedRoute>} />
            <Route path="/agency-reports" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyReports /></ProtectedRoute>} />
            <Route path="/agency-news" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyNews /></ProtectedRoute>} />
            <Route path="/agency-rates" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyRates /></ProtectedRoute>} />
            <Route path="/agency-terms" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyTerms /></ProtectedRoute>} />
            <Route path="/agency-assets" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyAssets /></ProtectedRoute>} />
            <Route path="/agency-dashboard" element={<ProtectedRoute allowedRoles={['agency']}><AgencyDashboard /></ProtectedRoute>} />
            <Route path="/agency-portal" element={<ProtectedRoute allowedRoles={['agency']}><AgencyPortal /></ProtectedRoute>} />
            <Route path="/manager-booking" element={<ProtectedRoute allowedRoles={['manager']}><ManagerBooking /></ProtectedRoute>} />
            <Route path="/manager-home" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerHome /></ProtectedRoute>} />
            <Route path="/logistics" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerLogistic onNavigate={() => { }} /></ProtectedRoute>} />
            <Route path="/driver" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'driver']}><DriverRoute onNavigate={() => { }} /></ProtectedRoute>} />
            <Route path="/market-shop" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><MarketShop /></ProtectedRoute>} />
            <Route path="/market-run" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><MarketRunner /></ProtectedRoute>} />
            <Route path="/manager-pos" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerPos /></ProtectedRoute>} />

            <Route path="/admin-calendar" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminCalendar /></ProtectedRoute>} />
            <Route path="/admin-inventory" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminInventory /></ProtectedRoute>} />
            <Route path="/admin-home" element={<ProtectedRoute allowedRoles={['admin']}><AdminHome /></ProtectedRoute>} />

            {/* Kitchen & Logistics Home */}
            <Route path="/kitchen-home" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}><KitchenHome /></ProtectedRoute>} />
            <Route path="/logistic-home" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'logistics']}><LogisticHome /></ProtectedRoute>} />

            {/* Home Route — redirects each role to their own home */}
            <Route path="/" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen', 'agency', 'driver', 'logistics']}><Home /></ProtectedRoute>} />
          </Route >


          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes >
      </Router >
    </>
  );
}

export default App;
