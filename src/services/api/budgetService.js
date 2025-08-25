class BudgetService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'budget_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "period_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "total_limit_c" } },
          { field: { Name: "category_limits_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(budget => ({
        Id: budget.Id,
        period: budget.period_c,
        month: budget.period_c, // For compatibility with existing code
        type: budget.type_c,
        totalLimit: budget.total_limit_c || 0,
        categoryLimits: budget.category_limits_c ? JSON.parse(budget.category_limits_c) : {}
      }));
    } catch (error) {
      console.error("Error fetching budgets:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "period_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "total_limit_c" } },
          { field: { Name: "category_limits_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const budget = response.data;
      return {
        Id: budget.Id,
        period: budget.period_c,
        month: budget.period_c, // For compatibility
        type: budget.type_c,
        totalLimit: budget.total_limit_c || 0,
        categoryLimits: budget.category_limits_c ? JSON.parse(budget.category_limits_c) : {}
      };
    } catch (error) {
      console.error(`Error fetching budget with ID ${id}:`, error);
      throw error;
    }
  }

  async create(budgetData) {
    try {
      const params = {
        records: [{
          Name: `${budgetData.type} Budget - ${budgetData.period}`,
          period_c: budgetData.period,
          type_c: budgetData.type,
          total_limit_c: budgetData.totalLimit,
          category_limits_c: JSON.stringify(budgetData.categoryLimits || {})
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create budgets ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message);
        }

        const successfulRecord = response.results[0];
        const newBudget = successfulRecord.data;
        return {
          Id: newBudget.Id,
          period: newBudget.period_c,
          month: newBudget.period_c,
          type: newBudget.type_c,
          totalLimit: newBudget.total_limit_c || 0,
          categoryLimits: newBudget.category_limits_c ? JSON.parse(newBudget.category_limits_c) : {}
        };
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      throw error;
    }
  }

  async update(id, budgetData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `${budgetData.type} Budget - ${budgetData.period}`,
          period_c: budgetData.period,
          type_c: budgetData.type,
          total_limit_c: budgetData.totalLimit,
          category_limits_c: JSON.stringify(budgetData.categoryLimits || {})
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedUpdates = response.results.filter(result => !result.success);
        if (failedUpdates.length > 0) {
          console.error(`Failed to update budgets ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message);
        }

        const updatedRecord = response.results[0];
        const updatedBudget = updatedRecord.data;
        return {
          Id: updatedBudget.Id,
          period: updatedBudget.period_c,
          month: updatedBudget.period_c,
          type: updatedBudget.type_c,
          totalLimit: updatedBudget.total_limit_c || 0,
          categoryLimits: updatedBudget.category_limits_c ? JSON.parse(updatedBudget.category_limits_c) : {}
        };
      }
    } catch (error) {
      console.error("Error updating budget:", error);
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
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete Budgets ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting budget:", error);
      throw error;
    }
  }
}

export const budgetService = new BudgetService();