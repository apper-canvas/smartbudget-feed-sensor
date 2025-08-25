class CategoryService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'category_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "type_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(category => ({
        Id: category.Id,
        name: category.Name,
        icon: category.icon_c,
        color: category.color_c,
        type: category.type_c
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "type_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const category = response.data;
      return {
        Id: category.Id,
        name: category.Name,
        icon: category.icon_c,
        color: category.color_c,
        type: category.type_c
      };
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  }

  async create(categoryData) {
    try {
      const params = {
        records: [{
          Name: categoryData.name,
          icon_c: categoryData.icon,
          color_c: categoryData.color,
          type_c: categoryData.type
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
          console.error(`Failed to create categories ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message);
        }

        const successfulRecord = response.results[0];
        const newCategory = successfulRecord.data;
        return {
          Id: newCategory.Id,
          name: newCategory.Name,
          icon: newCategory.icon_c,
          color: newCategory.color_c,
          type: newCategory.type_c
        };
      }
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async update(id, categoryData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: categoryData.name,
          icon_c: categoryData.icon,
          color_c: categoryData.color,
          type_c: categoryData.type
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
          console.error(`Failed to update categories ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message);
        }

        const updatedRecord = response.results[0];
        const updatedCategory = updatedRecord.data;
        return {
          Id: updatedCategory.Id,
          name: updatedCategory.Name,
          icon: updatedCategory.icon_c,
          color: updatedCategory.color_c,
          type: updatedCategory.type_c
        };
      }
    } catch (error) {
      console.error("Error updating category:", error);
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
          console.error(`Failed to delete Categories ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();