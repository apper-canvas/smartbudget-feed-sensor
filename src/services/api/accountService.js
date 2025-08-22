import accountData from "@/services/mockData/accounts.json";

class AccountService {
  constructor() {
    this.accounts = [...accountData];
  }

  async getAll() {
    await this.delay();
    return [...this.accounts];
  }

  async getById(id) {
    await this.delay();
    const account = this.accounts.find(a => a.Id === parseInt(id));
    if (!account) throw new Error("Account not found");
    return { ...account };
  }

  async create(accountData) {
    await this.delay();
    const newId = Math.max(...this.accounts.map(a => a.Id)) + 1;
    const newAccount = {
      Id: newId,
      ...accountData,
      createdAt: new Date().toISOString()
    };
    this.accounts.push(newAccount);
    return { ...newAccount };
  }

  async update(id, accountData) {
    await this.delay();
    const index = this.accounts.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error("Account not found");
    
    this.accounts[index] = {
      ...this.accounts[index],
      ...accountData
    };
    return { ...this.accounts[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.accounts.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error("Account not found");
    
    this.accounts.splice(index, 1);
    return true;
  }

  async linkAccount(bankName, accountNumber, routingNumber) {
    await this.delay();
    // Simulate bank linking process
    const linkedAccount = {
      Id: Math.max(...this.accounts.map(a => a.Id)) + 1,
      name: `${bankName} Account`,
      type: "checking",
      balance: Math.floor(Math.random() * 5000) + 1000,
      accountNumber: `****${accountNumber.slice(-4)}`,
      isLinked: true,
      bankName,
      color: "#2563EB",
      icon: "Landmark",
      createdAt: new Date().toISOString()
    };
    this.accounts.push(linkedAccount);
    return { ...linkedAccount };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export const accountService = new AccountService();