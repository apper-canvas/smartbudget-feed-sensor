import React, { useContext } from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthContext } from "../../App";
const Header = ({ onMenuClick, onAddTransaction, title = "Dashboard", subtitle }) => {
  const { theme, toggleTheme } = useTheme();
const { logout } = useContext(AuthContext) || {};

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-200">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

<div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="md"
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <ApperIcon 
                name={theme === 'light' ? 'Moon' : 'Sun'} 
                size={20} 
              />
            </Button>
            
            {logout && (
              <Button
                variant="ghost"
                size="md"
                onClick={logout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                title="Logout"
              >
                <ApperIcon name="LogOut" size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;