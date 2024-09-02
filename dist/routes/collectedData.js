"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salesmanController_1 = require("../controllers/salesmanController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const reportController_1 = require("../controllers/reportController");
const router = (0, express_1.Router)();
// Route to create new collected data
router.post('/data', authMiddleware_1.authenticateUser, authMiddleware_1.authorizeSalesman, salesmanController_1.createCollectedData);
router.put('/update/:id', authMiddleware_1.authenticateUser, salesmanController_1.updateCollectedData);
router.delete('/delete/:id', authMiddleware_1.authenticateUser, salesmanController_1.deleteCollectedData);
router.get('/get-data', authMiddleware_1.authenticateUser, authMiddleware_1.authorizeSalesman, salesmanController_1.getCollectedDataBySalesman);
router.get('/get-count', authMiddleware_1.authenticateUser, authMiddleware_1.authorizeSalesman, salesmanController_1.getCollectedCountBySalesman);
//-------------------------------------------------------------
router.get('/get', authMiddleware_1.authenticateUser, reportController_1.getReports);
router.get('/get-all', authMiddleware_1.authenticateUser, salesmanController_1.getAllCollection);
exports.default = router;
