"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Logo } from "../Logo";
import { NavigationProps } from "@/interface/components/nav";

/**
 * Navigation component with responsive design
 */
export const Navigation: React.FC<NavigationProps>= ({
  links = [
    { label: "Home", href: "/" },
    { label: "My Trips", href: "/trips" }
  ],
  showUser = true,
  userName,
  sticky = true,
  className,
  onUserClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const containerClasses = twMerge(
    "border-border bg-background z-50 w-full border-b shadow-sm transition-all",
    sticky && "sticky top-0",
    className,
  );

  const isActiveLink = (href: string) => pathname === href;

  return (
    <nav className={containerClasses}>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        <div className="flex h-14 items-center justify-between md:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={twMerge(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActiveLink(link.href)
                    ? "text-primary bg-gray-100"
                    : "text-foreground-light hover:text-primary hover:bg-gray-50",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center space-x-2 md:flex">
            {showUser && (
              <Button
                variant={"secondary"}
                size="medium"
                onClick={onUserClick}
                icon={<FaUser />}
                aria-label={userName || "Login"}
              >
                {userName || "Login"}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-foreground hover:text-primary p-2 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FaTimes className="text-2xl" />
              ) : (
                <FaBars className="text-2xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={twMerge(
                    "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActiveLink(link.href)
                      ? "text-primary bg-gray-100"
                      : "text-foreground-light hover:text-primary hover:bg-gray-50",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {showUser && (
                <button
                  onClick={() => {
                    onUserClick?.();
                    setMobileMenuOpen(false);
                  }}
                  className="text-foreground-light hover:text-primary flex items-center rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-50"
                >
                  <FaUser className="mr-2" />
                  {userName || "Login"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
