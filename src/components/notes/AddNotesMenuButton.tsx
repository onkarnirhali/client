import { MouseEvent, useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

type Props = {
  disabled?: boolean;
  onNewNote: () => void;
  onLinkExisting: () => void;
};

export function AddNotesMenuButton({ disabled = false, onNewNote, onLinkExisting }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => setAnchor(null);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<NoteAddIcon />}
        onClick={handleOpen}
        disabled={disabled}
      >
        Add Notes
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onNewNote();
          }}
        >
          New Note
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onLinkExisting();
          }}
        >
          Link Existing Notes
        </MenuItem>
      </Menu>
    </>
  );
}

