import { INITIAL_DATA, MOCK_USERS } from '../constants';
import { BoardData, Column, Task, User, Priority } from '../types';

const STORAGE_KEY = 'hybrid_task_manager_data';
const CURRENT_USER_KEY = 'hybrid_task_manager_user';
const USERS_LIST_KEY = 'hybrid_task_manager_users_list';

export const DataService = {
  // --- User / Auth ---
  
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getAllUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_LIST_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    const initialUsers = MOCK_USERS;
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  },

  login: async (email: string, password?: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = DataService.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
        if (!password || (user as any).password === password || password === 'password') {
             localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
             return user;
        }
    }
    throw new Error('Invalid credentials');
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = DataService.getAllUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User already exists');
    }

    const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };

    users.push(newUser);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  updateCurrentUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const users = DataService.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User not found");

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // --- Board Data ---

  getBoardData: async (): Promise<BoardData> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(stored);
  },

  saveBoardData: (data: BoardData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  addTask: async (task: Task): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    const newData = { ...currentData };
    
    newData.tasks[task.id] = task;
    const columnId = newData.columns[task.status] ? task.status : newData.columnOrder[0];
    task.status = columnId;
    newData.tasks[task.id] = task;
    newData.columns[columnId].taskIds.push(task.id);
    
    DataService.saveBoardData(newData);
    return newData;
  },

  updateTask: async (task: Task): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    const oldTask = currentData.tasks[task.id];
    
    if (oldTask.status !== task.status) {
      const sourceColumn = currentData.columns[oldTask.status];
      if (sourceColumn) {
        sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== task.id);
      }
      
      const destColumn = currentData.columns[task.status];
      if (destColumn) {
        destColumn.taskIds.push(task.id);
      }
    }
    
    currentData.tasks[task.id] = task;
    DataService.saveBoardData(currentData);
    return currentData;
  },

  deleteTask: async (taskId: string): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    const task = currentData.tasks[taskId];
    if (!task) return currentData;

    const column = currentData.columns[task.status];
    if (column) {
      column.taskIds = column.taskIds.filter(id => id !== taskId);
    }
    delete currentData.tasks[taskId];
    DataService.saveBoardData(currentData);
    return currentData;
  },

  // --- Columns / Status ---

  addColumn: async (title: string, color: string): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    const newId = title; // Use Title as ID for simplicity in this MVP to match existing keys
    
    if (currentData.columns[newId]) return currentData;

    const newColumn: Column = {
      id: newId,
      title,
      color,
      taskIds: []
    };

    currentData.columns[newId] = newColumn;
    currentData.columnOrder.push(newId);
    DataService.saveBoardData(currentData);
    return currentData;
  },

  deleteColumn: async (columnId: string): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    if (currentData.columnOrder.length <= 1) return currentData;

    const column = currentData.columns[columnId];
    if (!column) return currentData;

    column.taskIds.forEach(taskId => {
      delete currentData.tasks[taskId];
    });

    delete currentData.columns[columnId];
    currentData.columnOrder = currentData.columnOrder.filter(id => id !== columnId);
    DataService.saveBoardData(currentData);
    return currentData;
  },

  updateColumn: async (columnId: string, updates: Partial<Column>): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    if (!currentData.columns[columnId]) return currentData;

    currentData.columns[columnId] = { ...currentData.columns[columnId], ...updates };
    DataService.saveBoardData(currentData);
    return currentData;
  },

  // --- Priorities ---

  addPriority: async (title: string, color: string): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    const newId = title.toLowerCase().replace(/\s+/g, '_');
    
    if (currentData.priorities.find(p => p.id === newId)) return currentData;

    const newPriority: Priority = {
      id: newId,
      title,
      color
    };

    currentData.priorities.push(newPriority);
    DataService.saveBoardData(currentData);
    return currentData;
  },

  updatePriority: async (id: string, updates: Partial<Priority>): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    const index = currentData.priorities.findIndex(p => p.id === id);
    if (index === -1) return currentData;

    currentData.priorities[index] = { ...currentData.priorities[index], ...updates };
    DataService.saveBoardData(currentData);
    return currentData;
  },

  deletePriority: async (priorityId: string): Promise<BoardData> => {
    const currentData = await DataService.getBoardData();
    if (currentData.priorities.length <= 1) return currentData; // Prevent deleting last priority

    currentData.priorities = currentData.priorities.filter(p => p.id !== priorityId);
    // Reset tasks with this priority to the first available
    const fallbackPriority = currentData.priorities[0].id;
    
    Object.values(currentData.tasks).forEach(task => {
        if (task.priority === priorityId) {
            task.priority = fallbackPriority;
        }
    });

    DataService.saveBoardData(currentData);
    return currentData;
  }
};