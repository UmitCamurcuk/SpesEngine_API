"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const permissionController_1 = require("../controllers/permissionController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Tüm routelar korumalı
router.use(auth_1.protect);
router
    .route('/')
    .get((0, auth_1.checkPermission)('permissions:read'), permissionController_1.getPermissions)
    .post((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('permissions:create'), permissionController_1.createPermission);
router
    .route('/:id')
    .get((0, auth_1.checkPermission)('permissions:read'), permissionController_1.getPermissionById)
    .put((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('permissions:update'), permissionController_1.updatePermission)
    .delete((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('permissions:delete'), permissionController_1.deletePermission);
exports.default = router;
