"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const attributeGroupController_1 = require("../controllers/attributeGroupController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['ATTRIBUTE_GROUPS_VIEW']), attributeGroupController_1.getAttributeGroups)
    .post((0, auth_middleware_1.checkAccess)(['ATTRIBUTE_GROUPS_CREATE']), attributeGroupController_1.createAttributeGroup);
router
    .route('/:id')
    .get((0, auth_middleware_1.checkAccess)(['ATTRIBUTE_GROUPS_VIEW']), attributeGroupController_1.getAttributeGroupById)
    .put((0, auth_middleware_1.checkAccess)(['ATTRIBUTE_GROUPS_UPDATE']), attributeGroupController_1.updateAttributeGroup)
    .delete((0, auth_middleware_1.checkAccess)(['ATTRIBUTE_GROUPS_DELETE']), attributeGroupController_1.deleteAttributeGroup);
exports.default = router;
