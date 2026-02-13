"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Logo } from "../Logo";
import { NavigationProps } from "./navigation.types";
import { cva } from "class-variance-authority";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const navContainer = cva(
  "z-50 w-full bg-white/80 shadow",
  {
    variants: {
      sticky: {
        true: "sticky top-0",
        false: "",
      },
    },
    defaultVariants: {
      sticky: true,
    },
  }
);

export const navLink = cva(
  "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
  {
    variants: {
      active: {
        true: "bg-primary-50 text-primary",
        false: "text-neutral-200 hover:bg-surface-400 hover:text-primary",
      },
    },
  }
);

export const Navigation: React.FC<NavigationProps> = ({
  links = [
    { label: "Home", href: "/" },
    { label: "My Trips", href: "/trips" },
  ],
  sticky = true,
  className,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className={twMerge(navContainer({ sticky }), className)}>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Nav Links */}
            <div className="flex items-center gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLink({ active: isActive(link.href) })}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-surface-400 rounded-lg transition-colors outline-none">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <FaUser className="text-sm" />
                  </div>
                  <span className="capitalize">{user?.first_name || 'User'}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer"
                  >
                    <FaUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-danger-400 focus:text-danger-400"
                  >
                    <FaSignOutAlt className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 text-neutral-200 md:hidden"
          >
            {mobileMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-surface-500 py-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLink({ active: isActive(link.href) })}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-surface-500 my-2" />
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/profile');
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-200 hover:bg-surface-400 rounded-lg transition-colors"
                  >
                    <FaUser />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-danger-400 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-surface-500 my-2" />
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-lg transition-colors text-center"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
