import { formatDateShort } from '../../utils/date';
import { Todo } from '../../features/todos';
import { uiPriorityFromApi, uiStatusFromApi } from '../../features/todos/mapping';
import { TodoPriority } from '../../api/todos';

type Props = {
  items: Todo[];
  loading?: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
};

type Lane = {
  key: string;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
};

const lanes: Lane[] = [
  { key: 'todo', label: 'To Do', dotColor: 'bg-blue-500', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700' },
  { key: 'progress', label: 'In Progress', dotColor: 'bg-amber-500', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' },
  { key: 'done', label: 'Done', dotColor: 'bg-emerald-500', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
];

function classifyTodo(t: Todo): string {
  if (t.status === 'done') return 'done';
  const uiStatus = uiStatusFromApi(t.status);
  if (uiStatus === 'In Progress') return 'progress';
  return 'todo';
}

function priorityBadge(priority: TodoPriority) {
  const uiP = uiPriorityFromApi(priority);
  if (priority === 'high') return { label: uiP, cls: 'bg-orange-100 text-orange-700' };
  if (priority === 'low') return { label: uiP, cls: 'bg-gray-100 text-gray-600' };
  return { label: uiP, cls: 'bg-yellow-100 text-yellow-800' };
}

const dragHandleIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
);

const moreIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
);

const calendarIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

const noteIcon = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
);

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
          const isDone = lane.key === 'done';
          return (
            <section key={lane.key} className="bg-white/70 rounded-xl border border-gray-200/60 p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${lane.dotColor}`} />
                  <h3 className="text-sm font-bold">{lane.label}</h3>
                  <span className={`${lane.badgeBg} ${lane.badgeText} text-[11px] px-2 py-0.5 rounded-full font-semibold`}>{laneItems.length}</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {laneItems.map((todo) => {
                  const pb = priorityBadge(todo.priority);
                  const notesCount = todo.linkedNotes?.length ?? 0;
                  return (
                    <article
                      key={todo.id}
                      className={`bg-white rounded-lg border border-gray-100 p-3.5 hover:shadow-md hover:border-primary/20 transition-all duration-150 cursor-pointer group ${isDone ? 'opacity-75' : ''}`}
                      onClick={() => onEdit(todo)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-gray-300 group-hover:text-gray-400 mt-0.5 flex-shrink-0">
                          {dragHandleIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1.5">
                            <h4 className={`text-sm font-semibold leading-snug ${isDone ? 'line-through text-muted' : ''}`}>{todo.title}</h4>
                            <button
                              className="opacity-0 group-hover:opacity-100 text-muted hover:text-text transition-all p-0.5 -mr-0.5 flex-shrink-0"
                              onClick={(e) => { e.stopPropagation(); onDelete(todo); }}
                              title="Delete"
                            >
                              {moreIcon}
                            </button>
                          </div>
                          {!isDone && todo.description && (
                            <p className="text-xs text-muted line-clamp-2 mb-2.5">{todo.description}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] ${pb.cls} px-2 py-0.5 rounded-full font-medium`}>{pb.label}</span>
                            {todo.dueDate && (
                              <span className="text-[11px] text-muted flex items-center gap-1">
                                {calendarIcon}
                                {formatDateShort(todo.dueDate)}
                              </span>
                            )}
                            {notesCount > 0 && (
                              <span className="text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                {noteIcon}
                                {notesCount}
                              </span>
                            )}
                            {isDone && (
                              <span className="text-[11px] text-muted">Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
