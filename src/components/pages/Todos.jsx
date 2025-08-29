import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Modal from "@/components/atoms/Modal";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { todoService } from "@/services/api/todoService";
import { budgetService } from "@/services/api/budgetService";
import ApperIcon from "@/components/ApperIcon";

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    dueDate: "",
    budgetId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [todosData, budgetsData] = await Promise.all([
        todoService.getAll(),
        budgetService.getAll()
      ]);
      
      setTodos(todosData || []);
      setBudgets(budgetsData || []);
    } catch (err) {
      setError("Failed to load todos");
      console.error("Error loading todos:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "pending",
      dueDate: "",
      budgetId: ""
    });
    setEditingTodo(null);
    setShowForm(false);
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      status: todo.status,
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
      budgetId: todo.budgetId ? todo.budgetId.toString() : ""
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a todo title");
      return;
    }

    try {
      setIsSubmitting(true);
      const todoData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        dueDate: formData.dueDate || null,
        budgetId: formData.budgetId || null,
        budget: formData.budgetId ? budgets.find(b => b.Id.toString() === formData.budgetId)?.name : ''
      };

      if (editingTodo) {
        await todoService.update(editingTodo.Id, todoData);
        toast.success(`✅ Todo "${todoData.title}" updated successfully!`);
      } else {
        await todoService.create(todoData);
        toast.success(`✅ New todo "${todoData.title}" created successfully!`);
      }

      resetForm();
      loadData();
    } catch (error) {
      toast.error("Failed to save todo");
      console.error("Error saving todo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const todoToDelete = todos.find(t => t.Id === id);
    if (!confirm(`Are you sure you want to delete "${todoToDelete?.title}"?`)) return;

    try {
      await todoService.delete(id);
      setTodos(prev => prev.filter(t => t.Id !== id));
      toast.success(`🗑️ Todo "${todoToDelete?.title}" deleted successfully!`);
    } catch (error) {
      toast.error("Failed to delete todo");
      console.error("Error deleting todo:", error);
    }
  };

  const handleStatusToggle = async (todo) => {
    try {
      const updatedTodo = await todoService.toggleStatus(todo.Id, todo.status);
      setTodos(prev => prev.map(t => 
        t.Id === todo.Id ? { ...t, status: updatedTodo.status } : t
      ));
      toast.success(`✅ Todo marked as ${updatedTodo.status}!`);
    } catch (error) {
      toast.error("Failed to update todo status");
      console.error("Error toggling status:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Filter todos based on search and status
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (todo.budget && todo.budget.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || todo.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Separate todos by status for better organization
  const pendingTodos = filteredTodos.filter(t => t.status === 'pending');
  const completedTodos = filteredTodos.filter(t => t.status === 'completed');

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Todo Items
          </h1>
          <p className="text-gray-600">
            Track your budget-related tasks and stay organized
          </p>
        </div>
        
        <Button
          variant="secondary"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Todo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search todos..."
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "completed"].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={`capitalize transition-all duration-200 ${
                    filterStatus === status 
                      ? "bg-primary text-white shadow-md" 
                      : "hover:bg-gray-100 hover:shadow-sm"
                  }`}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Todo Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingTodo ? "Edit Todo" : "Create New Todo"}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-secondary/10 to-purple-600/10 p-3 rounded-xl border border-secondary/20">
              <ApperIcon name="List" size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {editingTodo ? "Update your todo details" : "Create a new task to track"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Title"
              placeholder="e.g., Review monthly budget, Pay credit card"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Add more details about this task..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "completed", label: "Completed" }
                ]}
              />

              <Input
                type="date"
                label="Due Date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <Select
              label="Associated Budget"
              value={formData.budgetId}
              onChange={(e) => handleInputChange("budgetId", e.target.value)}
              options={[
                { value: "", label: "No budget association" },
                ...budgets.map(budget => ({
                  value: budget.Id.toString(),
                  label: `${budget.name} (${budget.month})`
                }))
              ]}
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
                    {editingTodo ? "Update Todo" : "Create Todo"}
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

      {/* Todos List */}
      {filteredTodos.length === 0 ? (
        <Empty
          title="No todos found"
          description="Create your first todo to start tracking your budget-related tasks"
          icon="List"
          actionLabel="Create Todo"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* Pending Todos */}
          {pendingTodos.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-warning/10 to-orange-600/10 p-3 rounded-xl border border-warning/20">
                    <ApperIcon name="Clock" size={20} className="text-warning" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Pending Tasks</h2>
                    <p className="text-sm text-gray-600">
                      {pendingTodos.length} task{pendingTodos.length !== 1 ? 's' : ''} to complete
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {pendingTodos.map((todo) => (
                    <div
                      key={todo.Id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-surface/50 to-gray-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleStatusToggle(todo)}
                          className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded hover:border-success transition-colors"
                          title="Mark as completed"
                        >
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{todo.title}</h3>
                            <Badge variant="warning" size="sm">
                              Pending
                            </Badge>
                            {todo.budget && (
                              <Badge variant="info" size="sm">
                                {todo.budget}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {todo.description && `${todo.description} • `}
                            {todo.dueDate && `Due: ${format(new Date(todo.dueDate), "MMM d, yyyy")}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(todo)}
                          className="p-2"
                        >
                          <ApperIcon name="Edit2" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(todo.Id)}
                          className="p-2 text-error hover:bg-error/10"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Completed Todos */}
          {completedTodos.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-success/10 to-green-600/10 p-3 rounded-xl border border-success/20">
                    <ApperIcon name="CheckCircle" size={20} className="text-success" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Completed Tasks</h2>
                    <p className="text-sm text-gray-600">
                      {completedTodos.length} task{completedTodos.length !== 1 ? 's' : ''} completed
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {completedTodos.map((todo) => (
                    <div
                      key={todo.Id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-surface/50 to-gray-50/50 rounded-xl border border-gray-100 opacity-75"
                    >
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleStatusToggle(todo)}
                          className="flex-shrink-0 w-5 h-5 bg-success border-2 border-success rounded flex items-center justify-center text-white"
                          title="Mark as pending"
                        >
                          <ApperIcon name="Check" size={12} />
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-600 line-through">{todo.title}</h3>
                            <Badge variant="success" size="sm">
                              Completed
                            </Badge>
                            {todo.budget && (
                              <Badge variant="info" size="sm">
                                {todo.budget}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {todo.description && `${todo.description} • `}
                            {todo.dueDate && `Due: ${format(new Date(todo.dueDate), "MMM d, yyyy")}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(todo)}
                          className="p-2"
                        >
                          <ApperIcon name="Edit2" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(todo.Id)}
                          className="p-2 text-error hover:bg-error/10"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Todos;