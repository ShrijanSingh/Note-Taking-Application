import { Router } from 'express';
import { login, signup, googleAuth, verifyOtp, requestOtp } from '../controllers/authController';

const router = Router();

router.post('/signup', signup);
router.post('/register', signup);  // Alias for signup
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify-otp', verifyOtp);
router.post('/otp/request', requestOtp);

export default router;
