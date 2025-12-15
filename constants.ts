
import { BoardData, Priority, Assignee } from './types';

// Removed MOCK_USERS. 
// Users are now managed dynamically via the 'kanban_assignees' table in Supabase.

export const DEFAULT_PRIORITIES: Priority[] = [
  { id: 'high', title: 'Alta', color: '#fee2e2' }, // red-100
  { id: 'medium', title: 'Média', color: '#fef9c3' }, // yellow-100
  { id: 'low', title: 'Baixa', color: '#dbeafe' }, // blue-100
];

export const DEFAULT_COLUMNS = [
  { id: 'To Do', title: 'A fazer', color: '#64748b' },
  { id: 'In Progress', title: 'Em andamento', color: '#3b82f6' },
  { id: 'Done', title: 'Concluído', color: '#22c55e' }
];

export const INITIAL_DATA: BoardData = {
  tasks: {},
  columns: {},
  columnOrder: [],
  priorities: [],
  assignees: []
};
