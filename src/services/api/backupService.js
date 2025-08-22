import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { goalService } from "@/services/api/goalService";
import { accountService } from "@/services/api/accountService";
import { categoryService } from "@/services/api/categoryService";
import { userService } from "@/services/api/userService";

class BackupService {
  async exportAllData() {
    try {
      const [transactions, budgets, goals, accounts, categories, users] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        goalService.getAll(),
        accountService.getAll(),
        categoryService.getAll(),
        userService.getAll()
      ]);

      return {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {
          transactions,
          budgets,
          goals,
          accounts,
          categories,
          users
        },
        summary: {
          totalTransactions: transactions.length,
          totalBudgets: budgets.length,
          totalGoals: goals.length,
          totalAccounts: accounts.length,
          totalCategories: categories.length,
          totalUsers: users.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  async exportToJSON() {
    const data = await this.exportAllData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = `smartbudget-backup-${this.getTimestamp()}.json`;
    
    this.downloadFile(blob, filename);
    return { filename, size: blob.size };
  }

  async exportToCSV() {
    const data = await this.exportAllData();
    
    // Create separate CSV content for each data type
    const csvSections = [];
    
    // Transactions CSV
    if (data.data.transactions.length > 0) {
      const transactionHeaders = ['Id', 'Amount', 'Type', 'Category', 'Date', 'Notes', 'CreatedAt'];
      const transactionRows = data.data.transactions.map(t => [
        t.Id,
        t.amount,
        t.type,
        t.category,
        t.date,
        t.notes || '',
        t.createdAt
      ]);
      csvSections.push('TRANSACTIONS');
      csvSections.push(this.arrayToCSV([transactionHeaders, ...transactionRows]));
      csvSections.push('');
    }

    // Budgets CSV
    if (data.data.budgets.length > 0) {
      const budgetHeaders = ['Id', 'Category', 'Amount', 'Period', 'StartDate', 'EndDate'];
      const budgetRows = data.data.budgets.map(b => [
        b.Id,
        b.category,
        b.amount,
        b.period,
        b.startDate,
        b.endDate
      ]);
      csvSections.push('BUDGETS');
      csvSections.push(this.arrayToCSV([budgetHeaders, ...budgetRows]));
      csvSections.push('');
    }

    // Goals CSV
    if (data.data.goals.length > 0) {
      const goalHeaders = ['Id', 'Title', 'TargetAmount', 'CurrentAmount', 'TargetDate', 'Category'];
      const goalRows = data.data.goals.map(g => [
        g.Id,
        g.title,
        g.targetAmount,
        g.currentAmount,
        g.targetDate,
        g.category
      ]);
      csvSections.push('GOALS');
      csvSections.push(this.arrayToCSV([goalHeaders, ...goalRows]));
      csvSections.push('');
    }

    const csvContent = csvSections.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `smartbudget-backup-${this.getTimestamp()}.csv`;
    
    this.downloadFile(blob, filename);
    return { filename, size: blob.size };
  }

  arrayToCSV(data) {
    return data.map(row => 
      row.map(field => {
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',')
    ).join('\n');
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  }
}

export const backupService = new BackupService();