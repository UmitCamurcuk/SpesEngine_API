"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const historyController_1 = require("../controllers/historyController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü
router.use(auth_middleware_1.authenticateToken);
// Geçmiş kayıtları
router.get('/', (0, auth_middleware_1.checkAccess)(['HISTORY_VIEW']), historyController_1.getHistory);
router.get('/:entityType/:entityId', (0, auth_middleware_1.checkAccess)(['HISTORY_VIEW']), historyController_1.getEntityHistory);
exports.default = router;
