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
        "hover:shadow-xl dark:hover:shadow-gray-900/40 hover:scale-[1.02] transform hover:bg-gradient-to-br hover:from-white hover:to-gray-50/30 dark:hover:from-gray-800 dark:hover:to-gray-700/30",
        "hover:border-gray-200 dark:hover:border-gray-600 hover:-translate-y-1",
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