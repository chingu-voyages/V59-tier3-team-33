import React from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   */
  variant?: "primary" | "secondary" | "clear";
  /**
   * Button size
   */
  size?: "small" | "medium" | "large";
  /**
   * Round button style
   */
  round?: boolean;
  /**
   * Icon element (optional)
   */
  icon?: React.ReactNode;
  /**
   * Icon only button (no text)
   */
  iconOnly?: boolean;
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Button content
   */
  children?: React.ReactNode;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Button component for user interactions
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      round = false,
      icon,
      iconOnly = false,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";

    const variantClasses = {
      primary:
        "bg-primary text-white hover:bg-primary-light focus:ring-primary disabled:hover:bg-primary",
      secondary:
        "bg-secondary text-foreground hover:bg-secondary-dark focus:ring-secondary disabled:hover:bg-secondary",
      clear:
        "bg-transparent text-foreground hover:bg-background-secondary focus:ring-neutral-300 disabled:hover:bg-transparent",
    };

    const sizeClasses = iconOnly
      ? {
          small: "p-2",
          medium: "p-3",
          large: "p-4",
        }
      : {
          small: "px-4 py-2 text-sm",
          medium: "px-6 py-3 text-base",
          large: "px-8 py-4 text-lg",
        };

    const radiusClasses = round ? "rounded-full" : "rounded-lg";

    const buttonClasses = twMerge(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      radiusClasses,
      fullWidth && "w-full",
      className,
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled}
        {...props}
      >
        {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
