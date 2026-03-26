import { useEffect, useState } from 'react';
import type { Todo, TodoInput, TodoStatus } from '../../api/todos';
import { rephraseDescription } from '../../api/ai';
import { HttpError } from '../../api/http';
import { useSnackbar } from '../feedback/SnackbarProvider';
import { UiPriority, apiPriorityFromUi, uiPriorityFromApi, todoStatusOptions } from '../../features/todos/mapping';
import {
  AddNotesMenuButton,
  LinkExistingNotesDialog,
  LinkedNoteChip,
  LinkedNotesChips,
  NoteEditorDialog,
} from '../notes';
import type { NoteInput, NoteSummary } from '../../features/notes';

type Mode = 'create' | 'edit';

type FormState = {
  title: string;
  description: string;
  status: TodoStatus;
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
  status: 'todo',
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
          status: initial.status,
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
      status: form.status,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="dialog-overlay absolute inset-0" onClick={submitting ? undefined : onClose} />
        <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{mode === 'create' ? 'New Todo' : 'Edit Todo'}</h2>
              <button
                onClick={onClose}
                disabled={submitting}
                className="text-muted hover:text-text p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Title <span className="text-red-500">*</span></label>
              <input
                className={`w-full px-3 py-2.5 text-sm border rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                type="text"
                value={form.title}
                onChange={handleChange('title')}
                autoFocus
                placeholder="What needs to be done?"
              />
              {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title}</span>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <div className="relative">
                <textarea
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  value={form.description}
                  onChange={handleChange('description')}
                  placeholder="Add more details..."
                  rows={3}
                />
                <button
                  className="absolute right-2 bottom-2 text-[11px] text-primary font-medium bg-primary/10 px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                  onClick={handleRephrase}
                  disabled={aiLoading || submitting}
                  title="AI Polish"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  {aiLoading ? 'Polishing...' : 'AI Polish'}
                </button>
              </div>
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <div className="flex border border-gray-200 rounded-[10px] overflow-hidden">
                  {todoStatusOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: option.value }))}
                      className={`flex-1 py-2 text-xs font-medium transition-colors ${
                        form.status === option.value
                          ? 'font-semibold bg-primary/10 text-primary'
                          : 'text-muted hover:bg-gray-50'
                      } ${index < todoStatusOptions.length - 1 ? 'border-r border-gray-200' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Priority</label>
                <div className="flex border border-gray-200 rounded-[10px] overflow-hidden">
                  {(['Low', 'Normal', 'High'] as UiPriority[]).map((option, i) => {
                    const selected = form.priority === option;
                    let activeCls = '';
                    if (selected) {
                      if (option === 'High') activeCls = 'bg-orange-50 text-orange-700 font-semibold';
                      else if (option === 'Normal') activeCls = 'bg-yellow-50 text-yellow-800 font-semibold';
                      else activeCls = 'bg-gray-100 text-gray-700 font-semibold';
                    }
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, priority: option }))}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${
                          selected ? activeCls : 'text-muted hover:bg-gray-50'
                        } ${i < 2 ? 'border-r border-gray-200' : ''}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Due Date</label>
              <input
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                type="date"
                value={form.dueDate}
                onChange={handleChange('dueDate')}
              />
            </div>

            {/* Linked Notes */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Linked Notes</label>
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
              <AddNotesMenuButton
                disabled={submitting}
                onNewNote={() => setNewNoteDialogOpen(true)}
                onLinkExisting={() => setLinkExistingOpen(true)}
              />
            </div>

            {submitting && <p className="text-muted text-sm">Saving...</p>}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-[#f6f6f8]/50 flex justify-end gap-3 rounded-b-2xl">
            <button
              className="px-4 py-2.5 text-sm font-medium text-muted border border-gray-200 rounded-[10px] hover:bg-white transition-colors"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-[10px] hover:opacity-90 transition-colors shadow-sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {mode === 'create' ? 'Create Todo' : 'Save Changes'}
            </button>
          </div>
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
