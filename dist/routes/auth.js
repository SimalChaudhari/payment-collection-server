"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Login (Salesman or Customer)
router.post('/login', authController_1.login);
router.post('/reset-password', authController_1.ResetPassword);
exports.default = router;
