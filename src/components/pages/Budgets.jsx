import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Modal from "@/components/atoms/Modal";
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
  const [showModal, setShowModal] = useState(false);
const [categoryLimits, setCategoryLimits] = useState({});
  const [totalLimit, setTotalLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetPeriod, setBudgetPeriod] = useState("monthly");
  const [alertsShown, setAlertsShown] = useState(new Set());
const currentMonth = format(new Date(), "yyyy-MM");
  const currentWeek = format(new Date(), "yyyy-'W'ww");

  useEffect(() => {
    loadData();
  }, []);

  // Budget alerts effect - separate from render to prevent setState during render
  useEffect(() => {
    if (budgets.length === 0 || transactions.length === 0) return;

    const currentPeriodKey = budgetPeriod === "monthly" ? currentMonth : currentWeek;
    const currentBudget = budgets.find(b => b.period === currentPeriodKey && b.type === budgetPeriod);
    
    if (!currentBudget) return;

    const getPeriodDates = () => {
      const now = new Date();
      if (budgetPeriod === "monthly") {
        return { start: startOfMonth(now), end: endOfMonth(now) };
      } else {
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return { start: monday, end: sunday };
      }
    };

    const { start: periodStart, end: periodEnd } = getPeriodDates();
    
    const currentPeriodExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === "expense" && transactionDate >= periodStart && transactionDate <= periodEnd;
    });

    const spendingByCategory = {};
    currentPeriodExpenses.forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    });

    // Check for budget alerts
    Object.keys(currentBudget.categoryLimits).forEach(category => {
      const spent = spendingByCategory[category] || 0;
      const limit = currentBudget.categoryLimits[category];
      const percentage = (spent / limit) * 100;
      
      const alertKey = `${currentPeriodKey}-${category}`;
      
      // Enhanced alert logic with more specific messaging
      if (percentage >= 90 && percentage < 100 && !alertsShown.has(`${alertKey}-90`)) {
        toast.warn(`⚠️ Budget Alert: You've spent ${percentage.toFixed(0)}% of your ${category} budget ($${spent.toFixed(2)} of $${limit.toFixed(2)})`, {
          toastId: `alert-${category}-90`,
          autoClose: 5000
        });
        setAlertsShown(prev => new Set([...prev, `${alertKey}-90`]));
      } else if (percentage >= 100 && percentage < 125 && !alertsShown.has(`${alertKey}-100`)) {
        toast.error(`🚨 Budget Exceeded: ${category} is at ${percentage.toFixed(0)}% ($${(spent - limit).toFixed(2)} over budget)`, {
          toastId: `alert-${category}-100`,
          autoClose: 7000
        });
        setAlertsShown(prev => new Set([...prev, `${alertKey}-100`]));
      } else if (percentage >= 125 && !alertsShown.has(`${alertKey}-125`)) {
        toast.error(`🚨 Serious Overspend: ${category} is ${percentage.toFixed(0)}% over budget! Consider adjusting spending.`, {
          toastId: `alert-${category}-125`,
          autoClose: 10000
        });
        setAlertsShown(prev => new Set([...prev, `${alertKey}-125`]));
      }
    });
  }, [budgets, transactions, budgetPeriod, currentMonth, currentWeek]);

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

      // Load current period budget if exists
      const currentPeriodKey = budgetPeriod === "monthly" ? currentMonth : currentWeek;
      const currentBudget = budgetData.find(b => b.period === currentPeriodKey && b.type === budgetPeriod);
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
      
      const currentPeriodKey = budgetPeriod === "monthly" ? currentMonth : currentWeek;
      const budgetData = {
        period: currentPeriodKey,
        type: budgetPeriod,
        totalLimit: parseFloat(totalLimit),
        categoryLimits
      };
const existingBudget = budgets.find(b => b.period === currentPeriodKey && b.type === budgetPeriod);
      if (existingBudget) {
        await budgetService.update(existingBudget.Id, budgetData);
        toast.success(`📊 ${budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1)} budget updated! Total: $${parseFloat(totalLimit).toFixed(2)}`);
      } else {
        await budgetService.create(budgetData);
        toast.success(`📊 ${budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1)} budget created! Stay within $${parseFloat(totalLimit).toFixed(2)}`);
      }
