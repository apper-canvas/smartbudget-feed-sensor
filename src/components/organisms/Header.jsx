import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick, title = "Dashboard", subtitle }) => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="md"
              onClick={onMenuClick}
              className="lg:hidden p-2"
            >
              <ApperIcon name="Menu" size={20} />
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              size="md"
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;