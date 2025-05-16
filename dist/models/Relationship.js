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
const mongoose_1 = __importStar(require("mongoose"));
const RelationshipSchema = new mongoose_1.Schema({
    relationshipTypeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'RelationshipType',
        required: true,
    },
    sourceEntityId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    sourceEntityType: {
        type: String,
        required: true,
    },
    targetEntityId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    targetEntityType: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'archived'],
        default: 'active',
    },
    priority: {
        type: Number,
        default: 0,
    },
    attributes: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });
// İndexler
RelationshipSchema.index({ sourceEntityId: 1, sourceEntityType: 1 });
RelationshipSchema.index({ targetEntityId: 1, targetEntityType: 1 });
RelationshipSchema.index({ relationshipTypeId: 1 });
RelationshipSchema.index({ status: 1 });
exports.default = mongoose_1.default.model('Relationship', RelationshipSchema);
