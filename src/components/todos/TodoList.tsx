import { useEffect, useRef, useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { formatDateShort } from '../../utils/date';
import { Todo, TodoReorderInput, TodoStatus } from '../../api/todos';
import { uiPriorityFromApi } from '../../features/todos/mapping';
import { TodoPriority } from '../../api/todos';

type BoardState = Record<TodoStatus, Todo[]>;

type Props = {
  items?: Todo[];
  orderedItems?: Todo[];
  loading?: boolean;
  dragDisabled?: boolean;
  reorderPending?: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onReorder?: (payload: TodoReorderInput) => Promise<void> | void;
};

type Lane = {
  key: TodoStatus;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  emptyLabel: string;
};

const lanes: Lane[] = [
  {
    key: 'todo',
    label: 'To Do',
    dotColor: 'bg-blue-500',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    emptyLabel: 'No tasks',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    emptyLabel: 'No tasks',
  },
  {
    key: 'done',
    label: 'Done',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    emptyLabel: 'No tasks',
  },
];

const laneOrder: TodoStatus[] = ['todo', 'in_progress', 'done'];

const dragHandleIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="5" r="1.5" />
    <circle cx="15" cy="5" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="15" cy="19" r="1.5" />
  </svg>
);

const moreIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const calendarIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const noteIcon = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
  </svg>
);

function compareTodos(a: Todo, b: Todo) {
  const statusDiff = laneOrder.indexOf(a.status) - laneOrder.indexOf(b.status);
  if (statusDiff !== 0) return statusDiff;
  if (a.position !== b.position) return a.position - b.position;
  const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  if (timeDiff !== 0) return timeDiff;
  return b.id - a.id;
}

function createBoardState(items: Todo[]): BoardState {
  const next: BoardState = {
    todo: [],
    in_progress: [],
    done: [],
  };

  [...items]
    .sort(compareTodos)
    .forEach((item) => {
      next[item.status].push(item);
    });

  return next;
}

function cloneBoardState(state: BoardState): BoardState {
  return {
    todo: [...state.todo],
    in_progress: [...state.in_progress],
    done: [...state.done],
  };
}

function todoNodeId(id: number) {
  return `todo-${id}`;
}

function laneNodeId(status: TodoStatus) {
  return `lane-${status}`;
}

