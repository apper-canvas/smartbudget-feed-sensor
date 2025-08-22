import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import PieChart from "@/components/organisms/PieChart";
import LineChart from "@/components/organisms/LineChart";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import ApperIcon from "@/components/ApperIcon";

const Charts = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("current"); // current, last3, last6

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transaction data");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "current":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: "Current Month"
        };
      case "last3":
        return {
          start: startOfMonth(subMonths(now, 2)),
          end: endOfMonth(now),
          label: "Last 3 Months"
        };
      case "last6":
        return {
          start: startOfMonth(subMonths(now, 5)),
          end: endOfMonth(now),
          label: "Last 6 Months"
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: "Current Month"
        };
    }
  };

  const { start, end, label } = getDateRange();

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  // Prepare pie chart data (expenses by category)
  const expensesByCategory = {};
  filteredTransactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount
  }));

  // Prepare line chart data (monthly expenses)
  const monthlyExpenses = {};
  
  if (timeRange === "current") {
    // For current month, show daily data
    filteredTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const day = format(new Date(t.date), "MMM d");
        monthlyExpenses[day] = (monthlyExpenses[day] || 0) + t.amount;
      });
  } else {
    // For longer ranges, show monthly data
    filteredTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const month = format(new Date(t.date), "MMM yyyy");
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
      });
  }

  const lineChartData = Object.entries(monthlyExpenses)
    .map(([period, amount]) => ({
      month: period,
      amount
    }))
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTransactions} />;

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Financial Charts
          </h1>
          <p className="text-gray-600">
            Visualize your spending patterns and trends over time
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[
            { key: "current", label: "Current Month" },
            { key: "last3", label: "Last 3 Months" },
            { key: "last6", label: "Last 6 Months" }
          ].map(range => (
            <Button
              key={range.key}
              variant={timeRange === range.key ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range.key)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <Empty
          title="No data for selected period"
          description="Add some transactions to see your spending charts and trends"
          icon="BarChart3"
          actionLabel="Add Transaction"
          onAction={() => window.location.href = "/transactions"}
        />
      ) : (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-surface/80 to-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-success/10 to-green-600/10 p-3 rounded-xl border border-success/20">
                  <ApperIcon name="TrendingUp" size={24} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Income ({label})</p>
                  <p className="text-2xl font-bold text-success">${totalIncome.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-surface/80 to-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-error/10 to-red-600/10 p-3 rounded-xl border border-error/20">
                  <ApperIcon name="TrendingDown" size={24} className="text-error" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Expenses ({label})</p>
                  <p className="text-2xl font-bold text-error">${totalExpenses.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-surface/80 to-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-br p-3 rounded-xl border ${
                  totalIncome - totalExpenses >= 0 
                    ? "from-primary/10 to-blue-600/10 border-primary/20" 
                    : "from-warning/10 to-orange-600/10 border-warning/20"
                }`}>
                  <ApperIcon name="Wallet" size={24} className={
                    totalIncome - totalExpenses >= 0 ? "text-primary" : "text-warning"
                  } />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Net ({label})</p>
                  <p className={`text-2xl font-bold ${
                    totalIncome - totalExpenses >= 0 ? "text-primary" : "text-warning"
                  }`}>
                    ${(totalIncome - totalExpenses).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PieChart 
              data={pieChartData}
              title={`Spending by Category (${label})`}
            />
            <LineChart 
              data={lineChartData}
              title={`${timeRange === "current" ? "Daily" : "Monthly"} Spending Trend`}
            />
          </div>

          {/* Category Breakdown */}
          {pieChartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
                    <ApperIcon name="List" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Category Breakdown</h2>
                    <p className="text-sm text-gray-600">Detailed spending by category for {label.toLowerCase()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {pieChartData
                    .sort((a, b) => b.amount - a.amount)
                    .map((category, index) => {
                      const percentage = (category.amount / totalExpenses) * 100;
                      return (
                        <div key={category.category} className="flex items-center justify-between p-4 bg-gradient-to-r from-surface/50 to-gray-50/50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded-full" style={{ 
                              backgroundColor: ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#06B6D4'][index % 8]
                            }}></div>
                            <span className="font-medium text-gray-900">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${category.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Charts;