"use client"

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { Bars3Icon, ChevronDownIcon, UserIcon, ChevronUpIcon, Cog6ToothIcon, XMarkIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence, MotionGlobalConfig } from "framer-motion";
import Image from "next/image";

// Types
interface MenuItem {
  label: string;
  href: string;
}

interface DropdownMenuProps {
  label: string;
  items: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isActive: boolean;
}

// Components
const Logo = () => (
  <Link href="/" className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-200">
    <Image 
      src="/autoliv_logo.png" 
      alt="Autoliv" 
      className="w-32 sm:w-40 lg:w-44 h-auto pt-4 sm:pt-5 pl-4 sm:pl-5"
    />
  </Link>
);

const Title = () => (
  <div className="hidden md:flex flex-1 justify-end px-4">
    <h1 className="text-white font-bold font-inter text-lg lg:text-xl xl:text-2xl pt-5 tracking-wide uppercase text-right">
      APPLICATION ACCESS CONTROL (RBAC)
    </h1>
  </div>
);

const MobileTitle = () => (
  <div className="md:hidden px-4 pb-4">
    <h1 className="text-white font-bold font-inter text-sm tracking-wider uppercase text-center leading-tight">
      APPLICATION ACCESS CONTROL (RBAC)
    </h1>
  </div>
);

// const UserInfo = () => (
//   <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-lg border border-white/20 hover:bg-white transition-all duration-300 group">
//     <div className="p-1.5 bg-gradient-to-br from-[#005496] to-[#003d73] rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-300">
//       <UserIcon className="w-4 h-4 text-white" />
//     </div>
//     <div className="flex flex-col">
//       <span className="text-sm font-semibold text-[#005496] leading-tight">User</span>
//       <span className="text-xs text-gray-500 leading-tight">phakin.thongla-ar</span>
//     </div>
//     <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm animate-pulse"></div>
//   </div>
// );

