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
        "bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-200",
        "hover:shadow-xl hover:scale-[1.02] transform",
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