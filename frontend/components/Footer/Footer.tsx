import Link from "next/link";
import React from "react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { Logo } from "../Logo";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  name: string;
  href: string;
  icon:
    | "facebook"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "github"
    | "youtube";
}

export interface FooterProps {
  /**
   * Footer sections
   */
  sections?: FooterSection[];
  /**
   * Social media links
   */
  socialLinks?: SocialLink[];
  /**
   * Copyright text
   */
  copyrightText?: string;
  /**
   * Show app download section
   */
  showAppDownload?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

const socialIcons = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  github: FaGithub,
  youtube: FaYoutube,
};

/**
 * Footer component with responsive grid layout
 */
export const Footer: React.FC<FooterProps> = ({
  sections = [
    {
      title: "Discover",
      links: [
        { label: "Home", href: "/" },
        { label: "Categories", href: "/categories" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "FAQ", href: "/faq" },
      ],
    },
  ],
  socialLinks = [
    { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { name: "Twitter", href: "https://twitter.com", icon: "twitter" },
  ],
  copyrightText = "© 2026 JoyRoute. All rights reserved.",
  showAppDownload = false,
  className,
}) => {
  const containerClasses = twMerge(
    "w-full bg-neutral-900 py-12 text-white md:py-16",
    className,
  );

  return (
    <footer className={containerClasses}>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 pb-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="col-span-1">
            <Logo large logoOnly className="mb-4" />
            <p className="text-sm leading-relaxed text-gray-400">
              Turn your destinations into the most efficient routes.
            </p>
          </div>

          {/* Footer Sections */}
          {sections.map((section, index) => (
            <div key={index} className="col-span-1">
              <h3 className="mb-4 text-lg font-semibold text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Media or App Download */}
          <div className="col-span-1">
            {showAppDownload ? (
              <>
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Get the App
                </h3>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="flex h-10 w-32 items-center justify-center rounded-lg bg-white text-xs font-medium text-gray-900 transition-colors hover:bg-gray-100"
                  >
                    App Store
                  </a>
                  <a
                    href="#"
                    className="flex h-10 w-32 items-center justify-center rounded-lg bg-white text-xs font-medium text-gray-900 transition-colors hover:bg-gray-100"
                  >
                    Google Play
                  </a>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = socialIcons[social.icon];
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 transition-colors hover:text-white"
                        aria-label={social.name}
                      >
                        <Icon className="text-2xl" />
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-800"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <p className="text-sm text-gray-400">{copyrightText}</p>
          <div className="flex space-x-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
