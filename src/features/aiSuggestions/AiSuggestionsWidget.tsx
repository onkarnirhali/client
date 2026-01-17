import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { AiSuggestion } from '../../api/ai';
import {
  useAcceptSuggestion,
  useAddTodoFromSuggestion,
  useAiSuggestions,
  useBulkDismiss,
  useDismissSuggestion,
  useRefreshAiSuggestions,
  useSuggestionsPolling,
} from './hooks';
import { useSnackbar } from '../../components/feedback/SnackbarProvider';

type Props = {
  anchor?: 'bottom-right';
};

export function AiSuggestionsWidget({ anchor = 'bottom-right' }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { notify } = useSnackbar();
  const { data = [], isLoading, refetch, dismissedRef, isFetching, error } = useAiSuggestions();
  const refreshMutation = useRefreshAiSuggestions();
  const acceptMutation = useAcceptSuggestion();
  const dismissMutation = useDismissSuggestion(dismissedRef);
  const bulkDismissMutation = useBulkDismiss(dismissedRef);
  const addMutation = useAddTodoFromSuggestion();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const count = data.length;
  const hasSuggestions = count > 0;

  useSuggestionsPolling({
    enabled: true,
    hasSuggestions,
    refetch,
  });

  useEffect(() => {
    if (error) {
      notify(error instanceof Error ? error.message : 'Failed to load AI suggestions', 'error');
      console.error('AI suggestions error', error);
    }
  }, [error, notify]);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const handleClose = () => setOpen(false);

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync();
      await refetch();
      notify('Suggestions refreshed', 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to refresh suggestions', 'error');
      console.error('Refresh suggestions failed', err);
    }
  };

  const handleAdd = async (s: AiSuggestion) => {
    try {
      await addMutation.mutateAsync({ suggestion: s });
      await acceptMutation.mutateAsync(s.id).catch(() => undefined);
      notify('Added to Todos', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to add suggestion', 'error');
    }
  };

  const handleDismiss = async (s: AiSuggestion) => {
    try {
      await dismissMutation.mutateAsync(s.id);
      notify('Suggestion dismissed', 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to dismiss', 'error');
    }
  };

  const handleAddAll = async () => {
    if (!data.length) return;
    try {
      for (const s of data) {
        await handleAdd(s);
      }
      notify('All suggestions added', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to add all', 'error');
    }
  };

  const handleDismissAll = async () => {
    if (!data.length) return;
    const confirmed = window.confirm('Dismiss all suggestions?');
    if (!confirmed) return;
    try {
      const ids = data.map((s) => s.id);
      await bulkDismissMutation.mutateAsync(ids);
      notify('Dismissed all suggestions', 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to dismiss all', 'error');
    }
  };

  const content = (
    <Paper
      elevation={4}
      sx={{
        width: isMobile ? '100%' : 380,
        maxHeight: isMobile ? '70vh' : 520,
        borderRadius: isMobile ? '16px 16px 0 0' : 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          AI Suggestions
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Refresh">
            <span>
              <IconButton size="small" onClick={handleRefresh} disabled={refreshMutation.isPending || isFetching}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton size="small" onClick={handleClose} aria-label="Close suggestions">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {(isLoading || isFetching || refreshMutation.isPending) && (
        <Stack alignItems="center" spacing={1.5} sx={{ py: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading suggestions...
          </Typography>
        </Stack>
      )}

      {!isLoading && !isFetching && data.length === 0 && (
        <Stack alignItems="center" spacing={1} sx={{ py: 4, px: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No suggestions right now
          </Typography>
          <Button size="small" variant="outlined" onClick={handleRefresh} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </Stack>
      )}

      {data.length > 0 && (
        <>
          <Stack direction="row" spacing={1} sx={{ px: 2, pt: 1, pb: 1 }} justifyContent="flex-end">
            <Button
              size="small"
              startIcon={<PlaylistAddIcon />}
              onClick={handleAddAll}
              disabled={addMutation.isPending || acceptMutation.isPending}
            >
              Add All
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<ClearAllIcon />}
              onClick={handleDismissAll}
              disabled={bulkDismissMutation.isPending}
            >
              Dismiss All
            </Button>
          </Stack>
          <Divider />
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List dense disablePadding>
              {data.map((s) => (
                <ListItem
                  key={s.id}
                  alignItems="flex-start"
                  sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'rgba(15,17,26,0.05)' }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Add to Todos">
                        <span>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleAdd(s)}
                            disabled={addMutation.isPending}
                            aria-label="Add suggestion to todos"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Dismiss">
                        <span>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDismiss(s)}
                            disabled={dismissMutation.isPending}
                            aria-label="Dismiss suggestion"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                      <TipsAndUpdatesIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {s.title}
                      </Typography>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        {s.detail && (
                          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                            {s.detail}
                          </Typography>
                        )}
                        {typeof s.confidence === 'number' && (
                          <Typography variant="caption" color="text.secondary">
                            Confidence: {(s.confidence * 100).toFixed(0)}%
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </>
      )}
    </Paper>
  );

  const bubble = (
    <Tooltip title={hasSuggestions ? 'AI Suggestions' : 'No suggestions'}>
      <Badge
        color={hasSuggestions ? 'primary' : 'default'}
        overlap="circular"
        badgeContent={hasSuggestions ? count : 0}
        invisible={!hasSuggestions}
      >
        <IconButton
          aria-label="Open AI suggestions"
          onClick={handleToggle}
          color="primary"
          sx={{
            width: 56,
            height: 56,
            boxShadow: 3,
            backgroundColor: '#fff',
            border: '1px solid',
            borderColor: 'rgba(15,17,26,0.08)',
            position: anchor === 'bottom-right' ? 'fixed' : 'relative',
            bottom: anchor === 'bottom-right' ? 24 : undefined,
            right: anchor === 'bottom-right' ? 24 : undefined,
            zIndex: 10,
          }}
        >
          <TipsAndUpdatesIcon />
        </IconButton>
      </Badge>
    </Tooltip>
  );

  if (isMobile) {
    return (
      <>
        {bubble}
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          PaperProps={{ sx: { borderTopLeftRadius: 18, borderTopRightRadius: 18, height: '65vh' } }}
        >
          {content}
        </Drawer>
      </>
    );
  }

  return (
    <>
      {bubble}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="top-end"
        transition
        modifiers={[
          { name: 'offset', options: { offset: [0, 12] } },
          { name: 'preventOverflow', options: { padding: 8 } },
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={120}>
            <Box sx={{ zIndex: 1300 }}>{content}</Box>
          </Fade>
        )}
      </Popper>
    </>
  );
}
