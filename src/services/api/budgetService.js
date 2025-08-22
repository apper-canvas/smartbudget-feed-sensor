import budgetData from "@/services/mockData/budgets.json";

class BudgetService {
  constructor() {
    this.budgets = [...budgetData];
  }

  async getAll() {
    await this.delay();
    return [...this.budgets];
  }

  async getById(id) {
    await this.delay();
    const budget = this.budgets.find(b => b.Id === parseInt(id));
    if (!budget) throw new Error("Budget not found");
    return { ...budget };
  }

  async create(budgetData) {
    await this.delay();
    const newId = Math.max(...this.budgets.map(b => b.Id), 0) + 1;
    const newBudget = {
      Id: newId,
      ...budgetData
    };
    this.budgets.push(newBudget);
    return { ...newBudget };
  }

  async update(id, budgetData) {
    await this.delay();
    const index = this.budgets.findIndex(b => b.Id === parseInt(id));
    if (index === -1) throw new Error("Budget not found");
    
    this.budgets[index] = {
      ...this.budgets[index],
      ...budgetData
    };
    return { ...this.budgets[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.budgets.findIndex(b => b.Id === parseInt(id));
    if (index === -1) throw new Error("Budget not found");
    
    this.budgets.splice(index, 1);
    return true;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export const budgetService = new BudgetService();