// components/Logo/Logo.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";
import { LogoProps } from "./logo.types";
import { cva } from "class-variance-authority";

export const logoContainer = cva(
  "flex items-center transition-opacity hover:opacity-80",
  {
    variants: {
      size: {
        default: "",
        large: "",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export const logoImage = cva("object-contain", {
  variants: {
    size: {
      default: "",
      large: "",
    },
  },
});

const SIZES = {
  default: { width: 120, height: 37 },
  large: { width: 160, height: 50 },
};

export const Logo: React.FC<LogoProps> = ({
  large = false,
  logoOnly = false,
  href = "/",
  className,
  variant = 'default',
}) => {
  const sizeKey = large ? "large" : "default";
  const imageSize = SIZES[sizeKey];
  const logoSrc = variant === 'alt' ? '/icon_alt.svg' : '/icon.svg';

  return (
    <Link
      href={href}
      className={twMerge(
        logoContainer({ size: sizeKey }),
        className
      )}
    >
      <Image
        src={logoSrc}
        alt="JoyRoute"
        {...imageSize}
        priority
        className={logoImage({ size: sizeKey })}
      />
      {!logoOnly && null}
    </Link>
  );
};
