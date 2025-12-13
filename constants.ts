
import { BoardData, User, Priority } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex@example.com', password: 'password', avatar: 'https://picsum.photos/32/32?random=1' },
  { id: 'u2', name: 'Sam Smith', email: 'sam@example.com', password: 'password', avatar: 'https://picsum.photos/32/32?random=2' },
  { id: 'u3', name: 'Jordan Lee', email: 'jordan@example.com', password: 'password', avatar: 'https://picsum.photos/32/32?random=3' },
];

const now = new Date();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

const DEFAULT_PRIORITIES: Priority[] = [
  { id: 'low', title: 'Low', color: '#dbeafe' }, // blue-100
  { id: 'medium', title: 'Medium', color: '#fef9c3' }, // yellow-100
  { id: 'high', title: 'High', color: '#fee2e2' }, // red-100
];

export const INITIAL_DATA: BoardData = {
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Design System Audit',
      description: 'Review the current component library and identify inconsistencies.',
      status: 'In Progress',
      priority: 'high',
      assigneeId: 'u1',
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: fiveDaysAgo.toISOString(),
      tags: ['Design', 'Audit']
    },
    'task-2': {
      id: 'task-2',
      title: 'API Integration for Auth',
      description: 'Implement JWT based authentication flow.',
      status: 'To Do',
      priority: 'high',
      assigneeId: 'u2',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString(),
      tags: ['Backend', 'Security']
    },
    'task-3': {
      id: 'task-3',
      title: 'Update Documentation',
      description: 'Update the README and API docs.',
      status: 'Done',
      priority: 'low',
      assigneeId: 'u3',
      dueDate: twoDaysAgo.toISOString(),
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Docs']
    },
    'task-4': {
      id: 'task-4',
      title: 'Refactor Table Component',
      description: 'Improve performance of the data table.',
      status: 'To Do',
      priority: 'medium',
      assigneeId: 'u1',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: twoDaysAgo.toISOString(),
      tags: ['Refactor', 'Frontend']
    }
  },
  columns: {
    'To Do': {
      id: 'To Do',
      title: 'To Do',
      color: '#64748b', // Slate
      taskIds: ['task-2', 'task-4']
    },
    'In Progress': {
      id: 'In Progress',
      title: 'In Progress',
      color: '#3b82f6', // Blue
      taskIds: ['task-1']
    },
    'Done': {
      id: 'Done',
      title: 'Done',
      color: '#22c55e', // Green
      taskIds: ['task-3']
    }
  },
  columnOrder: ['To Do', 'In Progress', 'Done'],
  priorities: DEFAULT_PRIORITIES
};
