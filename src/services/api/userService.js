import userData from "@/services/mockData/users.json";

// In-memory store for runtime modifications
let users = [...userData];

export const userService = {
  // Get all users
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...users]);
      }, 100);
    });
  },

  // Get user by ID
  getById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.Id === parseInt(id));
        if (user) {
          resolve({ ...user });
        } else {
          reject(new Error(`User with ID ${id} not found`));
        }
      }, 100);
    });
  },

  // Create new user
  create: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...userData,
          Id: Math.max(...users.map(u => u.Id), 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        users.push(newUser);
        resolve({ ...newUser });
      }, 200);
    });
  },

  // Update user
  update: async (id, userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.Id === parseInt(id));
        if (index !== -1) {
          users[index] = {
            ...users[index],
            ...userData,
            Id: parseInt(id), // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
          };
          resolve({ ...users[index] });
        } else {
          reject(new Error(`User with ID ${id} not found`));
        }
      }, 200);
    });
  },

  // Delete user
  delete: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.Id === parseInt(id));
        if (index !== -1) {
          const deletedUser = users.splice(index, 1)[0];
          resolve({ ...deletedUser });
        } else {
          reject(new Error(`User with ID ${id} not found`));
        }
      }, 200);
    });
  }
};