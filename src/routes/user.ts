import { Router } from 'express';
import { createAddress, createUser, deleteAddress, deleteUser, getAddress, getAllUsersByRole, getCounts, getCustomerVerifyCounts, getUserById, updateAddress, updateUser } from '../controllers/userController';
import { authenticateUser, authorizeAdmin } from '../middleware/authMiddleware';
import { getAllCollection, getCustomerData, verifyPayment } from '../controllers/salesmanController';
import { getSeenNotifications, markNotificationAsSeen } from '../controllers/notificationController';

const router = Router();

// Login (Salesman or Customer)
router.post('/create',  createUser);
router.put('/update/:id', authenticateUser, updateUser);
router.delete('/delete/:id', authenticateUser, authorizeAdmin, deleteUser);
router.get('/get-user', authenticateUser, getAllUsersByRole);
router.get('/get/:id', authenticateUser, authorizeAdmin, getUserById);
router.get('/payment-history', authenticateUser, getAllCollection);
router.get('/payment-verified', authenticateUser, getCustomerData);
router.get('/customer-verified-count', authenticateUser, getCustomerVerifyCounts);

router.get('/total', authenticateUser, getCounts);
router.put('/verify/:id', authenticateUser, verifyPayment);

router.get('/notification/:id', authenticateUser, getSeenNotifications);
router.put('/seen/:id', authenticateUser, markNotificationAsSeen);


// Address
router.post('/create-address', authenticateUser, authorizeAdmin, createAddress);
router.put('/update-address/:id', authenticateUser, authorizeAdmin, updateAddress);
router.delete('/delete-address/:id', authenticateUser, authorizeAdmin, deleteAddress);
router.get('/get-address', authenticateUser, authorizeAdmin, getAddress);



export default router;
