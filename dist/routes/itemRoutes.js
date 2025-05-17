"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const itemController_1 = require("../controllers/itemController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getItems)
    .post((0, auth_middleware_1.checkAccess)(['ITEMS_CREATE']), itemController_1.createItem);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getItemById)
    .put((0, auth_middleware_1.checkAccess)(['ITEMS_UPDATE']), itemController_1.updateItem)
    .delete((0, auth_middleware_1.checkAccess)(['ITEMS_DELETE']), itemController_1.deleteItem);
exports.default = router;
