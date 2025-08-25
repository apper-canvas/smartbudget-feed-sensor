class AccountService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'account_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type_c" } },
          { field: { Name: "balance_c" } },
          { field: { Name: "account_number_c" } },
          { field: { Name: "bank_name_c" } },
          { field: { Name: "is_linked_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "icon_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(account => ({
        Id: account.Id,
        name: account.Name,
        type: account.type_c,
        balance: account.balance_c || 0,
        accountNumber: account.account_number_c,
        bankName: account.bank_name_c,
        isLinked: account.is_linked_c || false,
        color: account.color_c,
        icon: account.icon_c
      }));
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type_c" } },
          { field: { Name: "balance_c" } },
          { field: { Name: "account_number_c" } },
          { field: { Name: "bank_name_c" } },
          { field: { Name: "is_linked_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "icon_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const account = response.data;
      return {
        Id: account.Id,
        name: account.Name,
        type: account.type_c,
        balance: account.balance_c || 0,
        accountNumber: account.account_number_c,
        bankName: account.bank_name_c,
        isLinked: account.is_linked_c || false,
        color: account.color_c,
        icon: account.icon_c
      };
    } catch (error) {
      console.error(`Error fetching account with ID ${id}:`, error);
      throw error;
    }
  }

  async create(accountData) {
    try {
      const params = {
        records: [{
          Name: accountData.name,
          type_c: accountData.type,
          balance_c: accountData.balance,
          account_number_c: accountData.accountNumber,
          bank_name_c: accountData.bankName,
          is_linked_c: accountData.isLinked || false,
          color_c: accountData.color,
          icon_c: accountData.icon
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
          console.error(`Failed to create accounts ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message);
        }

        const successfulRecord = response.results[0];
        const newAccount = successfulRecord.data;
        return {
          Id: newAccount.Id,
          name: newAccount.Name,
          type: newAccount.type_c,
          balance: newAccount.balance_c || 0,
          accountNumber: newAccount.account_number_c,
          bankName: newAccount.bank_name_c,
          isLinked: newAccount.is_linked_c || false,
          color: newAccount.color_c,
          icon: newAccount.icon_c
        };
      }
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  }

  async update(id, accountData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: accountData.name,
          type_c: accountData.type,
          balance_c: accountData.balance,
          account_number_c: accountData.accountNumber,
          bank_name_c: accountData.bankName,
          is_linked_c: accountData.isLinked,
          color_c: accountData.color,
          icon_c: accountData.icon
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
          console.error(`Failed to update accounts ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message);
        }

        const updatedRecord = response.results[0];
        const updatedAccount = updatedRecord.data;
        return {
          Id: updatedAccount.Id,
          name: updatedAccount.Name,
          type: updatedAccount.type_c,
          balance: updatedAccount.balance_c || 0,
          accountNumber: updatedAccount.account_number_c,
          bankName: updatedAccount.bank_name_c,
          isLinked: updatedAccount.is_linked_c || false,
          color: updatedAccount.color_c,
          icon: updatedAccount.icon_c
        };
      }
    } catch (error) {
      console.error("Error updating account:", error);
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
          console.error(`Failed to delete Accounts ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  }

  async linkAccount(bankName, accountNumber, routingNumber) {
    try {
      // Simulate bank linking process and create linked account
      const linkedAccountData = {
        name: `${bankName} Account`,
        type: "checking",
        balance: Math.floor(Math.random() * 5000) + 1000,
        accountNumber: `****${accountNumber.slice(-4)}`,
        isLinked: true,
        bankName,
        color: "#2563EB",
        icon: "Landmark"
      };

      return await this.create(linkedAccountData);
    } catch (error) {
      console.error("Error linking account:", error);
      throw error;
    }
  }
}

export const accountService = new AccountService();