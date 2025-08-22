import React from "react";
import { cn } from "@/utils/cn";

const ProgressBar = ({ 
  value, 
  max = 100, 
  className,
  showLabel = false,
  label,
  variant = "primary"
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-600",
    success: "bg-gradient-to-r from-success to-green-600",
    warning: "bg-gradient-to-r from-warning to-yellow-600",
    error: "bg-gradient-to-r from-error to-red-600"
  };

  const getVariant = () => {
    if (percentage >= 90) return "error";
    if (percentage >= 75) return "warning";
    return "success";
  };

  const barVariant = variant === "primary" ? getVariant() : variant;

  return (
    <div className={cn("space-y-2", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", variants[barVariant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;