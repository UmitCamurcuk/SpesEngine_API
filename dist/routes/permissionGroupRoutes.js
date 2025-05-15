"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const permissionGroupController_1 = require("../controllers/permissionGroupController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Tüm routelar korumalı
router.use(auth_1.protect);
router
    .route('/')
    .get((0, auth_1.checkPermission)('permissions:read'), permissionGroupController_1.getPermissionGroups)
    .post((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('permissions:create'), permissionGroupController_1.createPermissionGroup);
router
    .route('/:id')
    .get((0, auth_1.checkPermission)('permissions:read'), permissionGroupController_1.getPermissionGroupById)
    .put((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('permissions:update'), permissionGroupController_1.updatePermissionGroup)
    .delete((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('permissions:delete'), permissionGroupController_1.deletePermissionGroup);
exports.default = router;
