import { TodoPriority, TodoStatus } from '../../api/todos';

export type UiStatus = 'To Do' | 'In Progress' | 'Done';
export type UiPriority = 'Low' | 'Normal' | 'High';

export const uiStatusOptions: UiStatus[] = ['To Do', 'In Progress', 'Done'];
export const todoStatusOptions: ReadonlyArray<{ value: TodoStatus; label: UiStatus }> = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];
export const uiPriorityOptions: UiPriority[] = ['Low', 'Normal', 'High'];

const statusLabels: Record<TodoStatus, UiStatus> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export function apiStatusFromUi(status: UiStatus | TodoStatus): TodoStatus {
  switch (status) {
    case 'todo':
    case 'To Do':
      return 'todo';
    case 'in_progress':
    case 'In Progress':
      return 'in_progress';
    case 'done':
    case 'Done':
      return 'done';
  }
  throw new Error(`Unsupported todo status: ${status}`);
}

export function uiStatusFromApi(status: TodoStatus): UiStatus {
  return statusLabels[status];
}

export function apiPriorityFromUi(priority: UiPriority): TodoPriority {
  return priority.toLowerCase() as TodoPriority;
}

export function uiPriorityFromApi(priority: TodoPriority): UiPriority {
  switch (priority) {
    case 'low':
      return 'Low';
    case 'high':
      return 'High';
    default:
      return 'Normal';
  }
}
