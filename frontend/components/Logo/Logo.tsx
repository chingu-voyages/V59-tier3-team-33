import Image from "next/image";
import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

export interface LogoProps {
  /**
   * Large logo size
   */
  large?: boolean;
  /**
   * Show only logo without text
   */
  logoOnly?: boolean;
  /**
   * Custom className for styling
   */
  className?: string;
  /**
   * Link destination
   */
  href?: string;
}

/**
 * Logo component for branding - uses JoyRoute icon.svg
 */
export const Logo: React.FC<LogoProps> = ({
  large = false,
  logoOnly = false,
  className,
  href = "/",
}) => {
  const logoClasses = twMerge(
    "flex items-center transition-opacity hover:opacity-80",
    className,
  );

  const imageSize = large
    ? { width: 160, height: 50 }
    : { width: 120, height: 37 };

  return (
    <Link href={href} className={logoClasses}>
      <Image
        src="/icon.svg"
        alt="JoyRoute"
        {...imageSize}
        priority
        className="object-contain"
      />
    </Link>
  );
};
