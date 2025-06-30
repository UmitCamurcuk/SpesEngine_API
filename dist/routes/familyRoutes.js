"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const familyController_1 = require("../controllers/familyController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['FAMILIES_VIEW']), familyController_1.getFamilies)
    .post((0, auth_middleware_1.checkAccess)(['FAMILIES_CREATE']), familyController_1.createFamily);
// Kategoriye göre aileleri getir
router
    .route('/by-category/:categoryId')
    .get((0, auth_middleware_1.checkAccess)(['FAMILIES_VIEW']), familyController_1.getFamiliesByCategory);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['FAMILIES_VIEW']), familyController_1.getFamilyById)
    .put((0, auth_middleware_1.checkAccess)(['FAMILIES_UPDATE']), familyController_1.updateFamily)
    .delete((0, auth_middleware_1.checkAccess)(['FAMILIES_DELETE']), familyController_1.deleteFamily);
exports.default = router;
