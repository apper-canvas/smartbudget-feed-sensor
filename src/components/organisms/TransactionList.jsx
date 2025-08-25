import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Transactions from "@/components/pages/Transactions";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const TransactionList = ({ refresh, onEdit }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [filterType, setFilterType] = useState("all");

useEffect(() => {
    loadData();
  }, [refresh, filterType]);

const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const transactionPromise = filterType === "recurring" 
        ? transactionService.getRecurringTransactions()
        : transactionService.getAll();
      
      const [transactionData, categoryData] = await Promise.all([
        transactionPromise,
        categoryService.getAll()
      ]);
      setTransactions(transactionData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setCategories(categoryData);
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.Id !== id));
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.icon || "Receipt";
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || "#6B7280";
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search transactions..."
              />
            </div>
<div className="flex gap-2">
              {["all", "income", "expense", "recurring"].map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
              <ApperIcon name="Receipt" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <p className="text-sm text-gray-600">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <Empty
              title="No transactions found"
              description="Start tracking your finances by adding your first transaction"
              icon="Receipt"
              actionLabel="Add Transaction"
              onAction={() => document.getElementById('add-transaction')?.scrollIntoView()}
            />
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.Id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-surface/50 to-gray-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                      <ApperIcon 
                        name={getCategoryIcon(transaction.category)} 
                        size={20} 
                        style={{ color: getCategoryColor(transaction.category) }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{transaction.category}</h3>
                        <Badge 
                          variant={transaction.type === "income" ? "success" : "error"}
                          size="sm"
                        >
                          {transaction.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                        {transaction.notes && ` • ${transaction.notes}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        transaction.type === "income" ? "text-success" : "text-error"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                        className="p-2"
                      >
                        <ApperIcon name="Edit2" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.Id)}
                        className="p-2 text-error hover:bg-error/10"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TransactionList;