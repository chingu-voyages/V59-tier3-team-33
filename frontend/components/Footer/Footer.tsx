import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { Logo } from "../Logo";
import { cva } from "class-variance-authority";
import { FooterProps } from "./footer.types";

export const footerContainer = cva(
  "w-full bg-primary-700 text-white",
  {
    variants: {
      padding: {
        default: "py-12 md:py-8",
        compact: "py-8",
      },
    },
    defaultVariants: {
      padding: "default",
    },
  }
);

export const footerHeading = "mb-4 text-lg font-semibold text-white flex gap-2 items-center";

export const footerDescription = "text-sm leading-relaxed text-surface-100";

const teamMembers = [
  {
    name: "Samantha",
    github: "https://github.com/samanthakgraham",
  },
  {
    name: "Direwen",
    github: "https://github.com/Direwen",
  },
  {
    name: "Margaret Wu",
    github: "https://github.com/margaretcwu",
  },
  {
    name: "Chanae Pickett",
    github: "https://github.com/chanaelynease",
  },
  {
    name: "Chris",
    github: "https://github.com/chalrees876",
  },
  {
    name: "Oshada Kularathne",
    github: "https://github.com/devimalka",
  },
  {
    name: "Gobinath Varatharajan",
    github: "https://github.com/gobinathvaratharajan",
  },
];

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={twMerge(footerContainer(), className)}>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-3">
          {/* Logo & Description */}
          <div>
            <Logo large logoOnly variant="alt" className="mb-4" />
            <p className={footerDescription}>
              Turn your destinations into the most efficient routes.
            </p>
          </div>

          {/* Team Section */}
          <div className="lg:col-span-2">

            <h3 className={footerHeading}>
              <FaGithub className="text-base" />Team
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {teamMembers.map((member, index) => (
                <a
                  key={index}
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-surface-100 hover:text-white transition-colors"
                  aria-label={`${member.name}'s GitHub`}
                >
                  {member.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
