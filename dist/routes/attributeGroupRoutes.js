"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// Test endpoint - attributeGroup içindeki öznitelikleri kontrol etmek için
router.get('/test/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const AttributeGroup = yield Promise.resolve().then(() => __importStar(require('../models/AttributeGroup')));
        const group = yield AttributeGroup.default.findById(req.params.id).populate('attributes');
        if (!group) {
            return res.status(404).json({ success: false, message: 'Grup bulunamadı' });
        }
        res.status(200).json({
            success: true,
            data: {
                _id: group._id,
                name: group.name,
                attributesLength: group.attributes ? group.attributes.length : 0,
                attributes: group.attributes
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'AttributeGroup kontrolü sırasında hata oluştu'
        });
    }
}));
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