setShowModal(false);
      loadData();
    } catch (error) {
      toast.error("Failed to save budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

const currentPeriodKey = budgetPeriod === "monthly" ? currentMonth : currentWeek;
  const currentBudget = budgets.find(b => b.period === currentPeriodKey && b.type === budgetPeriod);
  
  // Calculate spending by category for current period
  const getPeriodDates = () => {
    const now = new Date();
    if (budgetPeriod === "monthly") {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    } else {
      // Weekly: Monday to Sunday
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { start: monday, end: sunday };
    }
  };

  const { start: periodStart, end: periodEnd } = getPeriodDates();
  
  const currentPeriodExpenses = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return t.type === "expense" && transactionDate >= periodStart && transactionDate <= periodEnd;
  });

  const spendingByCategory = {};
  currentPeriodExpenses.forEach(t => {
    spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
  });

const budgetCategories = currentBudget ? Object.keys(currentBudget.categoryLimits).map(category => {
    const spent = spendingByCategory[category] || 0;
    const limit = currentBudget.categoryLimits[category];
    const percentage = (spent / limit) * 100;
    
    return {
      category,
      spent,
      limit,
      percentage,
      icon: categories.find(c => c.name === category)?.icon || "ShoppingBag",
      color: categories.find(c => c.name === category)?.color || "#6B7280"
    };
  }) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Monthly Budgets
</h1>
          <p className="text-gray-600">
            Set spending limits and track your progress for {budgetPeriod === "monthly" ? format(new Date(), "MMMM yyyy") : `Week ${format(new Date(), "ww, yyyy")}`}
          </p>
        </div>
<Button
variant="primary"
onClick={() => setShowModal(true)}
className="flex items-center gap-2"
>
<ApperIcon name="Plus" size={16} />
{currentBudget ? "Edit Budget" : "Add Budget"}
</Button>
</div>
<Modal 
isOpen={showModal} 
onClose={() => setShowModal(false)}
title={currentBudget ? "Edit Budget" : `Create ${budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1)} Budget`}
size="lg"
>
<div className="p-6">
<div className="flex items-center space-x-3 mb-6">
<div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
<ApperIcon name="PiggyBank" size={20} className="text-primary" />
</div>
<div>
<p className="text-sm text-gray-600">
Set your spending limits for {budgetPeriod === "monthly" ? format(new Date(), "MMMM yyyy") : `Week ${format(new Date(), "ww, yyyy")}`}
</p>
</div>
</div>

{/* Budget Period Selector */}
<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">Budget Period</label>
<div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
<Button
variant={budgetPeriod === "monthly" ? "primary" : "ghost"}
size="sm"
onClick={() => setBudgetPeriod("monthly")}
className="flex-1"
>
<ApperIcon name="Calendar" size={16} />
Monthly
</Button>
<Button
variant={budgetPeriod === "weekly" ? "primary" : "ghost"}
size="sm"
onClick={() => setBudgetPeriod("weekly")}
className="flex-1"
>
<ApperIcon name="CalendarDays" size={16} />
Weekly
</Button>
</div>
</div>

<form onSubmit={handleSubmit} className="space-y-6">
<Input
type="number"
label={`Total ${budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1)} Budget`}
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
onClick={() => setShowModal(false)}
disabled={isSubmitting}
>
Cancel
</Button>
</div>
</form>
</div>
</Modal>

      {budgetCategories.length === 0 ? (
<Empty
          title={`No budget set for this ${budgetPeriod}`}
          description={`Create your ${budgetPeriod} budget to start tracking your spending limits`}
          icon="PiggyBank"
          actionLabel="Create Budget"
          onAction={() => setShowModal(true)}
        />
      ) : (
<div className="space-y-6">
          {/* Period Selector */}
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <Button
                variant={budgetPeriod === "monthly" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setBudgetPeriod("monthly")}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Calendar" size={16} />
                Monthly View
              </Button>
              <Button
                variant={budgetPeriod === "weekly" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setBudgetPeriod("weekly")}
                className="flex items-center gap-2"
              >
                <ApperIcon name="CalendarDays" size={16} />
                Weekly View
              </Button>
            </div>
          </div>

          {/* Budget Overview */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Budget Overview</h2>
                {budgetCategories.some(cat => cat.percentage >= 90) && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 border border-warning/20 rounded-full">
                    <ApperIcon name="AlertTriangle" size={16} className="text-warning" />
                    <span className="text-sm text-warning font-medium">Budget Alerts</span>
                  </div>
                )}
              </div>
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
                period={budgetPeriod}
                showAlert={category.percentage >= 75}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;