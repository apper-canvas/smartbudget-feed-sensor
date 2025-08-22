import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item",
  actionLabel = "Add New",
  onAction,
  icon = "Inbox"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-8 rounded-full border border-primary/20">
        <ApperIcon name={icon} size={64} className="text-primary" />
      </div>
      
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-gray-600 max-w-md">
          {description}
        </p>
      </div>

      {onAction && (
        <Button 
          onClick={onAction} 
          variant="primary"
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;