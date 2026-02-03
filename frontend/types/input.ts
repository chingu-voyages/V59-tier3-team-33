import React, { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: "outlined" | "filled";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
