import { Router } from 'express';
import { login, RequestPasswordReset, ResetNewPassword, ResetPassword, VerifyOtp } from '../controllers/authController';

const router = Router();

// Login (Salesman or Customer)
router.post('/login', login);
router.post('/reset-password', ResetPassword); // inside login
router.post('/forget-password', RequestPasswordReset);
router.post('/otp-verify', VerifyOtp);
router.post('/new-password', ResetNewPassword); // outside login


export default router;
