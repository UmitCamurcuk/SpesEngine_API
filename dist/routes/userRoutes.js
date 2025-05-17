"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
// Kullanıcı işlemleri
router.route('/')
    .get((0, auth_middleware_1.checkAccess)(['USERS_VIEW']), userController_1.getUsers)
    .post((0, auth_middleware_1.checkAccess)(['USERS_CREATE']), userController_1.createUser);
router.route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['USERS_VIEW']), userController_1.getUser)
    .put((0, auth_middleware_1.checkAccess)(['USERS_UPDATE']), userController_1.updateUser)
    .delete((0, auth_middleware_1.checkAccess)(['USERS_DELETE']), userController_1.deleteUser);
exports.default = router;
