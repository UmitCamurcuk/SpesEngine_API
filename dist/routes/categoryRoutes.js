"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const categoryController_1 = require("../controllers/categoryController");
const router = express_1.default.Router();
// Tüm routelar korumalı
router.use(auth_1.protect);
router
    .route('/')
    .get((0, auth_1.checkPermission)('categories:read'), categoryController_1.getCategories)
    .post((0, auth_1.checkPermission)('categories:create'), categoryController_1.createCategory);
router
    .route('/:id')
    .get((0, auth_1.checkPermission)('categories:read'), categoryController_1.getCategoryById)
    .put((0, auth_1.checkPermission)('categories:update'), categoryController_1.updateCategory)
    .delete((0, auth_1.checkPermission)('categories:delete'), categoryController_1.deleteCategory);
exports.default = router;
