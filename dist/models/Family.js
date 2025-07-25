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
const FamilySchema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Localization',
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Localization'
    },
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Family',
        required: false
    },
    subFamilies: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Family'
        }],
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },
    itemType: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ItemType',
        required: false
    },
    attributeGroups: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'AttributeGroup'
        }],
    attributes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Attribute'
        }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Indexes for performance
FamilySchema.index({ parent: 1 });
FamilySchema.index({ category: 1 });
FamilySchema.index({ itemType: 1 });
FamilySchema.index({ code: 1 });
FamilySchema.index({ isActive: 1 });
FamilySchema.index({ parent: 1, isActive: 1 }); // Compound index for subfamily queries
exports.default = mongoose_1.default.model('Family', FamilySchema);
