import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700 transition-all duration-300",
        "hover:shadow-2xl dark:hover:shadow-gray-900/50 hover:scale-[1.03] transform hover:bg-gradient-to-br hover:from-white hover:to-gray-50/50 dark:hover:from-gray-800 dark:hover:to-gray-700/50",
        "hover:border-gray-200 dark:hover:border-gray-600",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";
export default Card;