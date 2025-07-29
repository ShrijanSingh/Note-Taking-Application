// src/components/Notes.tsx
import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Container,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { noteService } from '../services/api';
import type { Note } from '../types';
import { useAuth } from '../context/AuthContext';

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required'),
});

export default function Notes() {
  const { logout, user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formik = useFormik({
    initialValues: { title: '', content: '' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (selectedNote) {
          const updated = await noteService.updateNote(
            selectedNote.id,
            values.title,
            values.content
          );
          setNotes((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        } else {
          const created = await noteService.createNote(
            values.title,
            values.content
          );
          setNotes((prev) => [...prev, created]);
        }
        toast.success(selectedNote ? 'Note updated' : 'Note created');
        handleClose();
        resetForm();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Error';
        setError(msg);
        toast.error(msg);
      }
    },
  });

  useEffect(() => {
    noteService
      .getNotes()
      .then(setNotes)
      .catch((err: any) => {
        const msg = err.response?.data?.message || 'Fetch failed';
        setError(msg);
        toast.error(msg);
      });
  }, []);

  const handleClickOpen = (note?: Note) => {
    setSelectedNote(note || null);
    formik.resetForm({ values: note ? { title: note.title, content: note.content } : undefined });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedNote(null);
    formik.resetForm();
  };
  const handleDelete = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Deleted');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Delete failed';
      setError(msg);
      toast.error(msg);
    }
  };
  const handleLogout = () => logout();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', background: '#fff', borderRight: '1px solid #e0e0e0' },
        }}
      >
        <Toolbar />
        <List>
          <ListItemButton selected sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 18 }}>
            Dashboard
          </ListItemButton>
          <ListItemButton onClick={handleLogout} sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 18 }}>
            Sign Out
          </ListItemButton>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, background: '#1976d2' }}>
          <Toolbar>
            <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700 }}>
              Notes Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />

        <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ width: '100%', maxWidth: 500, mb: 4 }}>
            <Card elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                Welcome, {user?.name || 'User'}!
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mb: 2 }}>
                Email: {user?.email || 'xxxxxx@xxxx.com'}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleClickOpen()}
                  sx={{ textTransform: 'none', borderRadius: 2, px: 4, py: 1.5, fontWeight: 600, fontSize: 16 }}
                >
                  Create Note
                </Button>
              </Box>
            </Card>
          </Box>

          <Box sx={{ width: '100%', maxWidth: 900, flex: 1 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              My Notes
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              {notes.map((note, idx) => (
                <Card
                  key={note.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 140,
                    border: '1px solid #e0e0e0',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                    p: 2,
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 18, mb: 1 }}>{`Note ${idx + 1}: ${note.title}`}</Typography>
                    <Typography sx={{ color: '#555', fontSize: 15 }}>{note.content}</Typography>
                  </CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      onClick={() => handleClickOpen(note)}
                      sx={{ textTransform: 'none', mr: 1, fontWeight: 500 }}
                    >
                      Edit
                    </Button>
                    <IconButton onClick={() => handleDelete(note.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>

          <Dialog
            open={open}
            onClose={handleClose}
            fullScreen={isMobile}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {selectedNote
                ? (() => {
                    const idx = notes.findIndex((n) => n.id === selectedNote.id);
                    return idx !== -1 ? `Note ${idx + 1} - Edit Note` : 'Edit Note';
                  })()
                : `Note ${notes.length + 1} - Add Note`}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
              <DialogContent>
                <TextField
                  fullWidth
                  margin="normal"
                  id="title"
                  name="title"
                  label="Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  id="content"
                  name="content"
                  label="Content"
                  multiline
                  rows={4}
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  error={formik.touched.content && Boolean(formik.errors.content)}
                  helperText={formik.touched.content && formik.errors.content}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained">
                  {selectedNote ? 'Save' : 'Add'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
}

// export default Notes;
