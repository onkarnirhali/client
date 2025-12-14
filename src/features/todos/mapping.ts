import { TodoPriority, TodoStatus } from '../../api/todos';

export type UiStatus = 'To Do' | 'In Progress' | 'Done';
export type UiPriority = 'Low' | 'Normal' | 'High';

export const uiStatusOptions: UiStatus[] = ['To Do', 'In Progress', 'Done'];
export const uiPriorityOptions: UiPriority[] = ['Low', 'Normal', 'High'];

export function apiStatusFromUi(status: UiStatus): TodoStatus {
  return status === 'Done' ? 'done' : 'pending';
}

export function uiStatusFromApi(status: TodoStatus): UiStatus {
  return status === 'done' ? 'Done' : 'In Progress';
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
