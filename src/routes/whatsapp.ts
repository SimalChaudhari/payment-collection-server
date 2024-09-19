import { Router } from 'express';
import { authenticateUser,authorizeAdmin } from '../middleware/authMiddleware';
import { createWhatsAppSetting, getAllWhatsAppSettings,updateWhatsAppSettings } from '../controllers/whatsappController';

const router = Router();
// Route to create new collected data
//-------------------------------------------------------------
router.post('/setting',authenticateUser, authorizeAdmin, createWhatsAppSetting);~
router.put('/update',authenticateUser, authorizeAdmin, updateWhatsAppSettings);
router.get('/get-data',authenticateUser, authorizeAdmin, getAllWhatsAppSettings);

export default router;
