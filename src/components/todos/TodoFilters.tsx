import { ChangeEvent } from 'react';
import type { TodoStatus } from '../../api/todos';
import { UiPriority, UiStatus, todoStatusOptions } from '../../features/todos/mapping';

export type TodoFiltersDraft = {
  status: '' | UiStatus | TodoStatus;
  priority: '' | UiPriority;
  q: string;
  dueFrom: string;
  dueTo: string;
};

function normalizeStatus(status: TodoFiltersDraft['status']) {
  switch (status) {
    case 'To Do':
    case 'todo':
      return 'todo';
    case 'In Progress':
    case 'in_progress':
      return 'in_progress';
    case 'Done':
    case 'done':
      return 'done';
    default:
      return '';
  }
}

type Props = {
  draft: TodoFiltersDraft;
  onDraftChange: (draft: TodoFiltersDraft) => void;
  onApply: () => void;
  onReset: () => void;
  busy?: boolean;
};

export function TodoFilters({ draft, onDraftChange, onApply, onReset, busy }: Props) {
  const handleChange = (field: keyof TodoFiltersDraft) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onDraftChange({ ...draft, [field]: event.target.value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-4 grid gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <input
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            type="text"
            value={draft.q}
            onChange={handleChange('q')}
            placeholder="Search tasks..."
          />
        </div>
        <div>
          <select
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            value={normalizeStatus(draft.status)}
            onChange={(e) => onDraftChange({ ...draft, status: e.target.value as '' | TodoStatus })}
          >
            <option value="">All Statuses</option>
            {todoStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            value={draft.priority}
            onChange={(e) => onDraftChange({ ...draft, priority: e.target.value as '' | UiPriority })}
          >
            <option value="">Any Priority</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <input
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            type="date"
            value={draft.dueFrom}
            onChange={handleChange('dueFrom')}
          />
        </div>
        <div>
          <input
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            type="date"
            value={draft.dueTo}
            onChange={handleChange('dueTo')}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 text-sm font-medium text-muted border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors"
          onClick={onReset}
          disabled={busy}
        >
          Reset
        </button>
        <button
          className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-[10px] hover:opacity-90 transition-colors"
          onClick={onApply}
          disabled={busy}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
