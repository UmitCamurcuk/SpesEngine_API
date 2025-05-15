"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const attributeGroupController_1 = require("../controllers/attributeGroupController");
const router = express_1.default.Router();
// Tüm routelar korumalı
router.use(auth_1.protect);
router
    .route('/')
    .get((0, auth_1.checkPermission)('attributeGroups:read'), attributeGroupController_1.getAttributeGroups)
    .post((0, auth_1.checkPermission)('attributeGroups:create'), attributeGroupController_1.createAttributeGroup);
router
    .route('/:id')
    .get((0, auth_1.checkPermission)('attributeGroups:read'), attributeGroupController_1.getAttributeGroupById)
    .put((0, auth_1.checkPermission)('attributeGroups:update'), attributeGroupController_1.updateAttributeGroup)
    .delete((0, auth_1.checkPermission)('attributeGroups:delete'), attributeGroupController_1.deleteAttributeGroup);
exports.default = router;
