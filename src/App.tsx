import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import BookingOverview from "./pages/BookingOverview";
import AdminLogistics from "./pages/admin/AdminLogistics";
import AdminStoreFront from "./pages/admin/AdminStoreFront";
import AdminStoreManager from "./pages/admin/AdminStoreManager";
import AdminDriverDashboard from "./pages/admin/AdminDriverDashboard";
import AdminMarketRunner from "./pages/admin/AdminMarketRunner";
import AgencyDashboard from "./pages/AgencyDashboard";
import MarketShop from "./pages/MarketShop";

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

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/market-shop" element={<MarketShop />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />



              {/* Admin Pages (Migrated to AppLayout) */}
              <Route path="/booking-overview" element={<BookingOverview onNavigate={() => { }} />} />
              <Route path="/agency-dashboard" element={<AgencyDashboard />} />
              <Route path="/admin/logistics" element={<AdminLogistics onNavigate={() => { }} />} />
              <Route path="/admin/store" element={<AdminStoreFront onNavigate={() => { }} />} />
              <Route path="/admin/store-manager" element={<AdminStoreManager />} />
              <Route path="/admin/driver" element={<AdminDriverDashboard onNavigate={() => { }} />} />
              <Route path="/admin/market-runner" element={<AdminMarketRunner />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
