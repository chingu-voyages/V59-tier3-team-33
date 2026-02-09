import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { InputProps } from "./input.types";
import { cva } from "class-variance-authority";

export const containerStyles = cva("flex flex-col gap-1", {
  variants: {
    fullWidth: {
      true: "w-full",
      false: "w-auto",
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

export const inputWrapperStyles = cva("relative flex items-center", {
  variants: {
    fullWidth: {
      true: "w-full",
    },
  },
});

export const inputStyles = cva(
  [
    "px-4 py-3 rounded-2xl font-normal transition-all outline-none",
    "focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        outlined: "border-2 bg-background",
        filled: "border-0 bg-background-secondary",
      },
      state: {
        normal:
          "border focus:border-primary focus:ring-primary/20 text-foreground",
        error:
          "border-danger-400 focus:ring-danger-50 text-danger-400",
      },
      leftIcon: {
        true: "pl-12",
      },
      rightIcon: {
        true: "pr-12",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "outlined",
      state: "normal",
    },
  }
);

export const labelStyles = cva("text-sm font-medium", {
  variants: {
    error: {
      true: "text-danger-400",
      false: "text-foreground",
    },
  },
});

export const helperTextStyles = cva("text-xs", {
  variants: {
    error: {
      true: "text-danger-400",
      false: "text-foreground-light",
    },
  },
});

export const iconStyles =
  "absolute text-foreground-light pointer-events-none";

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
      required,
      id,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    return (
      <div className={containerStyles({ fullWidth })}>
        {label && (
          <label
            htmlFor={id}
            className={labelStyles({ error: hasError })}
          >
            {label}
            {required && (
              <span className="ml-1 text-danger-400">*</span>
            )}
          </label>
        )}

        <div className={inputWrapperStyles({ fullWidth })}>
          {leftIcon && (
            <span className={twMerge(iconStyles, "left-4")}>
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={twMerge(
              inputStyles({
                variant,
                state: hasError ? "error" : "normal",
                leftIcon: Boolean(leftIcon),
                rightIcon: Boolean(rightIcon),
                fullWidth,
              }),
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className={twMerge(iconStyles, "right-4")}>
              {rightIcon}
            </span>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={helperTextStyles({
              error: hasError,
            })}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
