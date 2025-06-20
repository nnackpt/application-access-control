"use client"

import Link from "next/link";
import React from "react";
import { ChevronDownIcon, UserIcon } from "@heroicons/react/24/outline";

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
}

// Components
const Logo = () => (
  <Link href="/" className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-200">
    <img 
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

const UserInfo = () => (
  <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-lg border border-white/20 hover:bg-white transition-all duration-300 group">
    <div className="p-1.5 bg-gradient-to-br from-[#005496] to-[#003d73] rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-300">
      <UserIcon className="w-4 h-4 text-white" />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-[#005496] leading-tight">User</span>
      <span className="text-xs text-gray-500 leading-tight">phakin.thongla-ar</span>
    </div>
    <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm animate-pulse"></div>
  </div>
);

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  label, 
  items, 
  isOpen, 
  onToggle, 
  onClose 
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 border ${
          isOpen 
            ? 'bg-[#005496] text-white border-[#005496] shadow-lg scale-105' 
            : 'text-[#005496] bg-white/80 border-white/40 hover:bg-[#005496] hover:text-white hover:border-[#005496] hover:shadow-md hover:scale-105'
        } backdrop-blur-sm`}
      >
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-all duration-300 ${
            isOpen ? 'rotate-180 scale-110' : 'rotate-0'
          }`} 
        />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10 bg-black/5 backdrop-blur-[1px]" 
            onClick={onClose}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-20 min-w-max overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-1">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={onClose}
                  className="block px-4 py-3 text-sm text-[#005496] hover:bg-gradient-to-r hover:from-[#005496] hover:to-[#003d73] hover:text-white rounded-lg transition-all duration-200 font-medium hover:shadow-md hover:scale-[1.02] transform"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#005496] rounded-full opacity-60"></div>
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main Navbar Component
export default function Navbar() {
  const [openMenus, setOpenMenus] = React.useState<{
    [key: string]: boolean;
  }>({
    applications: false,
    rbac: false,
    users: false,
    report: false
  });

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
        { label: "Application's Role Base Accessed Control (RBAC)", href: '#' }
      ]
    },
    {
      key: 'users',
      label: 'Users Authorized',
      items: [
        { label: "Application's Users", href: '#' }
      ]
    },
    {
      key: 'report',
      label: 'Report',
      items: [
        { label: 'Authorized User', href: '#' }
      ]
    }
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="bg-[#005496]">
        <div className="flex justify-between items-center min-h-[80px] sm:min-h-[100px] px-2 sm:px-4">
          <Logo />
          <Title />
        </div>
        <MobileTitle />
      </header>
      
      {/* Bottom Navbar - Desktop Only */}
      <nav className="hidden md:block bg-gradient-to-r from-[#C1CBD3] to-[#B5C3CC] px-2 lg:px-4 shadow-inner">
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
              />
            ))}
          </div>

          {/* User Info */}
          <div className="order-2 lg:order-2 w-full lg:w-auto flex justify-center lg:justify-start mt-2 lg:mt-0">
            <UserInfo />
          </div>
        </div>
      </nav>
    </>
  );
}