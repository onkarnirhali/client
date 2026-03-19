import { ChangeEvent } from 'react';
import { UiPriority, UiStatus } from '../../features/todos/mapping';

export type TodoFiltersDraft = {
  status: '' | UiStatus;
  priority: '' | UiPriority;
  q: string;
  dueFrom: string;
  dueTo: string;
};

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
    <div className="panel p-5 grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="grid gap-1.5">
          <label className="field-label">Search</label>
          <input className="input" type="text" value={draft.q} onChange={handleChange('q')} placeholder="Search tasks..." />
        </div>
        <div className="grid gap-1.5">
          <label className="field-label">Status</label>
          <select
            className="input"
            value={draft.status}
            onChange={(e) => onDraftChange({ ...draft, status: e.target.value as '' | UiStatus })}
          >
            <option value="">All statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <label className="field-label">Priority</label>
          <select
            className="input"
            value={draft.priority}
            onChange={(e) => onDraftChange({ ...draft, priority: e.target.value as '' | UiPriority })}
          >
            <option value="">Any priority</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <label className="field-label">Due from</label>
          <input className="input" type="date" value={draft.dueFrom} onChange={handleChange('dueFrom')} />
        </div>
        <div className="grid gap-1.5">
          <label className="field-label">Due to</label>
          <input className="input" type="date" value={draft.dueTo} onChange={handleChange('dueTo')} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn btn-secondary btn-sm" onClick={onReset} disabled={busy}>Reset</button>
        <button className="btn btn-primary btn-sm" onClick={onApply} disabled={busy}>Apply</button>
      </div>
    </div>
  );
}
