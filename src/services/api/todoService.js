class TodoService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'todo_item_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } },
          { 
            field: { Name: "budget_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ],
        orderBy: [
          {
            fieldName: "due_date_c",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Todo fetch failed:", response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(todo => ({
        Id: todo.Id,
        name: todo.Name || '',
        title: todo.title_c || '',
        description: todo.description_c || '',
        status: todo.status_c || 'pending',
        dueDate: todo.due_date_c,
        budget: todo.budget_c?.Name || '',
        budgetId: todo.budget_c?.Id || null,
        createdOn: todo.CreatedOn,
        modifiedOn: todo.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching todos:", error?.response?.data?.message || error?.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } },
          { 
            field: { Name: "budget_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error("Todo fetch by ID failed:", response.message);
        throw new Error(response.message);
      }

      const todo = response.data;
      return {
        Id: todo.Id,
        name: todo.Name || '',
        title: todo.title_c || '',
        description: todo.description_c || '',
        status: todo.status_c || 'pending',
        dueDate: todo.due_date_c,
        budget: todo.budget_c?.Name || '',
        budgetId: todo.budget_c?.Id || null,
        createdOn: todo.CreatedOn,
        modifiedOn: todo.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching todo with ID ${id}:`, error?.response?.data?.message || error?.message || error);
      throw error;
    }
  }

  async create(todoData) {
    try {
      // Handle budget lookup
      let budgetId = null;
      if (todoData.budgetId) {
        budgetId = parseInt(todoData.budgetId);
      }

      // Generate descriptive name for the todo
      const todoName = `${todoData.title} - ${todoData.status || 'pending'}`;

      const params = {
        records: [{
          Name: todoName,
          title_c: todoData.title,
          description_c: todoData.description || '',
          status_c: todoData.status || 'pending',
          due_date_c: todoData.dueDate,
          budget_c: budgetId
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Todo creation failed:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create todos ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          const errorMessages = failedRecords.map(record => record.message).join(', ');
          throw new Error(`Creation failed: ${errorMessages}`);
        }

        const successfulRecord = response.results[0];
        if (!successfulRecord.data) {
          throw new Error("No data returned from successful creation");
        }

        const newTodo = successfulRecord.data;
        return {
          Id: newTodo.Id,
          name: newTodo.Name || '',
          title: newTodo.title_c || '',
          description: newTodo.description_c || '',
          status: newTodo.status_c || 'pending',
          dueDate: newTodo.due_date_c,
          budget: todoData.budget || '',
          budgetId: budgetId,
          createdOn: newTodo.CreatedOn,
          modifiedOn: newTodo.ModifiedOn
        };
      }
      
      throw new Error("Unexpected response format from server");
    } catch (error) {
      console.error("Error creating todo:", error?.response?.data?.message || error?.message || error);
      throw error;
    }
  }

  async update(id, todoData) {
    try {
      if (!id || !todoData) {
        throw new Error("Missing required parameters for todo update");
      }

      // Handle budget lookup
      let budgetId = null;
      if (todoData.budgetId) {
        budgetId = parseInt(todoData.budgetId);
      }

      // Generate descriptive name for the todo
      const todoName = `${todoData.title} - ${todoData.status || 'pending'}`;

      const params = {
        records: [{
          Id: parseInt(id),
          Name: todoName,
          title_c: todoData.title,
          description_c: todoData.description || '',
          status_c: todoData.status || 'pending',
          due_date_c: todoData.dueDate,
          budget_c: budgetId
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Todo update failed:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedUpdates = response.results.filter(result => !result.success);
        if (failedUpdates.length > 0) {
          console.error(`Failed to update todos ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          const errorMessages = failedUpdates.map(record => record.message).join(', ');
          throw new Error(`Update failed: ${errorMessages}`);
        }

        const updatedRecord = response.results[0];
        if (!updatedRecord.data) {
          throw new Error("No data returned from successful update");
        }

        const updatedTodo = updatedRecord.data;
        return {
          Id: updatedTodo.Id,
          name: updatedTodo.Name || '',
          title: updatedTodo.title_c || '',
          description: updatedTodo.description_c || '',
          status: updatedTodo.status_c || 'pending',
          dueDate: updatedTodo.due_date_c,
          budget: todoData.budget || '',
          budgetId: budgetId,
          createdOn: updatedTodo.CreatedOn,
          modifiedOn: updatedTodo.ModifiedOn
        };
      }
      
      throw new Error("Unexpected response format from server");
    } catch (error) {
      console.error("Error updating todo:", error?.response?.data?.message || error?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Todo deletion failed:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete todos ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting todo:", error?.response?.data?.message || error?.message || error);
      throw error;
    }
  }

  async toggleStatus(id, currentStatus) {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      const todo = await this.getById(id);
      
      return await this.update(id, {
        ...todo,
        status: newStatus
      });
    } catch (error) {
      console.error("Error toggling todo status:", error);
      throw error;
    }
  }
}

export const todoService = new TodoService();