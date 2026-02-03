"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Logo } from "../Logo";

export interface NavigationLink {
  label: string;
  href: string;
}

export interface NavigationProps {
  /**
   * Navigation links
   */
  links?: NavigationLink[];
  /**
   * Sticky navigation bar
   */
  sticky?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Navigation component with responsive design
 */
export const Navigation: React.FC<NavigationProps> = ({
  links = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
  ],
  showCart = true,
  cartCount = 0,
  showUser = true,
  userName,
  sticky = true,
  className,
  onCartClick,
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
            {showCart && (
              <Button
                variant="clear"
                size="medium"
                onClick={onCartClick}
                className="relative"
                aria-label="Shopping cart"
              >
                <FaShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            )}
            {showUser && (
              <Button
                variant={userName ? "secondary" : "primary"}
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
            {showCart && (
              <button
                onClick={onCartClick}
                className="text-foreground hover:text-primary relative p-2 transition-colors"
                aria-label="Shopping cart"
              >
                <FaShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            )}
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
