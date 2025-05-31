"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const attributeController_1 = require("../controllers/attributeController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['ATTRIBUTES_VIEW']), attributeController_1.getAttributes)
    .post((0, auth_middleware_1.checkAccess)(['ATTRIBUTES_CREATE']), attributeController_1.createAttribute);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['ATTRIBUTES_VIEW']), attributeController_1.getAttributeById)
    .put((0, auth_middleware_1.checkAccess)(['ATTRIBUTES_UPDATE']), attributeController_1.updateAttribute)
    .delete((0, auth_middleware_1.checkAccess)(['ATTRIBUTES_DELETE']), attributeController_1.deleteAttribute);
// Attribute Groups ilişkileri
router
    .route('/:id/groups')
    .get((0, auth_middleware_1.checkAccess)(['ATTRIBUTES_VIEW']), attributeController_1.getAttributeGroups)
    .put((0, auth_middleware_1.checkAccess)(['ATTRIBUTES_UPDATE']), attributeController_1.updateAttributeGroups);
exports.default = router;
