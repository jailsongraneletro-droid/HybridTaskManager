
import { BoardData, User, Priority } from './types';

// IDs are valid UUID format to avoid syntax errors in Postgres.
// These specific IDs will be synced to the 'profiles' table by DataService if possible.
export const MOCK_USERS: User[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Jailson', email: 'jailson@gran.com', avatar: 'https://ui-avatars.com/api/?name=Jailson&background=random' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Suelany', email: 'suelany@gran.com', avatar: 'https://ui-avatars.com/api/?name=Suelany&background=random' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Silvana', email: 'silvana@gran.com', avatar: 'https://ui-avatars.com/api/?name=Silvana&background=random' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Rafael', email: 'rafael@gran.com', avatar: 'https://ui-avatars.com/api/?name=Rafael&background=random' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Jose', email: 'jose@gran.com', avatar: 'https://ui-avatars.com/api/?name=Jose&background=random' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Carlos', email: 'carlos@gran.com', avatar: 'https://ui-avatars.com/api/?name=Carlos&background=random' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Setor de Peças', email: 'pecas@gran.com', avatar: 'https://ui-avatars.com/api/?name=Setor+Pecas&background=random' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'ADM', email: 'adm@gran.com', avatar: 'https://ui-avatars.com/api/?name=ADM&background=random' },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Transporte', email: 'transporte@gran.com', avatar: 'https://ui-avatars.com/api/?name=Transporte&background=random' },
];

const now = new Date();

const DEFAULT_PRIORITIES: Priority[] = [
  { id: 'low', title: 'Low', color: '#dbeafe' }, // blue-100
  { id: 'medium', title: 'Medium', color: '#fef9c3' }, // yellow-100
  { id: 'high', title: 'High', color: '#fee2e2' }, // red-100
];

export const INITIAL_DATA: BoardData = {
  tasks: {},
  columns: {
    'To Do': {
      id: 'To Do',
      title: 'To Do',
      color: '#64748b', // Slate
      taskIds: []
    },
    'In Progress': {
      id: 'In Progress',
      title: 'In Progress',
      color: '#3b82f6', // Blue
      taskIds: []
    },
    'Done': {
      id: 'Done',
      title: 'Done',
      color: '#22c55e', // Green
      taskIds: []
    }
  },
  columnOrder: ['To Do', 'In Progress', 'Done'],
  priorities: DEFAULT_PRIORITIES
};