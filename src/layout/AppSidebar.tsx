import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import {
  CalenderIcon,
  GridIcon,
  PageIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  allowedRoles?: string[];
};

const mainNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Agency Portal", path: "/", allowedRoles: ["admin", "manager", "agency"] },
  { icon: <PieChartIcon />, name: "Agency Dashboard", path: "/agency-dashboard", allowedRoles: ["admin", "manager", "agency"] },
  { icon: <UserCircleIcon />, name: "Reservations", path: "/agency-reservations", allowedRoles: ["admin", "manager", "agency"] },
  { icon: <UserCircleIcon />, name: "New Booking", path: "/agency-booking", allowedRoles: ["admin", "manager", "agency"] },
  { icon: <UserCircleIcon />, name: "Reports", path: "/agency-reports", allowedRoles: ["admin", "manager", "agency"] },
  { icon: <TableIcon />, name: "Booking Details", path: "/booking-overview", allowedRoles: ["admin", "manager", "kitchen"] },
  { icon: <CalenderIcon />, name: "New Fast Booking", path: "/admin-booking-new", allowedRoles: ["admin", "manager"] },
  { icon: <CalenderIcon />, name: "New Booking (Site)", path: "/booking", allowedRoles: ["admin", "manager"] },
  { icon: <PageIcon />, name: "Logistics", path: "/logistics", allowedRoles: ["admin", "manager"] },
  { icon: <PageIcon />, name: "Storefront", path: "/store-front", allowedRoles: ["admin", "manager", "kitchen"] },
  { icon: <PageIcon />, name: "Market Shop", path: "/market-shop", allowedRoles: ["admin", "manager"] },
  { icon: <UserCircleIcon />, name: "Market Runner", path: "/market-runner", allowedRoles: ["admin", "manager"] },
  { icon: <CalenderIcon />, name: "Calendar", path: "/calendar", allowedRoles: ["admin", "manager"] },
  { icon: <PageIcon />, name: "Store Manager", path: "/store-manager", allowedRoles: ["admin", "manager"] },
];

const settingsNavItems: NavItem[] = [
  { icon: <PageIcon />, name: "Net Rates", path: "/agency-rates", allowedRoles: ["admin", "manager", "agency"] },
  { icon: <PageIcon />, name: "Policies", path: "/agency-terms", allowedRoles: ["admin", "manager", "agency"] },
  { icon: <PageIcon />, name: "Downloads", path: "/agency-assets", allowedRoles: ["admin", "manager", "agency"] },
  { icon: <PageIcon />, name: "News & Updates", path: "/agency-news", allowedRoles: ["admin", "manager", "agency"] },
];

const driverNavItems: NavItem[] = [
  { icon: <PageIcon />, name: "Driver", path: "/driver", allowedRoles: ["admin", "manager", "driver"] },
  { icon: <PieChartIcon />, name: "Driver Reports", path: "/reports", allowedRoles: ["admin", "manager", "driver"] },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebar.current.contains(target as Node) &&
        !trigger.current.contains(target as Node)
      ) {
        setIsHovered(false);
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [isExpanded, setIsHovered]);

  const renderNavItem = (nav: NavItem, index: number) => {
    const isSidebarExpanded = isExpanded || isHovered || isMobileOpen;

    return (
      <li key={index}>
        <Link
          to={nav.path}
          onClick={() => isMobileOpen && toggleMobileSidebar()}
          className={`menu-item group ${isActive(nav.path)
            ? "menu-item-active"
            : "menu-item-inactive"
            } ${!isSidebarExpanded ? "lg:justify-center" : "justify-start"}`}
        >
          <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
            {nav.icon}
          </span>
          {isSidebarExpanded && (
            <span className="menu-item-text">{nav.name}</span>
          )}
        </Link>
      </li>
    );
  };

  const filterByRole = (items: NavItem[]) => {
    return items.filter(item => !item.allowedRoles || (user?.role && item.allowedRoles.includes(user.role)));
  };

  return (
    <aside
      ref={sidebar}
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-[99] border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center gap-2 py-6 lg:py-8">
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* Main Menu Section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              <ul className="flex flex-col gap-4">
                {filterByRole(mainNavItems).map(renderNavItem)}
              </ul>
            </div>

            {/* Settings Section */}
            {filterByRole(settingsNavItems).length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Settings"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                <ul className="flex flex-col gap-4">
                  {filterByRole(settingsNavItems).map(renderNavItem)}
                </ul>
              </div>
            )}

            {/* Driver Section */}
            {filterByRole(driverNavItems).length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Driver"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                <ul className="flex flex-col gap-4">
                  {filterByRole(driverNavItems).map(renderNavItem)}
                </ul>
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? (
          <SidebarWidget />
        ) : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
