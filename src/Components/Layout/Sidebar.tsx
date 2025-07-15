"use client"

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence, MotionGlobalConfig } from "framer-motion";

// Types
interface MenuItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarMenuGroup {
  key: string;
  label: string;
  items: MenuItem[];
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Sidebar Component
export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = React.useState<{[key: string]: boolean}>({});
  // Changed showSettings to isSettingsExpanded for better clarity as it's now an inline expansion
  const [isSettingsExpanded, setIsSettingsExpanded] = React.useState(false);
  const [showScrollToTop, setShowScrollToTop] = React.useState(false);

  // User info state
  const [user, setUser] = React.useState<{ userName: string } | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Settings states
  const [theme, setTheme] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system";
    }
    return "system";
  });

  const [fontSize, setFontSize] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fontSize") || "base";
    }
    return "base";
  });

  const [animationsEnabled, setAnimationsEnabled] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("animationsEnabled") !== "false";
    }
    return true;
  });

  // Scroll to top functionality
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Fetch user info
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("https://10.83.51.52:7070/api/UserInfo/current", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Theme effect
  React.useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (value: string) => {
      if (value === "dark") {
        root.classList.add("dark");
      } else if (value === "light") {
        root.classList.remove("dark");
      } else {
        mediaQuery.matches
          ? root.classList.add("dark")
          : root.classList.remove("dark");
      }
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        e.matches ? root.classList.add("dark") : root.classList.remove("dark");
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  // Font size effect
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');

    if (fontSize === 'small') root.classList.add('text-sm');
    else if (fontSize === 'large') root.classList.add('text-lg');
    else root.classList.add('text-base');
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // Animations effect
  React.useEffect(() => {
    MotionGlobalConfig.skipAnimations = !animationsEnabled;
    localStorage.setItem("animationsEnabled", String(animationsEnabled));
  }, [animationsEnabled]);

  // Menu data with icons
  const menuData: SidebarMenuGroup[] = [
    {
      key: 'applications',
      label: 'Applications',
      icon: DocumentTextIcon,
      items: [
        { label: 'Applications List', href: '/Applications', icon: DocumentTextIcon }
      ]
    },
    {
      key: 'rbac',
      label: 'RBAC',
      icon: ShieldCheckIcon,
      items: [
        { label: "Application's Roles", href: '/AppsRoles' },
        { label: "Application's Functions", href: '/AppsFunctions' },
        { label: "Application's Role Base Accessed Control (RBAC)", href: '/RBAC' }
      ]
    },
    {
      key: 'users',
      label: 'Users Authorized',
      icon: UsersIcon,
      items: [
        { label: "Application's Users", href: '/Users' }
      ]
    },
    {
      key: 'report',
      label: 'Report',
      icon: ChartBarIcon,
      items: [
        { label: 'Authorized User', href: '/Report' }
      ]
    }
  ];

  const toggleMenu = (key: string) => {
    if (isCollapsed) {
      onToggleCollapse();
      setTimeout(() => {
        setExpandedMenus({ [key]: true });
      }, 300);
    } else {
      setExpandedMenus(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const isMenuActive = (items: MenuItem[]) => {
    return items.some(item => pathname === item.href);
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-gradient-to-b from-[#005496] to-[#003d73] shadow-2xl z-40 flex flex-col border-r border-white/10"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {/* Wrapped logo and title in an anchor tag for homepage navigation */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.a
                  href="/"
                  className="flex items-center space-x-3 hover:scale-110"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src="/autoliv_logo.png"
                    alt="Autoliv"
                    className="w-15 h-6 flex-shrink-0"
                  />
                  {/* <div>
                    <h2 className="text-white font-bold text-lg whitespace-nowrap">RBAC System</h2>
                  </div> */}
                </motion.a>
              )}
            </AnimatePresence>

            <button
              onClick={onToggleCollapse}
              className="cursor-pointer text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 px-3"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        {/* <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-2 border-b border-white/10 overflow-hidden"
            >
              <h1 className="text-white/90 font-semibold text-sm uppercase tracking-wider text-center">
                Application Access Control
              </h1>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-1.5 py-2">
            <div className="p-2 bg-white/20 rounded-full flex-shrink-0">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-white font-medium text-sm truncate">
                    {loading ? "Loading..." : user?.userName || "User"}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/70 text-xs">Online</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>


        {/* Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
          <nav className="space-y-2">
            {menuData.map((menu) => {
              const isExpanded = expandedMenus[menu.key];
              const isActive = isMenuActive(menu.items);
              const Icon = menu.icon;

              return (
                <div key={menu.key} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(menu.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group relative cursor-pointer ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? menu.label : undefined}
                  >
                    {/* Icon remains in fixed position */}
                    {Icon && <Icon className="w-5 h-5 flex-shrink-0 absolute left-3 top-1/2 transform -translate-y-1/2" />}
                    
                    {/* Label and space for icon */}
                    <div className="flex items-center w-full">
                      <div className="w-5 h-5 flex-shrink-0 mr-3"></div> {/* Spacer for icon */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="font-medium text-sm whitespace-nowrap"
                          >
                            {menu.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRightIcon
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <AnimatePresence>
                    {isExpanded && !isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-8 space-y-1">
                          {menu.items.map((item, index) => {
                            const isItemActive = pathname === item.href;
                            return (
                              <Link
                                key={index}
                                href={item.href}
                                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                  isItemActive
                                    ? 'bg-[#009EE3] text-white shadow-md'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    isItemActive ? 'bg-white' : 'bg-white/40'
                                  }`} />
                                  <span>{item.label}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Settings Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              setIsSettingsExpanded(prev => !prev);
              if (isCollapsed) {
                onToggleCollapse(); 
              }
            }}
            className={`cursor-pointer w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            {/* Icon and label for Settings */}
            <div className="flex items-center">
              <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 font-medium text-sm whitespace-nowrap text-left"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            
            {/* Chevron Icon for expansion/collapse, always present for consistent positioning */}
            <AnimatePresence mode="wait" initial={false}>
              {/* Render only when not collapsed, otherwise the main button's justify-center handles alignment */}
              {!isCollapsed && (
                <motion.div
                  key={isSettingsExpanded ? "chevron-down" : "chevron-right"} 
                  initial={{ opacity: 0, rotate: isSettingsExpanded ? -90 : 90 }} 
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: isSettingsExpanded ? 90 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSettingsExpanded ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Settings Options (Collapsible Section) */}
          <AnimatePresence>
            {isSettingsExpanded && !isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }} 
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden mt-2 p-2 bg-white/10 rounded-lg space-y-4 text-white"
              >
                {/* Theme Selection */}
                <div>
                  <h4 className="text-xs font-semibold text-white/70 mb-2">Theme</h4>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { value: "light", label: "Light", icon: SunIcon },
                      { value: "dark", label: "Dark", icon: MoonIcon },
                      { value: "system", label: "System", icon: ComputerDesktopIcon }
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`flex flex-col items-center p-2 rounded-md text-xs transition-all duration-200 cursor-pointer ${
                          theme === t.value
                            ? "bg-[#009EE3] text-white"
                            : "text-white/70 hover:text-white hover:bg-white/20"
                        }`}
                      >
                        <t.icon className="w-4 h-4 mb-0.5" />
                        <span className="font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <h4 className="text-xs font-semibold text-white/70 mb-2">Font Size</h4>
                  <select
                    className="cursor-pointer w-full px-2 py-1.5 bg-white/15 border border-white/20 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#009EE3] focus:border-transparent text-white"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="base">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Animations Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white/70">Animations</h4>
                    <p className="text-[10px] text-white/50 mt-0.5">Enable smooth animations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={animationsEnabled}
                      onChange={(e) => setAnimationsEnabled(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-white/30 rounded-full peer peer-checked:bg-[#009EE3] relative transition-colors duration-200">
                      <motion.div
                        className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-lg"
                        initial={false}
                        animate={{ x: animationsEnabled ? 16 : 0 }}
                        transition={{ type: "spring", stiffness: 700, damping: 30 }}
                      />
                    </div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-[#009EE3] to-[#005496] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
            aria-label="Scroll to top"
          >
            <ChevronUpIcon className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook for managing sidebar state
export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggle = () => setIsCollapsed(!isCollapsed);
  const collapse = () => setIsCollapsed(true);
  const expand = () => setIsCollapsed(false);

  return { isCollapsed, toggle, collapse, expand };
};