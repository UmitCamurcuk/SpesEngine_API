"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Koruma middleware'i uygula
router.use(auth_1.protect);
// Rota tanımlamaları
router
    .route('/')
    .get((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('users:read'), userController_1.getUsers)
    .post((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('users:create'), userController_1.createUser);
router
    .route('/:id')
    .get((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('users:read'), userController_1.getUser)
    .put((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('users:update'), userController_1.updateUser)
    .delete((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('users:delete'), userController_1.deleteUser);
exports.default = router;
