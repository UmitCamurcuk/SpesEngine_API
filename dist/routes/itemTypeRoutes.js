"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const itemTypeController_1 = require("../controllers/itemTypeController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
// Navbar için özel route
router
    .route('/navbar')
    .get((0, auth_middleware_1.checkAccess)(['ITEM_TYPES_VIEW']), itemTypeController_1.getItemTypesForNavbar);
// Code'a göre ItemType getir
router
    .route('/code/:code')
    .get((0, auth_middleware_1.checkAccess)(['ITEM_TYPES_VIEW']), itemTypeController_1.getItemTypeByCode);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['ITEM_TYPES_VIEW']), itemTypeController_1.getItemTypes)
    .post((0, auth_middleware_1.checkAccess)(['ITEM_TYPES_CREATE']), itemTypeController_1.createItemType);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['ITEM_TYPES_VIEW']), itemTypeController_1.getItemTypeById)
    .put((0, auth_middleware_1.checkAccess)(['ITEM_TYPES_UPDATE']), itemTypeController_1.updateItemType)
    .delete((0, auth_middleware_1.checkAccess)(['ITEM_TYPES_DELETE']), itemTypeController_1.deleteItemType);
exports.default = router;
