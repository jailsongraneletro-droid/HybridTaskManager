
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

// Deprecated enum, kept for reference if needed, but logic moves to string IDs
export enum TaskPriorityLegacy {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for profile management
  avatar?: string;
}

// New Interface for custom assignees per user board
export interface Assignee {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Priority {
  id: string;
  title: string;
  color: string; // Tailwind class or Hex
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string; 
  priority: string; // Changed to string ID
  assigneeId?: string;
  dueDate: string; // ISO Date string
  createdAt: string; // ISO Date string
  position?: number;
  deletedAt?: string | null;
  tags?: string[];
}

export interface Column {
  id: string;
  title: string;
  color: string; 
  taskIds: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
}

export interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
  priorities: Priority[]; // Added dynamic priorities
  assignees: Assignee[]; // Added dynamic assignees
  notes: Note[]; // Added notes
}