import { ReactNode, useEffect } from 'react';
import { Box, Divider, IconButton, Stack, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
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

function ToolbarButton({
  title,
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            color: active ? 'primary.main' : 'text.secondary',
            bgcolor: active ? 'rgba(30, 63, 174, 0.08)' : 'transparent',
            borderRadius: 1,
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
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
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ px: 1, py: 0.75, bgcolor: 'rgba(15,17,26,0.02)', flexWrap: 'wrap' }}
      >
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={!editable}
        >
          <FormatBoldIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={!editable}
        >
          <FormatItalicIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          disabled={!editable}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          title="Hyperlink"
          onClick={promptForLink}
          active={editor.isActive('link')}
          disabled={!editable}
        >
          <LinkIcon fontSize="small" />
        </ToolbarButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <ToolbarButton
          title="Code snippet"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          disabled={!editable}
        >
          <CodeIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          title="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          disabled={!editable}
        >
          <FormatQuoteIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          disabled={!editable}
        >
          <FormatListBulletedIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          disabled={!editable}
        >
          <FormatListNumberedIcon fontSize="small" />
        </ToolbarButton>
      </Stack>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          minHeight: 180,
          maxHeight: 420,
          overflowY: 'auto',
          '& .ProseMirror': {
            outline: 'none',
            minHeight: 150,
            whiteSpace: 'pre-wrap',
          },
          '& .ProseMirror p': {
            margin: '0.5em 0',
          },
          '& pre': {
            backgroundColor: 'rgba(15,17,26,0.08)',
            borderRadius: 1,
            padding: '0.75rem',
            overflowX: 'auto',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
