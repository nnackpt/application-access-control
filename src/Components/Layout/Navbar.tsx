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
  <Link href="/" className="flex items-center cursor-pointer scale-105 transition-transform duration-200">
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
  <div className="flex items-center space-x-2 min-w-fit">
    <UserIcon className="w-5 h-5 text-gray-700" />
    <span className="text-sm text-gray-700">User</span>
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
        className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors duration-200"
      >
        <span>{label}</span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`} 
        />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={onClose}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-max">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={onClose}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}
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
        { label: "Application's Roles", href: '/RBAC/AppRoles' },
        { label: "Application's Functions", href: '/RBAC/AppFunctions' },
        { label: "Application's Role Base Accessed Control (RBAC)", href: '/RBAC/AppRBAC' }
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
        { label: 'Authorized User', href: '/Report/AppAuthUser' }
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
      <nav className="hidden md:block bg-[#C1CBD3] px-2 lg:px-4">
        <div className="flex justify-between items-center min-h-[50px] py-2">
          {/* User Info */}
          <div className="order-2 lg:order-1 w-full lg:w-auto flex justify-center lg:justify-start mt-2 lg:mt-0">
            <UserInfo />
          </div>

          {/* Menu Items */}
          <div className="order-1 lg:order-2 flex flex-wrap justify-center space-x-1 sm:space-x-2 lg:space-x-4">
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
        </div>
      </nav>
    </>
  );
}