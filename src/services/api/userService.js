class UserService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'user_profile_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "currency_c" } },
          { field: { Name: "time_zone_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(user => ({
        Id: user.Id,
        id: user.Id, // For compatibility
        name: user.Name,
        email: user.email_c,
        phone: user.phone_c,
        currency: user.currency_c,
        timeZone: user.time_zone_c,
        createdAt: user.created_at_c,
        updatedAt: user.updated_at_c
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "currency_c" } },
          { field: { Name: "time_zone_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const user = response.data;
      return {
        Id: user.Id,
        id: user.Id, // For compatibility
        name: user.Name,
        email: user.email_c,
        phone: user.phone_c,
        currency: user.currency_c,
        timeZone: user.time_zone_c,
        createdAt: user.created_at_c,
        updatedAt: user.updated_at_c
      };
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }

  async create(userData) {
    try {
      const params = {
        records: [{
          Name: userData.name,
          email_c: userData.email,
          phone_c: userData.phone,
          currency_c: userData.currency,
          time_zone_c: userData.timeZone,
          created_at_c: new Date().toISOString(),
          updated_at_c: new Date().toISOString()
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
          console.error(`Failed to create users ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message);
        }

        const successfulRecord = response.results[0];
        const newUser = successfulRecord.data;
        return {
          Id: newUser.Id,
          id: newUser.Id,
          name: newUser.Name,
          email: newUser.email_c,
          phone: newUser.phone_c,
          currency: newUser.currency_c,
          timeZone: newUser.time_zone_c,
          createdAt: newUser.created_at_c,
          updatedAt: newUser.updated_at_c
        };
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async update(id, userData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: userData.name,
          email_c: userData.email,
          phone_c: userData.phone,
          currency_c: userData.currency,
          time_zone_c: userData.timeZone,
          updated_at_c: new Date().toISOString()
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
          console.error(`Failed to update users ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message);
        }

        const updatedRecord = response.results[0];
        const updatedUser = updatedRecord.data;
        return {
          Id: updatedUser.Id,
          id: updatedUser.Id,
          name: updatedUser.Name,
          email: updatedUser.email_c,
          phone: updatedUser.phone_c,
          currency: updatedUser.currency_c,
          timeZone: updatedUser.time_zone_c,
          createdAt: updatedUser.created_at_c,
          updatedAt: updatedUser.updated_at_c
        };
      }
    } catch (error) {
      console.error("Error updating user:", error);
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
          console.error(`Failed to delete Users ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

export const userService = new UserService();