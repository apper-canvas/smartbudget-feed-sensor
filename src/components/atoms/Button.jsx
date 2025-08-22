import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md",
  children,
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg hover:brightness-110",
    secondary: "bg-gradient-to-r from-secondary to-purple-600 text-white shadow-md hover:shadow-lg hover:brightness-110",
    outline: "border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white",
    ghost: "text-gray-700 hover:bg-gray-100",
    danger: "bg-gradient-to-r from-error to-red-600 text-white shadow-md hover:shadow-lg hover:brightness-110"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;