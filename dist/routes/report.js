"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Route to create new collected data
//-------------------------------------------------------------
router.get('/get-reports', authMiddleware_1.authenticateUser, authMiddleware_1.authorizeAdmin, reportController_1.getReports);
exports.default = router;
