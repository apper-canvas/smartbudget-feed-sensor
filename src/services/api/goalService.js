import goalData from "@/services/mockData/goals.json";

class GoalService {
  constructor() {
    this.goals = [...goalData];
  }

  async getAll() {
    await this.delay();
    return [...this.goals];
  }

  async getById(id) {
    await this.delay();
    const goal = this.goals.find(g => g.Id === parseInt(id));
    if (!goal) throw new Error("Goal not found");
    return { ...goal };
  }

  async create(goalData) {
    await this.delay();
    const newId = Math.max(...this.goals.map(g => g.Id)) + 1;
    const newGoal = {
      Id: newId,
      ...goalData,
      createdAt: new Date().toISOString()
    };
    this.goals.push(newGoal);
    return { ...newGoal };
  }

  async update(id, goalData) {
    await this.delay();
    const index = this.goals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error("Goal not found");
    
    this.goals[index] = {
      ...this.goals[index],
      ...goalData
    };
    return { ...this.goals[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.goals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error("Goal not found");
    
    this.goals.splice(index, 1);
    return true;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export const goalService = new GoalService();