"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const familyController_1 = require("../controllers/familyController");
const router = express_1.default.Router();
// Tüm routelar korumalı
router.use(auth_1.protect);
router
    .route('/')
    .get((0, auth_1.checkPermission)('families:read'), familyController_1.getFamilies)
    .post((0, auth_1.checkPermission)('families:create'), familyController_1.createFamily);
router
    .route('/:id')
    .get((0, auth_1.checkPermission)('families:read'), familyController_1.getFamilyById)
    .put((0, auth_1.checkPermission)('families:update'), familyController_1.updateFamily)
    .delete((0, auth_1.checkPermission)('families:delete'), familyController_1.deleteFamily);
exports.default = router;
