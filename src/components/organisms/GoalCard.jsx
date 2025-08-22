import React from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressRing from "@/components/molecules/ProgressRing";
import ApperIcon from "@/components/ApperIcon";
import { format, differenceInDays } from "date-fns";

const GoalCard = ({ goal, onAddMoney, onEdit, onDelete }) => {
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
  
  const getStatusColor = () => {
    if (percentage >= 100) return "text-success";
    if (daysLeft < 30) return "text-warning";
    return "text-primary";
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{goal.name}</h3>
            <p className="text-sm text-gray-600">
              Target: {format(new Date(goal.deadline), "MMM d, yyyy")}
            </p>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {daysLeft > 0 ? `${daysLeft} days left` : percentage >= 100 ? "Goal achieved!" : "Overdue"}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="p-2"
            >
              <ApperIcon name="Edit2" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.Id)}
              className="p-2 text-error hover:bg-error/10"
            >
              <ApperIcon name="Trash2" size={16} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <ProgressRing
            value={goal.currentAmount}
            max={goal.targetAmount}
            size={120}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                ${goal.currentAmount.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">
                of ${goal.targetAmount.toFixed(0)}
              </div>
            </div>
          </ProgressRing>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{percentage.toFixed(1)}%</span>
          </div>
          
          {remaining > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Remaining</span>
              <span className="font-medium text-primary">${remaining.toFixed(2)}</span>
            </div>
          )}

          {percentage < 100 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAddMoney(goal)}
              className="w-full flex items-center justify-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Money
            </Button>
          )}

          {percentage >= 100 && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-success">
                <ApperIcon name="CheckCircle" size={20} />
                <span className="font-medium">Goal Achieved!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GoalCard;