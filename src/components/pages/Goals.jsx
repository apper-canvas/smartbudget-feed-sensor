import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Modal from "@/components/atoms/Modal";
import GoalCard from "@/components/organisms/GoalCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { goalService } from "@/services/api/goalService";
import ApperIcon from "@/components/ApperIcon";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: ""
  });
  const [addAmount, setAddAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await goalService.getAll();
      setGoals(data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)));
    } catch (err) {
      setError("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      deadline: ""
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: new Date(goal.deadline).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const goalData = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        deadline: new Date(formData.deadline).toISOString()
      };

      if (editingGoal) {
        await goalService.update(editingGoal.Id, goalData);
        toast.success("Goal updated successfully!");
      } else {
        await goalService.create(goalData);
        toast.success("Goal created successfully!");
      }

      resetForm();
      loadGoals();
    } catch (error) {
      toast.error("Failed to save goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      await goalService.delete(id);
      setGoals(prev => prev.filter(g => g.Id !== id));
      toast.success("Goal deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  const handleAddMoney = (goal) => {
    setSelectedGoal(goal);
    setAddAmount("");
    setShowAddMoney(true);
  };

  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedGoal = {
        ...selectedGoal,
        currentAmount: selectedGoal.currentAmount + amount
      };

      await goalService.update(selectedGoal.Id, updatedGoal);
      
      setGoals(prev => prev.map(g => 
        g.Id === selectedGoal.Id ? { ...g, currentAmount: updatedGoal.currentAmount } : g
      ));
      
      setShowAddMoney(false);
      setSelectedGoal(null);
      setAddAmount("");
      toast.success(`Added $${amount.toFixed(2)} to ${selectedGoal.name}!`);
    } catch (error) {
      toast.error("Failed to add money");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadGoals} />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Savings Goals
          </h1>
          <p className="text-gray-600">
            Set and track your financial goals to build a better future
          </p>
        </div>
        
<Button
          variant="secondary"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Target" size={16} />
          Add Goal
        </Button>
      </div>

{/* Goal Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingGoal ? "Edit Goal" : "Create New Goal"}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-secondary/10 to-purple-600/10 p-3 rounded-xl border border-secondary/20">
              <ApperIcon name="Target" size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {editingGoal ? "Update your goal details" : "Set a new savings target"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Goal Name"
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Target Amount"
                placeholder="0.00"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                min="0"
                step="0.01"
                required
              />

              <Input
                type="number"
                label="Current Amount"
                placeholder="0.00"
                value={formData.currentAmount}
                onChange={(e) => handleInputChange("currentAmount", e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <Input
              type="date"
              label="Target Date"
              value={formData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="secondary"
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
                    {editingGoal ? "Update Goal" : "Create Goal"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-success/10 to-green-600/10 p-3 rounded-xl border border-success/20">
                  <ApperIcon name="Plus" size={20} className="text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Money</h2>
                  <p className="text-sm text-gray-600">Add money to {selectedGoal?.name}</p>
                </div>
              </div>

              <form onSubmit={handleAddMoneySubmit} className="space-y-6">
                <Input
                  type="number"
                  label="Amount to Add"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  autoFocus
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="success"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Plus" size={16} />
                        Add Money
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddMoney(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Empty
          title="No savings goals yet"
          description="Create your first savings goal and start building towards your financial future"
          icon="Target"
          actionLabel="Create Goal"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard
              key={goal.Id}
              goal={goal}
              onAddMoney={handleAddMoney}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;