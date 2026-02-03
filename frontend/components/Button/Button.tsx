import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { ButtonProps } from "./button.types";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center font-medium transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-light focus-visible:ring-primary",
        secondary:
          "bg-secondary text-foreground hover:bg-secondary-dark focus-visible:ring-secondary",
        clear:
          "bg-transparent text-foreground hover:bg-background-secondary",
      },
      size: {
        small: "px-4 py-2 text-sm",
        medium: "px-6 py-3 text-base",
        large: "px-8 py-4 text-lg",
      },
      round: {
        true: "rounded-full",
        false: "rounded-lg",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
      round: false,
    },
  }
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonVariantProps
>(
  (
    {
      asChild = false,
      icon,
      iconOnly = false,
      variant,
      size,
      round,
     fullWidth,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={twMerge(
          buttonVariants({
            variant,
            size,
            round,
            fullWidth,
          }),
          iconOnly && "p-3",
          className
        )}
        {...rest}
      >
        {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";
