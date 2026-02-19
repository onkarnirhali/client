import { Chip, Stack, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

export type LinkedNoteChip = {
  key: string;
  label: string;
  isPasswordProtected?: boolean;
  isNew?: boolean;
};

type Props = {
  items: LinkedNoteChip[];
  onRemove: (key: string) => void;
  disabled?: boolean;
};

export function LinkedNotesChips({ items, onRemove, disabled = false }: Props) {
  if (!items.length) return null;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Linked Notes</Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {items.map((item) => (
          <Chip
            key={item.key}
            label={`${item.label}${item.isNew ? ' (new)' : ''}`}
            onDelete={disabled ? undefined : () => onRemove(item.key)}
            icon={item.isPasswordProtected ? <LockIcon /> : undefined}
            variant="outlined"
          />
        ))}
      </Stack>
    </Stack>
  );
}

