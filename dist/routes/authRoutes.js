"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Açık rotalar
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/refresh-token', authController_1.refreshToken);
// Test endpoint
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Auth routes çalışıyor' });
});
// Korumalı rotalar
router.get('/me', auth_middleware_1.authenticateToken, authController_1.getMe);
router.post('/logout', auth_middleware_1.authenticateToken, authController_1.logout);
router.get('/refresh-permissions', auth_middleware_1.authenticateToken, authController_1.refreshPermissions);
router.put('/profile', auth_middleware_1.authenticateToken, authController_1.updateProfile);
router.post('/avatar', auth_middleware_1.authenticateToken, authController_1.uploadAvatar);
exports.default = router;
