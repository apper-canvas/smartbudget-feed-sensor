import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const TransactionForm = ({ onTransactionAdded, editTransaction, onEditComplete }) => {
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (editTransaction) {
      setFormData({
        amount: editTransaction.amount.toString(),
        type: editTransaction.type,
        category: editTransaction.category,
        date: new Date(editTransaction.date).toISOString().split('T')[0],
        notes: editTransaction.notes || ""
      });
    }
  }, [editTransaction]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      if (editTransaction) {
        await transactionService.update(editTransaction.Id, transactionData);
        toast.success("Transaction updated successfully!");
        onEditComplete();
      } else {
        await transactionService.create(transactionData);
        toast.success("Transaction added successfully!");
        setFormData({
          amount: "",
          type: "expense",
          category: "",
          date: new Date().toISOString().split('T')[0],
          notes: ""
        });
      }
      
      onTransactionAdded();
    } catch (error) {
      toast.error("Failed to save transaction");
} finally {
      setIsSubmitting(false);
    }
  };

const handleCancel = () => {
    if (editTransaction) {
      onEditComplete();
    } else {
      // Reset form to initial state
      setFormData({
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split('T')[0],
        notes: ""
      });
      // Close modal if in modal context
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
            <ApperIcon name={editTransaction ? "Edit3" : "Plus"} size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <p className="text-sm text-gray-600">
              {editTransaction ? "Update transaction details" : "Record a new income or expense"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange("type", "expense")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                formData.type === "expense"
                  ? "border-error bg-gradient-to-r from-error/10 to-red-600/10 text-error"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ApperIcon name="TrendingDown" size={20} />
                <span className="font-medium">Expense</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange("type", "income")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                formData.type === "income"
                  ? "border-success bg-gradient-to-r from-success/10 to-green-600/10 text-success"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ApperIcon name="TrendingUp" size={20} />
                <span className="font-medium">Income</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Amount"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              min="0"
              step="0.01"
              required
            />

            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select category</option>
              {filteredCategories.map(category => (
                <option key={category.Id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <Input
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            required
          />

          <Input
            type="text"
            label="Notes (Optional)"
            placeholder="Add a note..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
          />

<div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  {editTransaction ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <ApperIcon name={editTransaction ? "Save" : "Plus"} size={16} />
                  {editTransaction ? "Update Transaction" : "Add Transaction"}
                </>
              )}
            </Button>

<Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2 hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
            >
              <ApperIcon name="X" size={16} />
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default TransactionForm;