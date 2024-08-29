import { Router } from 'express';
import { login, ResetPassword } from '../controllers/authController';

const router = Router();

// Login (Salesman or Customer)
router.post('/login', login);
router.post('/reset-password', ResetPassword);

export default router;
