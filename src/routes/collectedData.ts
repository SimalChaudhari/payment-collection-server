import { Router } from 'express';
import { createCollectedData, deleteCollectedData, getAllCollection, getCollectedCountBySalesman, getCollectedDataBySalesman, updateCollectedData, verifyPayment } from '../controllers/salesmanController';
import { authenticateUser, authorizeAdmin, authorizeSalesman } from '../middleware/authMiddleware';
import { getReports } from '../controllers/reportController';

const router = Router();
// Route to create new collected data
router.post('/data', authenticateUser, authorizeSalesman, createCollectedData);
router.put('/update/:id',  updateCollectedData);
router.delete('/delete/:id', deleteCollectedData);

router.get('/get-data', authenticateUser, authorizeSalesman, getCollectedDataBySalesman);
router.get('/get-count', authenticateUser, authorizeSalesman, getCollectedCountBySalesman);

//-------------------------------------------------------------
router.get('/get', getReports);
router.get('/verify/:token', verifyPayment);
router.get('/get-all', getAllCollection);

export default router;
