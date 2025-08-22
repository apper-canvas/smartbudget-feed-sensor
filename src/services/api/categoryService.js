import categoryData from "@/services/mockData/categories.json";

class CategoryService {
  constructor() {
    this.categories = [...categoryData];
  }

  async getAll() {
    await this.delay();
    return [...this.categories];
  }

  async getById(id) {
    await this.delay();
    const category = this.categories.find(c => c.Id === parseInt(id));
    if (!category) throw new Error("Category not found");
    return { ...category };
  }

  async create(categoryData) {
    await this.delay();
    const newId = Math.max(...this.categories.map(c => c.Id)) + 1;
    const newCategory = {
      Id: newId,
      ...categoryData
    };
    this.categories.push(newCategory);
    return { ...newCategory };
  }

  async update(id, categoryData) {
    await this.delay();
    const index = this.categories.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Category not found");
    
    this.categories[index] = {
      ...this.categories[index],
      ...categoryData
    };
    return { ...this.categories[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.categories.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Category not found");
    
    this.categories.splice(index, 1);
    return true;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export const categoryService = new CategoryService();