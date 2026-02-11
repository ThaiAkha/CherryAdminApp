import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentBookings from "../../components/booking/RecentBookings";
import AgencyRecentBookings from "../../components/booking/AgencyRecentBookings";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import PageContainer from "../../components/layout/PageContainer";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection logic removed to restore home page visibility
  }, [user, navigate]);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageContainer>
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <EcommerceMetrics />

            <MonthlySalesChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget />
          </div>

          {/* Row 2: Booking Tables */}
          <div className="col-span-12 xl:col-span-6">
            <AgencyRecentBookings />
          </div>

          <div className="col-span-12 xl:col-span-6">
            <RecentBookings />
          </div>

          {/* Row 3: Demographic */}
          <div className="col-span-12 xl:col-span-12">
            <DemographicCard />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
