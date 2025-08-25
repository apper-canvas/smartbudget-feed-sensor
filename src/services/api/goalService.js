class GoalService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'goal_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(goal => ({
        Id: goal.Id,
        name: goal.Name,
        targetAmount: goal.target_amount_c || 0,
        currentAmount: goal.current_amount_c || 0,
        deadline: goal.deadline_c,
        createdAt: goal.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching goals:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const goal = response.data;
      return {
        Id: goal.Id,
        name: goal.Name,
        targetAmount: goal.target_amount_c || 0,
        currentAmount: goal.current_amount_c || 0,
        deadline: goal.deadline_c,
        createdAt: goal.created_at_c
      };
    } catch (error) {
      console.error(`Error fetching goal with ID ${id}:`, error);
      throw error;
    }
  }

  async create(goalData) {
    try {
      const params = {
        records: [{
          Name: goalData.name,
          target_amount_c: goalData.targetAmount,
          current_amount_c: goalData.currentAmount || 0,
          deadline_c: goalData.deadline,
          created_at_c: new Date().toISOString()
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
          console.error(`Failed to create goals ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message);
        }

        const successfulRecord = response.results[0];
        const newGoal = successfulRecord.data;
        return {
          Id: newGoal.Id,
          name: newGoal.Name,
          targetAmount: newGoal.target_amount_c || 0,
          currentAmount: newGoal.current_amount_c || 0,
          deadline: newGoal.deadline_c,
          createdAt: newGoal.created_at_c
        };
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  }

  async update(id, goalData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: goalData.name,
          target_amount_c: goalData.targetAmount,
          current_amount_c: goalData.currentAmount,
          deadline_c: goalData.deadline
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
          console.error(`Failed to update goals ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message);
        }

        const updatedRecord = response.results[0];
        const updatedGoal = updatedRecord.data;
        return {
          Id: updatedGoal.Id,
          name: updatedGoal.Name,
          targetAmount: updatedGoal.target_amount_c || 0,
          currentAmount: updatedGoal.current_amount_c || 0,
          deadline: updatedGoal.deadline_c,
          createdAt: updatedGoal.created_at_c
        };
      }
    } catch (error) {
      console.error("Error updating goal:", error);
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
          console.error(`Failed to delete Goals ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
  }
}

export const goalService = new GoalService();