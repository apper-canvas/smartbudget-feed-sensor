class TransactionService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'transaction_c';
  }

async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { 
            field: { Name: "category_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(transaction => ({
        Id: transaction.Id,
        amount: transaction.amount_c || 0,
        type: transaction.type_c,
        category: transaction.category_c?.Name || transaction.category_c || '',
        date: transaction.date_c,
        notes: transaction.notes_c,
        createdAt: transaction.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  async getRecurringTransactions() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { 
            field: { Name: "category_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "category_c",
                    operator: "Contains",
                    subOperator: "",
                    values: ["Transportation"]
                  }
                ],
                operator: "OR"
              },
              {
                conditions: [
                  {
                    fieldName: "category_c",
                    operator: "Contains",
                    subOperator: "",
                    values: ["Bills"]
                  }
                ],
                operator: "OR"
              },
              {
                conditions: [
                  {
                    fieldName: "category_c",
                    operator: "Contains",
                    subOperator: "",
                    values: ["Utilities"]
                  }
                ],
                operator: "OR"
              }
            ]
          }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(transaction => ({
        Id: transaction.Id,
        amount: transaction.amount_c || 0,
        type: transaction.type_c,
        category: transaction.category_c?.Name || transaction.category_c || '',
        date: transaction.date_c,
        notes: transaction.notes_c,
        createdAt: transaction.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { 
            field: { Name: "category_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const transaction = response.data;
      return {
        Id: transaction.Id,
        amount: transaction.amount_c || 0,
        type: transaction.type_c,
        category: transaction.category_c?.Name || transaction.category_c || '',
        date: transaction.date_c,
        notes: transaction.notes_c,
        createdAt: transaction.created_at_c
      };
    } catch (error) {
      console.error(`Error fetching transaction with ID ${id}:`, error);
      throw error;
    }
  }

  async create(transactionData) {
    try {
      // Find category ID by name for lookup field
      let categoryId = null;
      if (transactionData.category) {
        const categoryResponse = await this.apperClient.fetchRecords('category_c', {
          fields: [{ field: { Name: "Name" } }],
          where: [
            {
              FieldName: "Name",
              Operator: "EqualTo",
              Values: [transactionData.category]
            }
          ]
        });
        
        if (categoryResponse.success && categoryResponse.data.length > 0) {
          categoryId = categoryResponse.data[0].Id;
        }
      }

      const params = {
        records: [{
          Name: `${transactionData.type} - ${transactionData.category} - $${transactionData.amount}`,
          amount_c: transactionData.amount,
          type_c: transactionData.type,
          category_c: categoryId,
          date_c: transactionData.date,
          notes_c: transactionData.notes,
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
          console.error(`Failed to create transactions ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message);
        }

        const successfulRecord = response.results[0];
        const newTransaction = successfulRecord.data;
        return {
          Id: newTransaction.Id,
          amount: newTransaction.amount_c || 0,
          type: newTransaction.type_c,
          category: transactionData.category,
          date: newTransaction.date_c,
          notes: newTransaction.notes_c,
          createdAt: newTransaction.created_at_c
        };
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async update(id, transactionData) {
    try {
      // Find category ID by name for lookup field
      let categoryId = null;
      if (transactionData.category) {
        const categoryResponse = await this.apperClient.fetchRecords('category_c', {
          fields: [{ field: { Name: "Name" } }],
          where: [
            {
              FieldName: "Name",
              Operator: "EqualTo",
              Values: [transactionData.category]
            }
          ]
        });
        
        if (categoryResponse.success && categoryResponse.data.length > 0) {
          categoryId = categoryResponse.data[0].Id;
        }
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: `${transactionData.type} - ${transactionData.category} - $${transactionData.amount}`,
          amount_c: transactionData.amount,
          type_c: transactionData.type,
          category_c: categoryId,
          date_c: transactionData.date,
          notes_c: transactionData.notes
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
          console.error(`Failed to update transactions ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message);
        }

        const updatedRecord = response.results[0];
        const updatedTransaction = updatedRecord.data;
        return {
          Id: updatedTransaction.Id,
          amount: updatedTransaction.amount_c || 0,
          type: updatedTransaction.type_c,
          category: transactionData.category,
          date: updatedTransaction.date_c,
          notes: updatedTransaction.notes_c,
          createdAt: updatedTransaction.created_at_c
        };
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
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
          console.error(`Failed to delete Transactions ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }

  async getAllForExport() {
    // Return all data for backup operations
    return await this.getAll();
  }
}

export const transactionService = new TransactionService();