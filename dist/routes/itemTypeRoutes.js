"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const itemTypeController_1 = require("../controllers/itemTypeController");
const router = express_1.default.Router();
// Tüm routelar korumalı
router.use(auth_1.protect);
router
    .route('/')
    .get((0, auth_1.checkPermission)('itemTypes:read'), itemTypeController_1.getItemTypes)
    .post((0, auth_1.checkPermission)('itemTypes:create'), itemTypeController_1.createItemType);
router
    .route('/:id')
    .get((0, auth_1.checkPermission)('itemTypes:read'), itemTypeController_1.getItemTypeById)
    .put((0, auth_1.checkPermission)('itemTypes:update'), itemTypeController_1.updateItemType)
    .delete((0, auth_1.checkPermission)('itemTypes:delete'), itemTypeController_1.deleteItemType);
exports.default = router;
