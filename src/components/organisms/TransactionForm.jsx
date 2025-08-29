import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const TransactionForm = ({ onTransactionAdded, editTransaction, onEditComplete, onCancel }) => {
const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    title: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    isRecurring: false,
    recurrencePattern: ""
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
        title: editTransaction.title_c || "",
        date: new Date(editTransaction.date).toISOString().split('T')[0],
        notes: editTransaction.notes || "",
        isRecurring: editTransaction.isRecurring || false,
        recurrencePattern: editTransaction.recurrencePattern || ""
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
    
    // Enhanced validation with better user feedback
if (!formData.amount || !formData.category || !formData.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    
    // Enhanced amount validation
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount greater than zero");
      return;
    }

    if (amount > 999999) {
      toast.warn("⚠️ Large transaction amount detected - please verify this is correct");
    }

    // Category validation
    if (!formData.category.trim()) {
      toast.error("Please select a category for this transaction");
      return;
    }

    // Recurring transaction validation
    if (formData.isRecurring && !formData.recurrencePattern.trim()) {
      toast.error("Please specify a recurrence pattern for recurring transactions");
      return;
    }
    try {
      setIsSubmitting(true);
const transactionData = {
        ...formData,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        title_c: formData.title.trim(),
        date: new Date(formData.date).toISOString(),
        notes: formData.notes.trim(),
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern.trim() : ""
      };
      if (editTransaction) {
await transactionService.update(editTransaction.Id, transactionData);
        const typeIcon = formData.type === 'income' ? '💰' : '💳';
        const recurringIcon = formData.isRecurring ? '🔄' : '';
        toast.success(`${typeIcon}${recurringIcon} ${formData.isRecurring ? 'Recurring ' : ''}Transaction updated successfully! ${formData.type === 'income' ? '+' : '-'}$${amount.toFixed(2)}`);
        onEditComplete();
      } else {
        await transactionService.create(transactionData);
        const icon = formData.type === 'income' ? '📈' : '💸';
        const recurringIcon = formData.isRecurring ? '🔄' : '';
        const message = `${icon}${recurringIcon} ${formData.isRecurring ? 'Recurring ' : ''}${formData.type === 'income' ? 'Income' : 'Expense'} of $${amount.toFixed(2)} recorded in ${formData.category}!`;
        toast.success(message);
        
        // Reset form for new entries
setFormData({
          amount: "",
          type: "expense",
          category: "",
          title: "",
          date: new Date().toISOString().split('T')[0],
          notes: "",
          isRecurring: false,
          recurrencePattern: ""
        });
      }
      
      onTransactionAdded();
    } catch (error) {
      const errorMessage = error.message || "Failed to save transaction";
      toast.error(`❌ ${errorMessage}`);
      console.error("Transaction save error:", error);
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
        title: "",
        date: new Date().toISOString().split('T')[0],
        notes: "",
        isRecurring: false,
        recurrencePattern: ""
      });
      // Close modal using dedicated cancel handler
      if (onCancel) {
        onCancel();
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

            <Input
              type="text"
              label="Title"
              placeholder="Transaction title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Recurring Transaction Fields */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ApperIcon name="Repeat" size={16} className="text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Recurring Transaction</h3>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange("isRecurring", e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                Make this a recurring transaction
              </label>
            </div>

            {formData.isRecurring && (
              <Input
                type="text"
                label="Recurrence Pattern"
                placeholder="e.g., Weekly, Monthly, Every 2 weeks, etc."
                value={formData.recurrencePattern}
                onChange={(e) => handleInputChange("recurrencePattern", e.target.value)}
                required={formData.isRecurring}
              />
            )}
          </div>
<div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
disabled={isSubmitting || !formData.amount || !formData.category || !formData.title}
              className="flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  <span>{editTransaction ? "Updating..." : "Adding..."}</span>
                </>
              ) : (
                <>
                  <ApperIcon 
                    name={editTransaction ? "Save" : "Plus"} 
size={16} 
                    className={`${!formData.amount || !formData.category || !formData.title ? 'opacity-50' : ''}`}
                  />
                  <span>{editTransaction ? "Update Transaction" : "Add Transaction"}</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ApperIcon name="X" size={16} />
              <span>Cancel</span>
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default TransactionForm;