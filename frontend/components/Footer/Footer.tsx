// components/Footer/Footer.tsx
import Link from "next/link";
import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { Logo } from "../Logo";
import { cva } from "class-variance-authority";
import { FooterProps } from "./footer.types";

export const footerContainer = cva(
  "w-full bg-neutral-900 text-white",
  {
    variants: {
      padding: {
        default: "py-12 md:py-16",
        compact: "py-8",
      },
    },
    defaultVariants: {
      padding: "default",
    },
  }
);

export const footerHeading =
  "mb-4 text-lg font-semibold text-white";

export const footerLink =
  "text-sm text-gray-400 transition-colors hover:text-white";

export const footerDescription =
  "text-sm leading-relaxed text-gray-400";


const socialIcons = {
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  github: FaGithub,
};

export const Footer: React.FC<FooterProps> = ({
  sections = [
    {
      title: "Discover",
      links: [
        { label: "Home", href: "/" },
        { label: "My Trips", href: "/trips" },
      ],
    },
  ],
  socialLinks = [],
  showContributor = true,
  className,
}) => {
  return (
    <footer className={twMerge(footerContainer(), className)}>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo */}
          <div>
            <Logo large logoOnly className="mb-4" />
            <p className={footerDescription}>
              Turn your destinations into the most efficient routes.
            </p>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className={footerHeading}>{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={footerLink}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={footerLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contributors */}
          {showContributor && socialLinks.length > 0 && (
            <div>
              <h3 className={footerHeading}>Team</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = socialIcons[social.icon];
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                      <Icon className="text-xl" />
                      <span className="text-sm">
                        Member {index + 1}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
