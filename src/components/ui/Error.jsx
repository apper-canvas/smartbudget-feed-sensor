import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="bg-gradient-to-br from-error/10 to-red-600/10 p-6 rounded-full border border-error/20">
        <ApperIcon name="AlertTriangle" size={48} className="text-error" />
      </div>
      
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold bg-gradient-to-r from-error to-red-600 bg-clip-text text-transparent">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 max-w-md">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="primary"
          className="flex items-center gap-2"
        >
          <ApperIcon name="RefreshCw" size={16} />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;