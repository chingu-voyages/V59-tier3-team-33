// components/Navigation/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Logo } from "../Logo";
import { NavigationProps } from "./navigation.types";
import { cva } from "class-variance-authority";
import { useAuth } from "@/hooks/useAuth";

export const navContainer = cva(
  "z-50 w-full border-b bg-background shadow-sm transition-all",
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
  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
  {
    variants: {
      active: {
        true: "bg-gray-100 text-primary",
        false: "text-foreground-light hover:bg-gray-50 hover:text-primary",
      },
    },
  }
);

export const Navigation: React.FC<NavigationProps> = ({
  links = [
    { label: "Home", href: "/" },
    { label: "My Trips", href: "/trips" },
  ],
  showUser = true,
  userName,
  sticky = true,
  className,
  onUserClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => pathname === href;

  const handleAuthAction = () => {
    if (isAuthenticated) {
      onUserClick?.();
    } else {
      router.push('/auth/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const displayName = userName || (user ? `${user.first_name} ${user.last_name}` : "Login");

  return (
    <nav className={twMerge(navContainer({ sticky }), className)}>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        <div className="flex h-14 items-center justify-between md:h-18">
          <Logo />

          {/* Desktop links */}
          <div className="hidden items-center space-x-1 md:flex">
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

          {/* Desktop user */}
          {showUser && (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="secondary"
                icon={<FaUser />}
                onClick={handleAuthAction}
              >
                {displayName}
              </Button>
              {isAuthenticated && (
                <Button
                  variant="secondary"
                  icon={<FaSignOutAlt />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              )}
            </div>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="p-2 text-foreground md:hidden"
          >
            {mobileMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
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

              {showUser && (
                <>
                  <button
                    onClick={() => {
                      handleAuthAction();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center rounded-lg px-4 py-3 text-sm text-foreground-light hover:bg-gray-50 hover:text-primary"
                  >
                    <FaUser className="mr-2" />
                    {displayName}
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center rounded-lg px-4 py-3 text-sm text-foreground-light hover:bg-gray-50 hover:text-primary"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
