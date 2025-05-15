"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const attributeController_1 = require("../controllers/attributeController");
const router = express_1.default.Router();
// Tüm routelar korumalı
router.use(auth_1.protect);
router
    .route('/')
    .get((0, auth_1.checkPermission)('attributes:read'), attributeController_1.getAttributes)
    .post((0, auth_1.checkPermission)('attributes:create'), attributeController_1.createAttribute);
router
    .route('/:id')
    .get((0, auth_1.checkPermission)('attributes:read'), attributeController_1.getAttributeById)
    .put((0, auth_1.checkPermission)('attributes:update'), attributeController_1.updateAttribute)
    .delete((0, auth_1.checkPermission)('attributes:delete'), attributeController_1.deleteAttribute);
exports.default = router;
