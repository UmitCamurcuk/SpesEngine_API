"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const categoryController_1 = require("../controllers/categoryController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['CATEGORIES_VIEW']), categoryController_1.getCategories)
    .post((0, auth_middleware_1.checkAccess)(['CATEGORIES_CREATE']), categoryController_1.createCategory);
// ItemType'a göre kategorileri getir
router
    .route('/by-itemtype/:itemTypeId')
    .get((0, auth_middleware_1.checkAccess)(['CATEGORIES_VIEW']), categoryController_1.getCategoriesByItemType);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['CATEGORIES_VIEW']), categoryController_1.getCategoryById)
    .put((0, auth_middleware_1.checkAccess)(['CATEGORIES_UPDATE']), categoryController_1.updateCategory)
    .delete((0, auth_middleware_1.checkAccess)(['CATEGORIES_DELETE']), categoryController_1.deleteCategory);
exports.default = router;
