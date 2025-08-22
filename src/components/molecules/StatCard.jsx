import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendValue,
  className,
  valueColor = "text-gray-900"
}) => {
  const formatValue = (val) => {
    if (typeof val === "number") {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `$${(val / 1000).toFixed(1)}K`;
      } else {
        return `$${val.toFixed(0)}`;
      }
    }
    return val;
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${valueColor} bg-gradient-to-r from-current to-current bg-clip-text`}>
              {formatValue(value)}
            </p>
            {trend && trendValue && (
              <div className="flex items-center space-x-1">
                <ApperIcon 
                  name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                  size={16} 
                  className={trend === "up" ? "text-success" : "text-error"} 
                />
                <span className={`text-sm font-medium ${trend === "up" ? "text-success" : "text-error"}`}>
                  {Math.abs(trendValue)}%
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-4 rounded-xl border border-primary/20">
            <ApperIcon name={icon} size={24} className="text-primary" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;