import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/molecules/ProgressBar";
import ApperIcon from "@/components/ApperIcon";

const BudgetCard = ({ category, spent, limit, icon, color }) => {
  const percentage = (spent / limit) * 100;
  const remaining = Math.max(limit - spent, 0);
  
  const getStatus = () => {
    if (percentage >= 100) return { label: "Over Budget", variant: "error" };
    if (percentage >= 90) return { label: "Almost Exceeded", variant: "warning" };
    if (percentage >= 75) return { label: "High Usage", variant: "warning" };
    return { label: "On Track", variant: "success" };
  };

  const status = getStatus();

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
              <ApperIcon name={icon} size={20} style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{category}</h3>
              <Badge variant={status.variant} size="sm">
                {status.label}
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`font-bold text-lg ${percentage >= 100 ? 'text-error' : 'text-success'}`}>
              ${remaining.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spent: ${spent.toFixed(2)}</span>
            <span className="text-gray-600">Budget: ${limit.toFixed(2)}</span>
          </div>
          
          <ProgressBar 
            value={spent} 
            max={limit}
            variant="primary"
          />
          
          <div className="flex justify-center">
            <span className="text-xs text-gray-500">
              {percentage.toFixed(1)}% of budget used
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCard;