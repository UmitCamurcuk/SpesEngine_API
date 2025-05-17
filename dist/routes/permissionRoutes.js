"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const permissionController_1 = require("../controllers/permissionController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['PERMISSIONS_VIEW']), permissionController_1.getPermissions)
    .post((0, auth_middleware_1.checkAccess)(['PERMISSIONS_CREATE']), permissionController_1.createPermission);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['PERMISSIONS_VIEW']), permissionController_1.getPermissionById)
    .put((0, auth_middleware_1.checkAccess)(['PERMISSIONS_UPDATE']), permissionController_1.updatePermission)
    .delete((0, auth_middleware_1.checkAccess)(['PERMISSIONS_DELETE']), permissionController_1.deletePermission);
exports.default = router;
