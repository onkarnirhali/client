import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { NoteContent } from '../../features/notes';

export const EMPTY_NOTE_CONTENT: NoteContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

type Props = {
  value: NoteContent;
  onChange?: (next: NoteContent) => void;
  editable?: boolean;
};

function ToolbarChip({
  label,
  onClick,
  active = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`toolbar-chip ${active ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );
}

export function NoteEditor({ value, onChange, editable = true }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: !editable,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: value || EMPTY_NOTE_CONTENT,
    editable,
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getJSON() as NoteContent);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(value || EMPTY_NOTE_CONTENT);
    if (current !== incoming) {
      editor.commands.setContent((value || EMPTY_NOTE_CONTENT) as any, { emitUpdate: false });
    }
    editor.setEditable(editable);
  }, [editor, value, editable]);

  if (!editor) return null;

  const promptForLink = () => {
    if (!editable) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className="border border-border rounded-[var(--radius-md)] overflow-hidden">
      <div className="toolbar">
        <ToolbarChip
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={!editable}
        />
        <ToolbarChip
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={!editable}
        />
        <ToolbarChip
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          disabled={!editable}
        />
        <ToolbarChip
          label="Link"
          onClick={promptForLink}
          active={editor.isActive('link')}
          disabled={!editable}
        />
        <ToolbarChip
          label="Code"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          disabled={!editable}
        />
        <ToolbarChip
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          disabled={!editable}
        />
        <ToolbarChip
          label="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          disabled={!editable}
        />
        <ToolbarChip
          label="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          disabled={!editable}
        />
      </div>
      <div className="editor-body">
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 150px;
          white-space: pre-wrap;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror pre {
          background: rgba(15,17,26,0.08);
          border-radius: 4px;
          padding: 0.75rem;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
