import Link from "next/link";
import React from "react";
import {
  FaFacebook,
  FaGithub,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { Logo } from "../Logo";
import { FooterProps } from "@/interface/components/footer";

const socialIcons = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  github: FaGithub,
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
        { label: "My Trips", href: "/trips" }
      ],
    }
  ],
  socialLinks = [
    { name: "Github", href: "https://github.com", icon: "github" },
    { name: "Github", href: "https://github.com", icon: "github" },
    { name: "Github", href: "https://github.com", icon: "github" },
    { name: "Github", href: "https://github.com", icon: "github" },
    { name: "Github", href: "https://github.com", icon: "github" },
    { name: "Github", href: "https://github.com", icon: "github" },
    { name: "Github", href: "https://github.com", icon: "github" }
  ],
  showContributor = true,
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
            {showContributor ? (
              <>
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Teams
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
                        <span>Members:{index}</span>
                        <Icon className="text-2xl" />
                      </a>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
};
