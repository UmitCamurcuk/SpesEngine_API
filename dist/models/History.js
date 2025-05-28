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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ActionType;
(function (ActionType) {
    ActionType["CREATE"] = "create";
    ActionType["UPDATE"] = "update";
    ActionType["DELETE"] = "delete";
    ActionType["RESTORE"] = "restore";
})(ActionType || (exports.ActionType = ActionType = {}));
const HistorySchema = new mongoose_1.Schema({
    entityId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    entityType: {
        type: String,
        required: true,
        enum: ['attribute', 'attributeGroup', 'category', 'item', 'itemType', 'family', 'user', 'translation'],
        index: true
    },
    entityName: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: Object.values(ActionType)
    },
    changes: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    previousData: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    newData: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    additionalInfo: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // Sadece createdAt gerekli
});
// Indexler
HistorySchema.index({ entityId: 1, createdAt: -1 });
HistorySchema.index({ entityType: 1, createdAt: -1 });
HistorySchema.index({ createdBy: 1, createdAt: -1 });
HistorySchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('History', HistorySchema);
