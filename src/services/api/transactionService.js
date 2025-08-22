import transactionData from "@/services/mockData/transactions.json";
class TransactionService {
  constructor() {
    this.transactions = [...transactionData];
  }

  async getAll() {
    await this.delay();
    return [...this.transactions];
  }

  async getById(id) {
    await this.delay();
    const transaction = this.transactions.find(t => t.Id === parseInt(id));
    if (!transaction) throw new Error("Transaction not found");
    return { ...transaction };
  }

  async create(transactionData) {
    await this.delay();
    const newId = Math.max(...this.transactions.map(t => t.Id)) + 1;
    const newTransaction = {
      Id: newId,
      ...transactionData,
      createdAt: new Date().toISOString()
    };
    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await this.delay();
    const index = this.transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error("Transaction not found");
    
    this.transactions[index] = {
      ...this.transactions[index],
      ...transactionData
    };
    return { ...this.transactions[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error("Transaction not found");
    
    this.transactions.splice(index, 1);
    return true;
  }
async getAllForExport() {
    // Return all data without delay for backup operations
    return [...this.transactions];
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}