const UserInfo = () => {
  const [user, setUser] = React.useState<{ userName: string } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("https://localhost:7070/api/UserInfo/current", {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json();
          console.log("UserInfo API result:", data)
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-lg border border-white/20 hover:bg-white transition-all duration-300 group">
      <div className="p-1.5 bg-gradient-to-br from-[#005496] to-[#003d73] rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-300">
        <UserIcon className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[#005496] leading-tight">
          {loading ? "Loading..." : user?.userName || "User"}
        </span>
      </div>
      <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm animate-pulse"></div>
    </div>
  )
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  label, 
  items, 
  // isOpen, 
  isActive 
}) => {
  const pathname = usePathname();

  // const [isHovering, setHovering] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Find active item to show its label
  // const activeItem = items.find(item => pathname === item.href);
  // const displayLabel = activeItem ? activeItem.label : label;

  const handleMouseEnter = () => {
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    setIsOpen(false)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }
  
  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 border relative ${
          isActive
            ? 'bg-gradient-to-r from-[#009EE3] to-[#005496] text-white border-[#009EE3] shadow-lg scale-105'
            : isOpen 
              ? 'bg-[#005496] text-white border-[#005496] shadow-lg scale-105' 
              : 'text-[#005496] bg-white/80 border-white/40 hover:bg-gradient-to-r hover:from-[#009EE3] hover:to-[#005496] hover:text-white hover:border-[#009EE3] hover:shadow-md hover:scale-105'
        } backdrop-blur-sm`}
      >
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-all duration-300 ${
            isOpen ? 'rotate-180 scale-110' : 'rotate-0'
          }`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-20 min-w-max overflow-hidden animate-in slide-in-from-top-2 duration-200"
            >
              <div className="p-1">
                {items.map((item, index) => {
                  const isItemActive = pathname === item.href;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`block px-4 py-3 text-sm rounded-lg transition-all duration-200 font-medium hover:shadow-md hover:scale-[1.02] transform ${
                        isItemActive
                          ? 'bg-gradient-to-r from-[#009EE3] to-[#005496] text-white shadow-md scale-[1.02]'
                          : 'text-[#005496] hover:bg-gradient-to-r hover:from-[#009EE3] hover:to-[#005496] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          isItemActive 
                            ? 'bg-white shadow-sm animate-pulse' 
                            : 'bg-[#005496] opacity-60'
                        }`}></div>
                        <span>{item.label}</span>
                        {isItemActive && (
                          <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Scroll to top components
const ScrollToTop = ({ isVisible }: { isVisible: boolean }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="cursor-pointer fixed bottom-15 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-[#009EE3] to-[#005496] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
      aria-label="Move To Top"
    >
      <ChevronUpIcon className="w-6 h-6" />
    </button>
  )
}

// QuickMenu Component
const QuickMenu = ({
  menuData,
  pathname,
}: {
  menuData: { key: string; label: string; items: MenuItem[] }[];
  pathname: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer fixed bottom-15 right-6 z-20 bg-gradient-to-r from-[#009EE3] to-[#005496] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
        aria-label="Quick Menu"
      >
        {isOpen || isHovered ? (
          <ChevronUpIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>
      
      <QuickMenuDropdown 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        menuData={menuData}
        pathname={pathname}
      />
    </>
  );
};

// Quick Menu Dropdown components
const QuickMenuDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  menuData: { key: string; label: string; items: MenuItem[] }[];
  pathname: string;
}> = ({ isOpen, onClose, menuData, pathname }) => {

  const [showSettings, setShowSettings] = React.useState(false)

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const [theme, setTheme] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system"
    }
    return "system"
  })

  React.useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (value: string) => {
      if (value === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        if (e.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  const [fontSize, setFontSize] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fontSize") || "base";
    }
    return "base";
  });

  React.useEffect(() => {
    const root = document.documentElement;
    // Clean up previous classes
    root.classList.remove('text-sm', 'text-base', 'text-lg');

    if (fontSize === 'small') root.classList.add('text-sm');
    else if (fontSize === 'large') root.classList.add('text-lg');
    else root.classList.add('text-base'); // Default
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const [animationsEnabled, setAnimationsEnabled] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      // Default to true if not set
      return localStorage.getItem("animationsEnabled") !== "false";
    }
    return true;
  });

  React.useEffect(() => {
    MotionGlobalConfig.skipAnimations = !animationsEnabled
    localStorage.setItem("animationsEnabled", String(animationsEnabled))
  }, [animationsEnabled])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-30">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/10" onClick={onClose} />

          {/* Quick Menu (แสดงเมื่อ showSettings เป็น false) */}
          <AnimatePresence>
            {!showSettings && ( // เพิ่มเงื่อนไขนี้เพื่อซ่อน Quick Menu เมื่อ Settings เปิด
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed bottom-30 right-6 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-40"
              >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#005496]">Quick Menu</h3>
                  <button
                    onClick={handleSettingsClick}
                    className="text-gray-500 hover:text-[#005496] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Settings"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                  {menuData.map((menu) => (
                    <div key={menu.key} className="mb-3">
                      <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {menu.label}
                      </div>
                      <div className="space-y-1">
                        {menu.items.map((item, index) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={index}
                              href={item.href}
                              onClick={onClose}
                              className={`block px-4 py-3 rounded-lg transition-all text-sm ${
                                isActive
                                  ? "bg-gradient-to-r from-[#009EE3] to-[#005496] text-white shadow-md"
                                  : "text-gray-700 hover:bg-[#009EE3]/10 hover:text-[#005496]"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    isActive ? "bg-white" : "bg-[#009EE3]"
                                  }`}
                                ></div>
                                <span>{item.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Overlay (เปิดในตำแหน่งเดียวกัน) */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                // ใช้คลาสเดียวกับ Quick Menu เพื่อให้มีขนาดและตำแหน่งเดียวกัน
                className="fixed bottom-30 right-6 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-40 flex flex-col"
              >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#005496]">Settings</h3>
                  <button
                    onClick={handleCloseSettings}
                    className="text-gray-500 hover:text-[#005496] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close Settings"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <h4 className="text-sm font-medium text-[#005496] mb-2">Theme</h4>
                    <div className="flex items-center space-x-3">
                      {["light", "dark", "system"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`px-4 py-2 rounded-lg border text-sm transition-colors duration-200 ${
                            theme === t
                              ? "bg-[#005496] text-white border-[#005496]"
                              : "border-gray-300 hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {t === "light" && <SunIcon className="w-5 h-5" />}
                          {t === "dark" && <MoonIcon className="w-5 h-5" />}
                          {t === "system" && <ComputerDesktopIcon className="w-5 h-5" />}
                          <span>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <h4 className="text-sm font-medium text-[#005496] mb-2">Font Size</h4>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="base">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  {/* Toggle Animations */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#005496]">Enable Animations</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={animationsEnabled}
                        onChange={(e) => setAnimationsEnabled(e.target.checked)}
                      />
                      {/* เพิ่ม Framer Motion ให้กับตัววงกลมของ Toggle Switch */}
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#009EE3] relative transition-colors duration-200">
                        <motion.div 
                          className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow"
                          initial={false}
                          animate={{ x: animationsEnabled ? 20 : 0 }}
                          transition={{ type: "spring", stiffness: 700, damping: 30 }}
                        />
                      </div>
                    </label>
                  </div>

                  {/* Save Button */}
                  {/* <div className="pt-4">
                    <button className="w-full px-4 py-2 bg-[#005496] text-white rounded-lg hover:bg-[#003e74] transition-colors duration-200 text-sm font-medium">
                      Save Settings
                    </button>
                  </div> */}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

// Main Navbar Component
export default function Navbar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<{
    [key: string]: boolean;
  }>({
    applications: false,
    rbac: false,
    users: false,
    report: false
  });

  const [showScrollToTop, setShowScrollToTop] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollToTop(scrollTop  > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMenuToggle = (key: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMenuClose = (key: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: false
    }));
  };

  // Menu data
  const menuData = [
    {
      key: 'applications',
      label: 'Applications',
      items: [
        { label: 'Applications List', href: '/Applications' }
      ]
    },
    {
      key: 'rbac',
      label: 'RBAC',
      items: [
        { label: "Application's Roles", href: '/AppsRoles' },
        { label: "Application's Functions", href: '/AppsFunctions' },
        { label: "Application's Role Base Accessed Control (RBAC)", href: '/RBAC' }
      ]
    },
    {
      key: 'users',
      label: 'Users Authorized',
      items: [
        { label: "Application's Users", href: '/Users' }
      ]
    },
    {
      key: 'report',
      label: 'Report',
      items: [
        { label: 'Authorized User', href: '/Report' }
      ]
    }
  ];

  // Check if any menu item is active
  const isMenuActive = (menuItems: MenuItem[]) => {
    return menuItems.some(item => pathname === item.href);
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="bg-[#005496] relative">
        <div className="flex justify-between items-center min-h-[80px] sm:min-h-[100px] px-2 sm:px-4">
          <Logo />
          <Title />
        </div>
        <MobileTitle />
        
        {/* Active page indicator line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#009EE3] via-[#009EE3] to-[#005496] opacity-80"></div>
      </header>
      
      {/* Bottom Navbar - Desktop Only */}
      <nav className="hidden md:block bg-gradient-to-r from-[#C1CBD3] to-[#B5C3CC] px-2 lg:px-4 shadow-inner relative">
        <div className="flex justify-between items-center min-h-[60px] py-3">
          {/* Menu Items */}
          <div className="order-1 lg:order-1 flex flex-wrap justify-center space-x-2 lg:space-x-3">
            {menuData.map((menu) => (
              <DropdownMenu
                key={menu.key}
                label={menu.label}
                items={menu.items}
                isOpen={openMenus[menu.key]}
                onToggle={() => handleMenuToggle(menu.key)}
                onClose={() => handleMenuClose(menu.key)}
                isActive={isMenuActive(menu.items)}
              />
            ))}
          </div>

          {/* User Info */}
          <div className="order-2 lg:order-2 w-full lg:w-auto flex justify-center lg:justify-start mt-2 lg:mt-0">
            <UserInfo />
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#009EE3] to-transparent opacity-50"></div>
      </nav>

      <ScrollToTop isVisible={showScrollToTop} />
      <QuickMenu
        menuData={menuData}
        pathname={pathname}
      />
    </>
  );
}
