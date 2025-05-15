"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../controllers/roleController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Tüm routelar korumalı
router.use(auth_1.protect);
router
    .route('/')
    .get((0, auth_1.checkPermission)('roles:read'), roleController_1.getRoles)
    .post((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('roles:create'), roleController_1.createRole);
router
    .route('/:id')
    .get((0, auth_1.checkPermission)('roles:read'), roleController_1.getRoleById)
    .put((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('roles:update'), roleController_1.updateRole)
    .delete((0, auth_1.authorize)('admin'), (0, auth_1.checkPermission)('roles:delete'), roleController_1.deleteRole);
exports.default = router;
