import { formatDateShort } from '../../utils/date';
import { Todo } from '../../features/todos';
import { uiPriorityFromApi, uiStatusFromApi } from '../../features/todos/mapping';

type Props = {
  items: Todo[];
  loading?: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
};

type Lane = {
  key: string;
  label: string;
  dotClass: string;
  badgeClass: string;
  filter: (t: Todo) => boolean;
};

const lanes: Lane[] = [
  { key: 'todo', label: 'To do', dotClass: 'status-todo', badgeClass: 'badge-todo', filter: (t) => t.status === 'pending' && !t.description?.match(/in.?progress/i) },
  { key: 'progress', label: 'In progress', dotClass: 'status-progress', badgeClass: 'badge-progress', filter: () => false },
  { key: 'done', label: 'Done', dotClass: 'status-done', badgeClass: 'badge-done', filter: (t) => t.status === 'done' },
];

function classifyTodo(t: Todo): string {
  if (t.status === 'done') return 'done';
  const uiStatus = uiStatusFromApi(t.status);
  if (uiStatus === 'In Progress') return 'progress';
  return 'todo';
}

function priorityBadgeClass(priority: string): string {
  if (priority === 'high') return 'badge-danger';
  if (priority === 'low') return 'badge-primary';
  return 'badge-accent';
}

export function TodoList({ items, loading, onEdit, onDelete }: Props) {
  const buckets: Record<string, Todo[]> = { todo: [], progress: [], done: [] };
  for (const item of items) {
    const lane = classifyTodo(item);
    buckets[lane].push(item);
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 rounded-full overflow-hidden z-10">
          <div className="h-full bg-primary rounded-full animate-[loading_1.4s_ease-in-out_infinite] w-1/3" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lanes.map((lane) => {
          const laneItems = buckets[lane.key] || [];
          return (
            <section key={lane.key} className="lane">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${lane.dotClass}`} />
                  <strong className="text-sm">{lane.label}</strong>
                </div>
                <span className={`badge ${lane.badgeClass}`}>{laneItems.length} {laneItems.length === 1 ? 'card' : 'cards'}</span>
              </div>
              <div className="grid gap-3">
                {laneItems.map((todo) => (
                  <article
                    key={todo.id}
                    className="task-card cursor-pointer"
                    onClick={() => onEdit(todo)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid gap-1 flex-1 min-w-0">
                        <div className="font-bold text-sm leading-snug">{todo.title}</div>
                        {todo.description && (
                          <p className="text-muted text-[13px] leading-relaxed line-clamp-2">{todo.description}</p>
                        )}
                      </div>
                      <span className={`badge ${priorityBadgeClass(todo.priority)} shrink-0`}>
                        {uiPriorityFromApi(todo.priority)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(todo.linkedNotes?.length ?? 0) > 0 && (
                        <span className="badge badge-primary">{todo.linkedNotes!.length} linked {todo.linkedNotes!.length === 1 ? 'note' : 'notes'}</span>
                      )}
                      {todo.dueDate && (
                        <span className="badge badge-accent">Due {formatDateShort(todo.dueDate)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button
                        className="btn btn-ghost btn-sm text-xs"
                        onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm text-xs"
                        onClick={(e) => { e.stopPropagation(); onDelete(todo); }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
                {laneItems.length === 0 && (
                  <div className="text-center text-muted text-[13px] py-6">No tasks</div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
