import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  CalenderIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navGroups: { name: string; items: NavItem[] }[] = [
  {
    name: "Manager",
    items: [
      { icon: <GridIcon />, name: "Home", path: "/" },
      { icon: <TableIcon />, name: "Booking Details", path: "/booking-overview" },
      { icon: <CalenderIcon />, name: "New Booking", path: "/booking" },
      { icon: <PageIcon />, name: "Logistics", path: "/logistics" },
      { icon: <PageIcon />, name: "Storefront", path: "/store-front" },
      { icon: <PageIcon />, name: "Market Shop", path: "/market-shop" },
      { icon: <CalenderIcon />, name: "Calendar", path: "/calendar" },
      { icon: <PageIcon />, name: "Store Manager", path: "/store-manager" },
    ]
  },
  {
    name: "Agency",
    items: [
      { icon: <UserCircleIcon />, name: "Agency Dashboard", path: "/agency-dashboard" },
      { icon: <CalenderIcon />, name: "New Booking", path: "/booking" },
      { icon: <PieChartIcon />, name: "Reports", path: "/reports" },
    ]
  },
  {
    name: "Kitchen",
    items: [
      { icon: <TableIcon />, name: "Booking Details", path: "/booking-overview" },
      { icon: <PageIcon />, name: "Store Front", path: "/store-front" },
    ]
  },
  {
    name: "Driver",
    items: [
      { icon: <PageIcon />, name: "Driver", path: "/driver" },
      { icon: <PieChartIcon />, name: "Reports", path: "/reports" },
    ]
  }
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  // Unused state removed

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

  const [openGroups, setOpenGroups] = useState<string[]>(["Manager"]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const renderNavGroup = (group: { name: string; items: NavItem[] }) => {
    const isOpen = openGroups.includes(group.name);
    const isSidebarExpanded = isExpanded || isHovered || isMobileOpen;

    return (
      <div key={group.name} className="mb-6">
        <button
          onClick={() => toggleGroup(group.name)}
          className={`w-full mb-4 text-xs uppercase flex items-center leading-[20px] text-gray-400 hover:text-gray-600 transition-colors ${!isSidebarExpanded ? "lg:justify-center" : "justify-between"
            }`}
        >
          {isSidebarExpanded ? (
            <>
              <span>{group.name}</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </>
          ) : (
            <HorizontaLDots className="size-6" />
          )}
        </button>

        {isOpen && (
          <ul className="flex flex-col gap-4">
            {group.items.map((nav, index) => (
              <li key={index}>
                <Link
                  to={nav.path || "/"}
                  className={`menu-item group ${location.pathname === nav.path
                    ? "menu-item-active"
                    : "menu-item-inactive"
                    } ${!isSidebarExpanded ? "lg:justify-center" : "justify-start"}`}
                >
                  <span className={`menu-item-icon-size ${location.pathname === nav.path ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                    {nav.icon}
                  </span>
                  {isSidebarExpanded && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <aside
      ref={sidebar}
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
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

            {navGroups.map(renderNavGroup)}

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
