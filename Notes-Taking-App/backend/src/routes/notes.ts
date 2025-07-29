import { Router } from 'express';
import { getNotes, createNote, deleteNote } from '../controllers/noteController';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth); // Protect all note routes

router.get('/', getNotes);
router.post('/', createNote);
router.delete('/:id', deleteNote);

export default router;
