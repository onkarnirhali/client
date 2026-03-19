import { useEffect, useState } from 'react';
import { Todo, TodoInput } from '../../features/todos';
import { rephraseDescription } from '../../api/ai';
import { HttpError } from '../../api/http';
import { useSnackbar } from '../feedback/SnackbarProvider';
import { UiPriority, UiStatus, apiPriorityFromUi, apiStatusFromUi, uiPriorityFromApi, uiStatusFromApi } from '../../features/todos/mapping';
import {
  AddNotesMenuButton,
  LinkExistingNotesDialog,
  LinkedNoteChip,
  LinkedNotesChips,
  NoteEditorDialog,
} from '../notes';
import { NoteInput, NoteSummary } from '../../features/notes';

type Mode = 'create' | 'edit';

type FormState = {
  title: string;
  description: string;
  status: UiStatus;
  priority: UiPriority;
  dueDate: string;
};

type Props = {
  open: boolean;
  mode: Mode;
  initial?: Todo | null;
  onClose: () => void;
  onSubmit: (payload: TodoInput) => Promise<void>;
  submitting?: boolean;
};

const defaultState: FormState = {
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Normal',
  dueDate: '',
};

function toDateInput(value: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function TodoFormDialog({ open, mode, initial, onClose, onSubmit, submitting }: Props) {
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [linkExistingOpen, setLinkExistingOpen] = useState(false);
  const [linkedExistingNotes, setLinkedExistingNotes] = useState<Array<{ id: number; title: string; isPasswordProtected: boolean }>>([]);
  const [newNoteDrafts, setNewNoteDrafts] = useState<Array<{ key: string; payload: NoteInput }>>([]);
  const { notify } = useSnackbar();

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          title: initial.title || '',
          description: initial.description || '',
          status: uiStatusFromApi(initial.status),
          priority: uiPriorityFromApi(initial.priority),
          dueDate: toDateInput(initial.dueDate),
        });
        setLinkedExistingNotes(initial.linkedNotes || []);
      } else {
        setForm(defaultState);
        setLinkedExistingNotes([]);
      }
      setNewNoteDrafts([]);
      setErrors({});
    }
  }, [open, initial]);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const payload: TodoInput = {
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      status: apiStatusFromUi(form.status),
      priority: apiPriorityFromUi(form.priority),
      dueDate: form.dueDate ? new Date(`${form.dueDate}T00:00:00.000Z`).toISOString() : null,
      notes: {
        linkedNoteIds: linkedExistingNotes.map((note) => note.id),
        newNotes: newNoteDrafts.map((draft) => draft.payload),
      },
    };
    await onSubmit(payload);
  };

  const handleRephrase = async () => {
    const current = form.description.trim();
    if (!current) {
      notify('Add a description first so AI knows what to polish.', 'info');
      return;
    }
    setAiLoading(true);
    try {
      const rephrased = await rephraseDescription(current);
      setForm((prev) => ({ ...prev, description: rephrased }));
      notify('Description polished with AI', 'success');
    } catch (err) {
      const message = err instanceof HttpError ? err.message : 'Unable to rephrase description right now.';
      notify(message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const combinedLinkedChips: LinkedNoteChip[] = [
    ...linkedExistingNotes.map((note) => ({
      key: `existing-${note.id}`,
      label: note.title,
      isPasswordProtected: note.isPasswordProtected,
      isNew: false,
    })),
    ...newNoteDrafts.map((draft) => ({
      key: draft.key,
      label: draft.payload.title,
      isPasswordProtected: Boolean(draft.payload.passwordProtection?.enabled),
      isNew: true,
    })),
  ];

  if (!open) return null;

  return (
    <>
      <div className="dialog-overlay" onClick={submitting ? undefined : onClose} />
      <div className="dialog-content panel p-6 grid gap-5">
        <h2 className="text-lg font-extrabold">{mode === 'create' ? 'New Todo' : 'Edit Todo'}</h2>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="field-label">Title</label>
            <input
              className={`input ${errors.title ? 'border-danger' : ''}`}
              type="text"
              value={form.title}
              onChange={handleChange('title')}
              autoFocus
              placeholder="Task title"
            />
            {errors.title && <span className="text-danger text-xs">{errors.title}</span>}
          </div>

          <div className="grid gap-1.5">
            <label className="field-label">Description</label>
            <div className="flex gap-2 items-stretch">
              <textarea
                className="textarea-field flex-1"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Task description..."
                rows={3}
              />
              <button
                className="btn btn-secondary text-xs whitespace-nowrap self-stretch"
                onClick={handleRephrase}
                disabled={aiLoading || submitting}
              >
                {aiLoading ? 'Polishing...' : 'Polish with AI'}
              </button>
            </div>
          </div>

          <div>
            <AddNotesMenuButton
              disabled={submitting}
              onNewNote={() => setNewNoteDialogOpen(true)}
              onLinkExisting={() => setLinkExistingOpen(true)}
            />
            <LinkedNotesChips
              items={combinedLinkedChips}
              disabled={submitting}
              onRemove={(key) => {
                if (key.startsWith('existing-')) {
                  const id = Number(key.replace('existing-', ''));
                  setLinkedExistingNotes((prev) => prev.filter((item) => item.id !== id));
                  return;
                }
                setNewNoteDrafts((prev) => prev.filter((item) => item.key !== key));
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <span className="field-label">Status</span>
              <div className="grid gap-1.5">
                {(['To Do', 'In Progress', 'Done'] as UiStatus[]).map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => setForm((prev) => ({ ...prev, status: s }))}
                      className="accent-primary"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2 content-start">
              <span className="field-label">Priority</span>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-[var(--radius-sm)] border border-border">
                {(['Low', 'Normal', 'High'] as UiPriority[]).map((option) => {
                  const selected = form.priority === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, priority: option }))}
                      className={`min-h-[36px] rounded-[var(--radius-xs)] text-sm font-bold transition-colors cursor-pointer ${
                        selected
                          ? 'bg-primary-soft text-primary-strong'
                          : 'text-muted hover:bg-white/60'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="field-label">Due Date</label>
            <input className="input" type="date" value={form.dueDate} onChange={handleChange('dueDate')} />
          </div>
        </div>

        {submitting && <p className="text-muted text-sm">Saving...</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      <NoteEditorDialog
        open={newNoteDialogOpen}
        title="Create New Note"
        saveLabel="Save Note Draft"
        onClose={() => setNewNoteDialogOpen(false)}
        onSave={async (payload) => {
          setNewNoteDrafts((prev) => [...prev, { key: `new-${Date.now()}-${prev.length}`, payload }]);
          setNewNoteDialogOpen(false);
          notify('Note draft added to task', 'success');
        }}
      />

      <LinkExistingNotesDialog
        open={linkExistingOpen}
        linkedNoteIds={linkedExistingNotes.map((note) => note.id)}
        onClose={() => setLinkExistingOpen(false)}
        onLink={(notes: NoteSummary[]) => {
          setLinkedExistingNotes((prev) => {
            const byId = new Map(prev.map((item) => [item.id, item]));
            for (const note of notes) {
              byId.set(note.id, {
                id: note.id,
                title: note.title,
                isPasswordProtected: note.isPasswordProtected,
              });
            }
            return Array.from(byId.values());
          });
          notify('Notes linked to task draft', 'success');
        }}
      />
    </>
  );
}
