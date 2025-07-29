import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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

function Notes() {
  const { logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (selectedNote) {
          const updatedNote = await noteService.updateNote(
            selectedNote.id,
            values.title,
            values.content
          );
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id === updatedNote.id ? updatedNote : note
            )
          );
        } else {
          const newNote = await noteService.createNote(
            values.title,
            values.content
          );
          setNotes((prevNotes) => [...prevNotes, newNote]);
        }
        handleClose();
        resetForm();
        toast.success(selectedNote ? 'Note updated successfully' : 'Note created successfully');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to save note';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
  });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await noteService.getNotes();
        setNotes(fetchedNotes);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch notes';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchNotes();
  }, []);

  const handleClickOpen = () => {
    setSelectedNote(null);
    formik.resetForm();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNote(null);
    formik.resetForm();
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    formik.setValues({
      title: note.title,
      content: note.content,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      toast.success('Note deleted successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete note';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Notes
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {error && (
          <Typography color="error" align="center" gutterBottom>
            {error}
          </Typography>
        )}

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClickOpen}
          >
            Add Note
          </Button>
        </Box>

        <Paper elevation={3}>
          <List>
            {notes.map((note) => (
              <ListItem
                key={note.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEdit(note)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(note.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={note.title}
                  secondary={note.content}
                  secondaryTypographyProps={{
                    style: {
                      whiteSpace: 'pre-wrap',
                      maxHeight: '100px',
                      overflow: 'hidden',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Dialog
          open={open}
          onClose={handleClose}
          fullScreen={isMobile}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedNote ? 'Edit Note' : 'Add New Note'}
          </DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                margin="normal"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
              <TextField
                fullWidth
                id="content"
                name="content"
                label="Content"
                margin="normal"
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
              <Button type="submit" variant="contained" color="primary">
                {selectedNote ? 'Save' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </>
  );
}

export default Notes;
