import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const AccountCard = ({ account, onEdit, onDelete }) => {
  const getTypeLabel = (type) => {
    const labels = {
      checking: "Checking",
      savings: "Savings",
      credit: "Credit Card",
      cash: "Cash",
      investment: "Investment"
    };
    return labels[type] || type;
  };

  const formatBalance = (balance, type) => {
    const formattedAmount = Math.abs(balance).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    if (type === "credit") {
      return balance < 0 ? `-$${formattedAmount}` : `$${formattedAmount}`;
    }
    return `$${formattedAmount}`;
  };

  const getBalanceColor = (balance, type) => {
    if (type === "credit") {
      return balance < 0 ? "text-error" : "text-success";
    }
    return balance >= 0 ? "text-success" : "text-error";
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${account.color}15` }}
          >
            <ApperIcon 
              name={account.icon} 
              size={24} 
              style={{ color: account.color }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-32">
              {account.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{getTypeLabel(account.type)}</span>
              {account.isLinked && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="Link" size={12} />
                    <span>Linked</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(account)}
            className="p-2"
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(account.Id)}
            className="p-2 hover:text-error"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center py-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
          <p className="text-sm text-gray-600 mb-1">Current Balance</p>
          <p className={`text-2xl font-bold ${getBalanceColor(account.balance, account.type)}`}>
            {formatBalance(account.balance, account.type)}
          </p>
        </div>

        {account.isLinked && account.bankName && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Bank:</span>
            <span className="font-medium text-gray-900">{account.bankName}</span>
          </div>
        )}

        {account.accountNumber && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Account:</span>
            <span className="font-mono text-gray-900">{account.accountNumber}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AccountCard;