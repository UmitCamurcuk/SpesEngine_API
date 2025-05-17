"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const roleController_1 = require("../controllers/roleController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['ROLES_VIEW']), roleController_1.getRoles)
    .post((0, auth_middleware_1.checkAccess)(['ROLES_CREATE']), roleController_1.createRole);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['ROLES_VIEW']), roleController_1.getRoleById)
    .put((0, auth_middleware_1.checkAccess)(['ROLES_UPDATE']), roleController_1.updateRole)
    .delete((0, auth_middleware_1.checkAccess)(['ROLES_DELETE']), roleController_1.deleteRole);
exports.default = router;
