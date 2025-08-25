import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { goalService } from "@/services/api/goalService";
import { categoryService } from "@/services/api/categoryService";
import { endOfMonth, format, startOfMonth } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Goals from "@/components/pages/Goals";
import Transactions from "@/components/pages/Transactions";
import BudgetCard from "@/components/organisms/BudgetCard";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const Dashboard = () => {
  const [data, setData] = useState({
    transactions: [],
    budgets: [],
    goals: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [transactions, budgets, goals, categories] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        goalService.getAll(),
        categoryService.getAll()
      ]);

      setData({ transactions, budgets, goals, categories });
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const currentMonth = format(new Date(), "yyyy-MM");
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

// Enhanced current month transaction calculations
  const currentMonthTransactions = (data.transactions || []).filter(t => {
    if (!t.date) return false;
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd && !isNaN(transactionDate);
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Enhanced spending by category calculation with better handling
  const spendingByCategory = {};
  currentMonthTransactions
    .filter(t => t.type === "expense" && t.category)
    .forEach(t => {
      const category = t.category;
      const amount = parseFloat(t.amount) || 0;
      spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
    });
  // Get current month budget
  const currentBudget = data.budgets.find(b => b.month === currentMonth);
  const totalBudget = currentBudget?.totalLimit || 0;
  const budgetProgress = totalBudget > 0 ? (monthlyExpenses / totalBudget) * 100 : 0;

  // Calculate total savings goal progress
  const totalGoalTarget = data.goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalCurrent = data.goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

  // Get top spending categories (limit to budget categories)
  const budgetCategories = currentBudget ? Object.keys(currentBudget.categoryLimits) : [];
  const topCategories = budgetCategories
    .map(category => ({
      category,
      spent: spendingByCategory[category] || 0,
      limit: currentBudget.categoryLimits[category] || 0,
      icon: data.categories.find(c => c.name === category)?.icon || "ShoppingBag",
      color: data.categories.find(c => c.name === category)?.color || "#6B7280"
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);

const recentTransactions = (data.transactions || [])
    .filter(t => t.date && !isNaN(new Date(t.date)))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Balance"
          value={monthlyBalance}
          icon="Wallet"
          trend={monthlyBalance >= 0 ? "up" : "down"}
          trendValue={Math.abs((monthlyBalance / (monthlyIncome || 1)) * 100)}
          valueColor={monthlyBalance >= 0 ? "text-success" : "text-error"}
        />
        <StatCard
          title="Monthly Income"
          value={monthlyIncome}
          icon="TrendingUp"
          trend="up"
          trendValue={15}
          valueColor="text-success"
        />
        <StatCard
          title="Monthly Expenses"
          value={monthlyExpenses}
          icon="TrendingDown"
          trend="down"
          trendValue={8}
          valueColor="text-error"
        />
        <StatCard
          title="Budget Used"
          value={`${budgetProgress.toFixed(0)}%`}
          icon="Target"
          trend={budgetProgress > 100 ? "up" : "down"}
          trendValue={budgetProgress}
          valueColor={budgetProgress > 100 ? "text-error" : budgetProgress > 75 ? "text-warning" : "text-success"}
        />
      </div>

      {/* Budget Overview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Budget Overview
            </h2>
            <p className="text-gray-600">Track your spending against budgets</p>
          </div>
        </div>

        {topCategories.length === 0 ? (
          <Empty
            title="No budgets set"
            description="Create your first budget to start tracking your spending"
            icon="PiggyBank"
            actionLabel="Create Budget"
            onAction={() => window.location.href = "/budgets"}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCategories.map((category) => (
              <BudgetCard
                key={category.category}
                category={category.category}
                spent={category.spent}
                limit={category.limit}
                icon={category.icon}
                color={category.color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goals & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goals Summary */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Savings Goals</h3>
            <p className="text-gray-600">Progress towards your financial goals</p>
          </div>
          
          {data.goals.length === 0 ? (
            <div className="bg-gradient-to-br from-surface/50 to-gray-50/50 rounded-xl p-8 text-center border border-gray-100">
              <div className="bg-gradient-to-br from-secondary/10 to-purple-600/10 p-4 rounded-full inline-block mb-4 border border-secondary/20">
                <ApperIcon name="Target" size={32} className="text-secondary" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No goals yet</h4>
              <p className="text-sm text-gray-600 mb-4">Set your first savings goal to start tracking progress</p>
              <button
                onClick={() => window.location.href = "/goals"}
                className="text-secondary font-medium hover:underline"
              >
                Create Goal →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-surface/50 to-gray-50/50 rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Progress</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent">
                      {goalProgress.toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Saved</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${totalGoalCurrent.toFixed(0)} / ${totalGoalTarget.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
              
              {data.goals.slice(0, 3).map(goal => (
                <div key={goal.Id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${goal.currentAmount.toFixed(0)} / ${goal.targetAmount.toFixed(0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-secondary">
                      {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Transactions</h3>
            <p className="text-gray-600">Your latest financial activity</p>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="bg-gradient-to-br from-surface/50 to-gray-50/50 rounded-xl p-8 text-center border border-gray-100">
              <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-4 rounded-full inline-block mb-4 border border-primary/20">
                <ApperIcon name="Receipt" size={32} className="text-primary" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No transactions yet</h4>
              <p className="text-sm text-gray-600 mb-4">Add your first transaction to get started</p>
              <button
                onClick={() => window.location.href = "/transactions"}
                className="text-primary font-medium hover:underline"
              >
                Add Transaction →
              </button>
            </div>
          ) : (
<div className="space-y-3">
              {recentTransactions.map(transaction => (
                <div key={transaction.Id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <ApperIcon 
                        name={data.categories.find(c => c.name === transaction.category)?.icon || "Receipt"} 
                        size={16}
                        className="text-gray-600"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.category || 'Uncategorized'}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.date ? format(new Date(transaction.date), "MMM d") : 'No date'}
                        {transaction.notes && ` • ${transaction.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === "income" ? "text-success" : "text-error"}`}>
                      {transaction.type === "income" ? "+" : "-"}${(parseFloat(transaction.amount) || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;