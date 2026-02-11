import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import BookingPage from "./pages/BookingPage";
import BookingOverview from "./pages/BookingOverview";
import Logistics from "./pages/Logistics";
import DriverDashboard from "./pages/DriverDashboard";
import MarketRunner from "./pages/MarketRunner";
import StoreFront from "./pages/StoreFront";
import StoreManager from "./pages/StoreManager";
import AgencyDashboard from "./pages/AgencyDashboard";
import MarketShop from "./pages/MarketShop";
import Reports from "./pages/Reports";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout - PROTECTED */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/booking" element={<BookingPage />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/market-shop" element={<MarketShop />} />




              {/* Admin Pages (Migrated to AppLayout) */}
              <Route path="/booking-overview" element={<BookingOverview onNavigate={() => { }} />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/agency-dashboard" element={<AgencyDashboard />} />
              <Route path="/logistics" element={<Logistics onNavigate={() => { }} />} />
              <Route path="/driver" element={<DriverDashboard onNavigate={() => { }} />} />
              <Route path="/market-runner" element={<MarketRunner />} />
              <Route path="/store-front" element={<StoreFront onNavigate={() => { }} />} />
              <Route path="/store-manager" element={<StoreManager />} />
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
