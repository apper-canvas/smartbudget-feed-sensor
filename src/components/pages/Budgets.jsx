import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import BudgetCard from "@/components/organisms/BudgetCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { budgetService } from "@/services/api/budgetService";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import { format, startOfMonth, endOfMonth } from "date-fns";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [categoryLimits, setCategoryLimits] = useState({});
  const [totalLimit, setTotalLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMonth = format(new Date(), "yyyy-MM");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [budgetData, categoryData, transactionData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll(),
        transactionService.getAll()
      ]);

      setBudgets(budgetData);
      setCategories(categoryData.filter(c => c.type === "expense"));
      setTransactions(transactionData);

      // Load current month budget if exists
      const currentBudget = budgetData.find(b => b.month === currentMonth);
      if (currentBudget) {
        setCategoryLimits(currentBudget.categoryLimits);
        setTotalLimit(currentBudget.totalLimit.toString());
      }
    } catch (err) {
      setError("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryLimitChange = (category, value) => {
    setCategoryLimits(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!totalLimit || Object.keys(categoryLimits).length === 0) {
      toast.error("Please set a total budget and at least one category limit");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const budgetData = {
        month: currentMonth,
        totalLimit: parseFloat(totalLimit),
        categoryLimits
      };

      const existingBudget = budgets.find(b => b.month === currentMonth);
      if (existingBudget) {
        await budgetService.update(existingBudget.Id, budgetData);
        toast.success("Budget updated successfully!");
      } else {
        await budgetService.create(budgetData);
        toast.success("Budget created successfully!");
      }

      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error("Failed to save budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const currentBudget = budgets.find(b => b.month === currentMonth);
  
  // Calculate spending by category for current month
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  
  const currentMonthExpenses = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return t.type === "expense" && transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const spendingByCategory = {};
  currentMonthExpenses.forEach(t => {
    spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
  });

  const budgetCategories = currentBudget ? Object.keys(currentBudget.categoryLimits).map(category => ({
    category,
    spent: spendingByCategory[category] || 0,
    limit: currentBudget.categoryLimits[category],
    icon: categories.find(c => c.name === category)?.icon || "ShoppingBag",
    color: categories.find(c => c.name === category)?.color || "#6B7280"
  })) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Monthly Budgets
          </h1>
          <p className="text-gray-600">
            Set spending limits and track your progress for {format(new Date(), "MMMM yyyy")}
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <ApperIcon name={showForm ? "X" : "Plus"} size={16} />
          {currentBudget ? "Edit Budget" : "Create Budget"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
                <ApperIcon name="PiggyBank" size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {currentBudget ? "Edit Budget" : "Create Monthly Budget"}
                </h2>
                <p className="text-sm text-gray-600">
                  Set your spending limits for {format(new Date(), "MMMM yyyy")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="number"
                label="Total Monthly Budget"
                placeholder="0.00"
                value={totalLimit}
                onChange={(e) => setTotalLimit(e.target.value)}
                min="0"
                step="0.01"
                required
              />

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(category => (
                    <div key={category.Id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                        <ApperIcon name={category.icon} size={20} style={{ color: category.color }} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {category.name}
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={categoryLimits[category.name] || ""}
                          onChange={(e) => handleCategoryLimitChange(category.name, e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <ApperIcon name="Loader2" size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" size={16} />
                      {currentBudget ? "Update Budget" : "Create Budget"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {budgetCategories.length === 0 ? (
        <Empty
          title="No budget set for this month"
          description="Create your monthly budget to start tracking your spending limits"
          icon="PiggyBank"
          actionLabel="Create Budget"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* Budget Overview */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-xl border border-primary/20">
                  <p className="text-sm text-primary font-medium">Total Budget</p>
                  <p className="text-2xl font-bold text-primary">
                    ${currentBudget?.totalLimit.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-error/10 to-red-600/10 rounded-xl border border-error/20">
                  <p className="text-sm text-error font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-error">
                    ${Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-success/10 to-green-600/10 rounded-xl border border-success/20">
                  <p className="text-sm text-success font-medium">Remaining</p>
                  <p className="text-2xl font-bold text-success">
                    ${(currentBudget?.totalLimit - Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Category Budgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetCategories.map(category => (
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
        </div>
      )}
    </div>
  );
};

export default Budgets;