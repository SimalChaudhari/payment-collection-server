
import { Router } from 'express';
import { getReports } from '../controllers/reportController';

const router = Router();
// Route to create new collected data
//-------------------------------------------------------------
router.get('/get-reports', getReports);


export default router;
