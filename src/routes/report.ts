
import { Router } from 'express';
import { getReports } from '../controllers/reportController';
import { authenticateUser,authorizeAdmin } from '../middleware/authMiddleware';

const router = Router();
// Route to create new collected data
//-------------------------------------------------------------
router.get('/get-reports',authenticateUser, authorizeAdmin, getReports);


export default router;
