import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
const menuItems = [
    { path: "/", icon: "LayoutDashboard", label: "Dashboard" },
    { path: "/transactions", icon: "Receipt", label: "Transactions" },
    { path: "/recurring-transactions", icon: "Repeat", label: "Recurring Transactions" },
    { path: "/accounts", icon: "CreditCard", label: "Accounts" },
    { path: "/budgets", icon: "PiggyBank", label: "Budgets" },
    { path: "/goals", icon: "Target", label: "Goals" },
    { path: "/todos", icon: "List", label: "Todos" },
    { path: "/charts", icon: "BarChart3", label: "Charts" },
    { path: "/settings", icon: "Settings", label: "Settings" }
  ];

return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white dark:lg:bg-gray-800 lg:border-r lg:border-gray-200 dark:lg:border-gray-700 lg:shadow-sm transition-colors duration-200">
        <div className="flex items-center px-6 py-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-xl">
              <ApperIcon name="Wallet" size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              SmartBudget
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  "hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 hover:scale-[1.02]",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border border-primary/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                )
              }
            >
              <ApperIcon name={item.icon} size={20} className="mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl transform transition-all duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-xl">
              <ApperIcon name="Wallet" size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              SmartBudget
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ApperIcon name="X" size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  "hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 hover:scale-[1.02]",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border border-primary/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                )
              }
            >
              <ApperIcon name={item.icon} size={20} className="mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;