"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const permissionGroupController_1 = require("../controllers/permissionGroupController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['PERMISSION_GROUPS_VIEW']), permissionGroupController_1.getPermissionGroups)
    .post((0, auth_middleware_1.checkAccess)(['PERMISSION_GROUPS_CREATE']), permissionGroupController_1.createPermissionGroup);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['PERMISSION_GROUPS_VIEW']), permissionGroupController_1.getPermissionGroupById)
    .put((0, auth_middleware_1.checkAccess)(['PERMISSION_GROUPS_UPDATE']), permissionGroupController_1.updatePermissionGroup)
    .delete((0, auth_middleware_1.checkAccess)(['PERMISSION_GROUPS_DELETE']), permissionGroupController_1.deletePermissionGroup);
// Permission group'a permission ekleme/çıkarma
router
    .route('/:id/permissions')
    .post((0, auth_middleware_1.checkAccess)(['PERMISSION_GROUPS_UPDATE']), permissionGroupController_1.addPermissionToGroup);
router
    .route('/:id/permissions/:permissionId')
    .delete((0, auth_middleware_1.checkAccess)(['PERMISSION_GROUPS_UPDATE']), permissionGroupController_1.removePermissionFromGroup);
exports.default = router;