function parseTodoNodeId(id: string | number) {
  const raw = String(id);
  if (!raw.startsWith('todo-')) return null;
  const parsed = Number(raw.slice(5));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseLaneNodeId(id: string | number): TodoStatus | null {
  const raw = String(id);
  if (!raw.startsWith('lane-')) return null;
  const parsed = raw.slice(5) as TodoStatus;
  return laneOrder.includes(parsed) ? parsed : null;
}

function findTodoLocation(state: BoardState, todoId: number) {
  for (const lane of laneOrder) {
    const index = state[lane].findIndex((todo) => todo.id === todoId);
    if (index !== -1) {
      return { lane, index, todo: state[lane][index] };
    }
  }
  return null;
}

function sameBoardState(a: BoardState, b: BoardState) {
  for (const lane of laneOrder) {
    if (a[lane].length !== b[lane].length) return false;
    for (let i = 0; i < a[lane].length; i += 1) {
      if (a[lane][i].id !== b[lane][i].id) return false;
    }
  }
  return true;
}

function toReorderPayload(state: BoardState): TodoReorderInput {
  return {
    lanes: {
      todo: state.todo.map((todo) => todo.id),
      in_progress: state.in_progress.map((todo) => todo.id),
      done: state.done.map((todo) => todo.id),
    },
  };
}

function moveTodo(state: BoardState, activeId: number, overId: string | number) {
  const activeLocation = findTodoLocation(state, activeId);
  if (!activeLocation) return state;

  const overTodoId = parseTodoNodeId(overId);
  const overLane = parseLaneNodeId(overId);

  if (overTodoId !== null) {
    const overLocation = findTodoLocation(state, overTodoId);
    if (!overLocation) return state;
    if (overLocation.lane === activeLocation.lane && overLocation.index === activeLocation.index) {
      return state;
    }

    if (overLocation.lane === activeLocation.lane) {
      return {
        ...state,
        [activeLocation.lane]: arrayMove(state[activeLocation.lane], activeLocation.index, overLocation.index),
      };
    }

    const next = cloneBoardState(state);
    const [activeTodo] = next[activeLocation.lane].splice(activeLocation.index, 1);
    next[overLocation.lane].splice(overLocation.index, 0, {
      ...activeTodo,
      status: overLocation.lane,
    });
    return next;
  }

  if (overLane && overLane !== activeLocation.lane) {
    const next = cloneBoardState(state);
    const [activeTodo] = next[activeLocation.lane].splice(activeLocation.index, 1);
    next[overLane].push({
      ...activeTodo,
      status: overLane,
    });
    return next;
  }

  return state;
}

function priorityBadge(priority: TodoPriority) {
  const uiP = uiPriorityFromApi(priority);
  if (priority === 'high') return { label: uiP, cls: 'bg-orange-100 text-orange-700' };
  if (priority === 'low') return { label: uiP, cls: 'bg-gray-100 text-gray-600' };
  return { label: uiP, cls: 'bg-yellow-100 text-yellow-800' };
}

function TodoCard({
  todo,
  onEdit,
  onDelete,
  disabled = false,
}: {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todoNodeId(todo.id),
    disabled,
  });

  const pb = priorityBadge(todo.priority);
  const notesCount = todo.linkedNotes?.length ?? 0;
  const isDone = todo.status === 'done';

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        zIndex: isDragging ? 2 : undefined,
      }}
      className={`bg-white rounded-lg border border-gray-100 p-3.5 hover:shadow-md hover:border-primary/20 transition-all duration-150 cursor-pointer group ${
        isDone ? 'opacity-75' : ''
      } ${isDragging ? 'opacity-40 shadow-xl ring-2 ring-primary/20' : ''}`}
      onClick={() => onEdit(todo)}
      onKeyDown={(event) => {
        if (event.currentTarget !== event.target) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onEdit(todo);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${todo.title}`}
    >
      <div className="flex items-start gap-2">
        <button
          ref={setActivatorNodeRef}
          type="button"
          disabled={disabled}
          className="text-gray-300 group-hover:text-gray-400 mt-0.5 flex-shrink-0 rounded p-1 touch-none cursor-grab active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Drag ${todo.title}`}
          {...attributes}
          {...listeners}
        >
          {dragHandleIcon}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1.5 gap-2">
            <h4 className={`text-sm font-semibold leading-snug ${isDone ? 'line-through text-muted' : ''}`}>{todo.title}</h4>
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100 text-muted hover:text-text transition-all p-0.5 -mr-0.5 flex-shrink-0"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(todo);
              }}
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
            {isDone && <span className="text-[11px] text-muted">Completed</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

function TodoCardOverlay({ todo }: { todo: Todo }) {
  const pb = priorityBadge(todo.priority);
  const notesCount = todo.linkedNotes?.length ?? 0;
  const isDone = todo.status === 'done';

  return (
    <article className={`bg-white rounded-lg border border-gray-200 p-3.5 shadow-2xl ring-2 ring-primary/15 ${isDone ? 'opacity-90' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="text-gray-400 mt-0.5 flex-shrink-0">{dragHandleIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1.5 gap-2">
            <h4 className={`text-sm font-semibold leading-snug ${isDone ? 'line-through text-muted' : ''}`}>{todo.title}</h4>
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
            {isDone && <span className="text-[11px] text-muted">Completed</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function TodoList({
  items,
  orderedItems,
  loading,
  dragDisabled = false,
  reorderPending = false,
  onEdit,
  onDelete,
  onReorder,
}: Props) {
  const sourceItems = orderedItems ?? items ?? [];
  const [boardState, setBoardState] = useState<BoardState>(() => createBoardState(sourceItems));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<string | number | null>(null);
  const snapshotRef = useRef<BoardState>(createBoardState(sourceItems));

  const dragLocked = Boolean(dragDisabled || reorderPending);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (activeId !== null) return;
    const next = createBoardState(sourceItems);
    setBoardState(next);
    snapshotRef.current = next;
  }, [sourceItems, activeId]);

  const activeTodo =
    activeId !== null
      ? laneOrder
          .flatMap((lane) => boardState[lane])
          .find((todo) => todo.id === activeId) ?? null
      : null;

  const helperText = reorderPending
    ? 'Saving board order...'
    : dragDisabled
      ? 'Drag and drop is disabled while filters are active.'
      : null;

  const handleDragStart = (event: DragStartEvent) => {
    if (dragLocked) return;
    const todoId = parseTodoNodeId(event.active.id);
    if (todoId === null) return;
    setActiveId(todoId);
    setOverId(event.active.id);
    snapshotRef.current = cloneBoardState(boardState);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (dragLocked) return;
    setOverId(event.over ? event.over.id : null);
  };

  const clearDragState = () => {
    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setBoardState(cloneBoardState(snapshotRef.current));
    clearDragState();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (dragLocked) {
      clearDragState();
      return;
    }

    const activeTodoId = parseTodoNodeId(event.active.id);
    if (activeTodoId === null) {
      clearDragState();
      return;
    }

    const dropTarget = event.over?.id ?? overId;
    if (!dropTarget) {
      setBoardState(cloneBoardState(snapshotRef.current));
      clearDragState();
      return;
    }

    const next = moveTodo(snapshotRef.current, activeTodoId, dropTarget);
    if (sameBoardState(next, snapshotRef.current)) {
      clearDragState();
      return;
    }

    setBoardState(next);
    clearDragState();

    const payload = toReorderPayload(next);
    try {
      await onReorder?.(payload);
    } catch (_) {
      setBoardState(cloneBoardState(snapshotRef.current));
    }
  };

  const renderLane = (lane: Lane) => {
    const laneItems = boardState[lane.key];
    const laneIsOver =
      overId !== null &&
      (parseLaneNodeId(overId) === lane.key || (parseTodoNodeId(overId) !== null && findTodoLocation(boardState, parseTodoNodeId(overId) ?? -1)?.lane === lane.key));

    return (
      <LaneColumn
        key={lane.key}
        lane={lane}
        items={laneItems}
        laneIsOver={laneIsOver}
        draggingDisabled={dragLocked}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 rounded-full overflow-hidden z-10">
          <div className="h-full bg-primary rounded-full animate-[loading_1.4s_ease-in-out_infinite] w-1/3" />
        </div>
      )}

      {helperText && (
        <div className="mb-3 text-xs text-muted bg-white/80 border border-gray-200/60 rounded-[10px] px-3 py-2">
          {helperText}
        </div>
      )}

      <DndContext
        sensors={dragLocked ? [] : sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lanes.map(renderLane)}
        </div>

        <DragOverlay>
          {activeTodo ? <TodoCardOverlay todo={activeTodo} /> : null}
        </DragOverlay>
      </DndContext>

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

function LaneColumn({
  lane,
  items,
  laneIsOver,
  draggingDisabled,
  onEdit,
  onDelete,
}: {
  lane: Lane;
  items: Todo[];
  laneIsOver: boolean;
  draggingDisabled: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: laneNodeId(lane.key),
    data: { type: 'lane', lane: lane.key },
  });

  const effectiveIsOver = laneIsOver || isOver;

  return (
    <section
      ref={setNodeRef}
      className={`bg-white/70 rounded-xl border p-3 transition-colors ${
        effectiveIsOver ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-gray-200/60'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${lane.dotColor}`} />
          <h3 className="text-sm font-bold">{lane.label}</h3>
          <span className={`${lane.badgeBg} ${lane.badgeText} text-[11px] px-2 py-0.5 rounded-full font-semibold`}>{items.length}</span>
        </div>
      </div>

      <SortableContext items={items.map((todo) => todoNodeId(todo.id))} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5 min-h-[220px]">
          {items.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={draggingDisabled}
            />
          ))}

          {items.length === 0 && (
            <div
              className={`text-center text-[13px] py-6 rounded-lg border border-dashed transition-colors ${
                effectiveIsOver ? 'border-primary/40 bg-primary/5 text-primary' : 'border-transparent text-muted'
              }`}
            >
              {effectiveIsOver ? 'Drop here' : lane.emptyLabel}
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
