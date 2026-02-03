import React, { forwardRef, InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input label
   */
  label?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Full width input
   */
  fullWidth?: boolean;
  /**
   * Input variant
   */
  variant?: "outlined" | "filled";
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;
}

/**
 * Input component with validation support
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      variant = "outlined",
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const containerClasses = twMerge(
      "flex flex-col gap-1",
      fullWidth ? "w-full" : "w-auto",
    );

    const inputWrapperClasses = twMerge(
      "relative flex items-center",
      fullWidth && "w-full",
    );

    const baseInputClasses =
      "px-4 py-3 rounded-lg font-normal transition-all outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      outlined: "border-2 bg-background",
      filled: "border-0 bg-background-secondary",
    };

    const stateClasses = error
      ? "border-red-500 focus:ring-red-200 text-red-900"
      : "border-border focus:border-primary focus:ring-primary/20 text-foreground";

    const inputClasses = twMerge(
      baseInputClasses,
      variantClasses[variant],
      stateClasses,
      leftIcon && "pl-12",
      rightIcon && "pr-12",
      fullWidth && "w-full",
      className,
    );

    const iconClasses = "absolute text-foreground-light pointer-events-none";

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={props.id}
            className={twMerge(
              "text-sm font-medium",
              error ? "text-red-600" : "text-foreground",
            )}
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className={inputWrapperClasses}>
          {leftIcon && (
            <span className={twMerge(iconClasses, "left-4")}>{leftIcon}</span>
          )}
          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <span className={twMerge(iconClasses, "right-4")}>{rightIcon}</span>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={twMerge(
              "text-xs",
              error ? "text-red-600" : "text-foreground-light",
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
