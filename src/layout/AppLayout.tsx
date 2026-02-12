import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { PageHeaderProvider } from "../context/PageHeaderContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered } = useSidebar();

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          }`}
      >
        <AppHeader />
        <div className="p-4 md:p-6 2xl:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <PageHeaderProvider>
        <LayoutContent />
      </PageHeaderProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
