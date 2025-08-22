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
        "bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700 transition-all duration-200",
        "hover:shadow-xl dark:hover:shadow-gray-900/40 hover:scale-[1.02] transform",
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