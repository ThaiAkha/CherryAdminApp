import { Link, useLocation } from "react-router";
import {
  Home,
  CalendarPlus,
  Hotel,
  Truck,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  CalendarDays,
  Package,
  BarChart3,
  Eye,
  Database,
  FolderOpen,
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  DollarSign,
  FileText,
  Download,
  Newspaper,
  Route,
  Car,
  Palette,
  type LucideIcon,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import Tooltip from "../components/ui/Tooltip";

type NavItem = {
  name: string;
  icon: LucideIcon;
  path: string;
  allowedRoles?: string[];
};

const coreNavItems: NavItem[] = [
  { icon: Home, name: "Home", path: "/", allowedRoles: ["admin", "manager", "kitchen", "agency", "driver", "logistics"] },
  { icon: Hotel, name: "Admin Hotels", path: "/admin-hotels", allowedRoles: ["admin"] },
  { icon: CalendarDays, name: "Admin Calendar", path: "/admin-calendar", allowedRoles: ["admin"] },
  { icon: Package, name: "Admin Inventory", path: "/admin-inventory", allowedRoles: ["admin"] },
  { icon: Database, name: "Admin Database", path: "/admin-database", allowedRoles: ["admin"] },
  { icon: FolderOpen, name: "Admin Storage", path: "/admin-storage", allowedRoles: ["admin"] },
  { icon: BarChart3, name: "Admin Reports", path: "/admin-reports", allowedRoles: ["admin"] },
  { icon: CalendarPlus, name: "Manager Booking", path: "/manager-booking", allowedRoles: ["manager"] },
  { icon: Truck, name: "Manager Logistic", path: "/logistics", allowedRoles: ["manager", "logistics"] },
  { icon: ShoppingCart, name: "Manager POS", path: "/manager-pos", allowedRoles: ["manager"] },
  { icon: ShoppingBag, name: "Market Planner", path: "/market-shop", allowedRoles: ["manager"] },
  { icon: ClipboardList, name: "Market Shopping", path: "/market-run", allowedRoles: ["manager"] },
  { icon: Eye, name: "Manager Kitchen", path: "/manager-kitchen", allowedRoles: ["manager"] },
];

const agencyNavItems: NavItem[] = [
  { icon: LayoutDashboard, name: "Agency Dashboard", path: "/agency-dashboard", allowedRoles: ["agency"] },
  { icon: BookOpen, name: "Agency Reservations", path: "/agency-reservations", allowedRoles: ["agency"] },
  { icon: PlusCircle, name: "Agency New Booking", path: "/agency-booking", allowedRoles: ["agency"] },
  { icon: BarChart3, name: "Agency Reports", path: "/agency-reports", allowedRoles: ["agency"] },
  { icon: DollarSign, name: "Agency Net Rates", path: "/agency-rates", allowedRoles: ["agency"] },
  { icon: FileText, name: "Agency Policies", path: "/agency-terms", allowedRoles: ["agency"] },
  { icon: Download, name: "Agency Downloads", path: "/agency-assets", allowedRoles: ["agency"] },
  { icon: Newspaper, name: "Agency News", path: "/agency-news", allowedRoles: ["agency"] },
];

const driverNavItems: NavItem[] = [
  { icon: Route, name: "Driver Route", path: "/driver", allowedRoles: ["driver"] },
  { icon: Car, name: "Driver Home", path: "/driver-home", allowedRoles: ["driver"] },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const isSidebarOpen = isExpanded || isMobileOpen;
  const isActive = (path: string) => location.pathname === path;

  const filterByRole = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      if (user?.role) {
        return item.allowedRoles.some(r => r.toLowerCase() === user.role.toLowerCase());
      }
      return false;
    });
  };

  const renderNavItem = (nav: NavItem) => {
    const IconComponent = nav.icon;
    const active = isActive(nav.path);

    const navLink = (
      <Link
        to={nav.path}
        onClick={() => isMobileOpen && toggleMobileSidebar()}
        className="relative flex items-center w-full h-14 group"
      >
        {/* FLOATING HOVER BACKGROUND */}
        <div className={`
          absolute inset-y-1 inset-x-2 rounded-xl transition-colors duration-200
          ${active
            ? 'bg-brand-50 dark:bg-brand-500/[0.12]'
            : 'group-hover:bg-gray-100 dark:group-hover:bg-white/5'
          }
        `} />

        {/* ACTIVE INDICATOR */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-500 rounded-r-full z-10" />
        )}

        {/* ICON SLOT */}
        <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
          <IconComponent
            className={`w-6 h-6 transition-transform duration-300 group-active:scale-95 ${active
              ? 'text-brand-500 dark:text-brand-400'
              : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
              }`}
          />
        </div>

        {/* LABEL SLOT */}
        <div className={`
          flex items-center flex-1 overflow-hidden whitespace-nowrap z-10
          transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left
          ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}
        `}>
          <span className={`font-bold tracking-wide ${active
            ? 'text-brand-500 dark:text-brand-400'
            : 'text-gray-700 dark:text-gray-300'
            }`}>
            {nav.name}
          </span>
        </div>
      </Link>
    );

    return (
      <li key={nav.path}>
        {!isSidebarOpen ? (
          <Tooltip content={nav.name} position="right" className="w-full">
            {navLink}
          </Tooltip>
        ) : (
          navLink
        )}
      </li>
    );
  };



  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen z-[99] border-r border-gray-200
        transition-all ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isSidebarOpen ? "w-80" : "w-[108px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 overflow-visible`}
      style={{ transitionDuration: '500ms' }}
    >
      {/* HEADER: LOGO + TOGGLE */}
      <div className="flex items-center h-16 lg:h-auto lg:py-8">
        {/* Logo icon — always centered in icon column */}
        <div className="w-[108px] shrink-0 flex items-center justify-center">
          <Link to="/">
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          </Link>
        </div>

        {/* Logo text + toggle — visible when expanded */}
        <div className={`
          flex items-center justify-between flex-1 pr-4 overflow-hidden
          transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <Link to="/">
            <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={110} height={30} />
            <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={110} height={30} />
          </Link>
        </div>
      </div>



      {/* NAV */}
      <div className={`flex flex-col flex-1 no-scrollbar ${isSidebarOpen ? 'overflow-y-auto overflow-x-hidden' : 'overflow-visible'}`} style={{ overflow: isSidebarOpen ? undefined : 'visible' }}>
        <nav className="mb-6" style={{ overflow: 'visible' }}>
          <div className="flex flex-col gap-4" style={{ overflow: 'visible' }}>
            {/* All Menu Items — flat list */}
            <div style={{ overflow: 'visible' }}>
              <ul className="flex flex-col gap-1" style={{ overflow: 'visible' }}>
                {filterByRole(coreNavItems).map(renderNavItem)}
                {filterByRole(agencyNavItems).map(renderNavItem)}
                {filterByRole(driverNavItems).map(renderNavItem)}
                {user?.role === 'admin' && renderNavItem({ icon: Palette, name: "UI Showcase", path: "/admin/showcase", allowedRoles: ["admin"] })}
              </ul>
            </div>
          </div>
        </nav>
      </div>

    </aside>
  );
};

export default AppSidebar;
