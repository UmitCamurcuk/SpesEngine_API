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
const ItemTypeSchema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Localization',
        required: [true, 'Öğe tipi adı zorunludur']
    },
    code: {
        type: String,
        required: [true, 'Öğe tipi kodu zorunludur'],
        unique: true,
        trim: true
    },
    description: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Localization',
        required: [true, 'Öğe tipi açıklaması zorunludur']
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Kategori seçimi zorunludur']
    },
    attributeGroups: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'AttributeGroup',
            required: false
        }
    ],
    attributes: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Attribute',
            required: false
        }
    ],
    settings: {
        type: {
            notifications: {
                type: {
                    settings: {
                        type: {
                            onUpdate: { type: Boolean, default: false },
                            onDelete: { type: Boolean, default: false },
                            onUsedInCategory: { type: Boolean, default: false },
                            onUsedInFamily: { type: Boolean, default: false },
                            onUsedInAttributeGroup: { type: Boolean, default: false },
                            onUsedInItemType: { type: Boolean, default: false },
                            onUsedInItem: { type: Boolean, default: false }
                        },
                        required: false
                    },
                    channels: {
                        type: {
                            slack: {
                                type: {
                                    enabled: { type: Boolean, default: false },
                                    webhook: { type: String, required: false },
                                    channel: { type: String, required: false }
                                },
                                required: false
                            },
                            email: {
                                type: {
                                    enabled: { type: Boolean, default: false },
                                    recipients: [{ type: String, required: false }]
                                },
                                required: false
                            },
                            whatsapp: {
                                type: {
                                    enabled: { type: Boolean, default: false },
                                    phoneNumbers: [{ type: String, required: false }]
                                },
                                required: false
                            },
                            teams: {
                                type: {
                                    enabled: { type: Boolean, default: false },
                                    webhook: { type: String, required: false }
                                },
                                required: false
                            }
                        },
                        required: false
                    }
                },
                required: false
            },
            permissions: {
                type: {
                    allowPublicAccess: { type: Boolean, default: false },
                    restrictedFields: [{ type: String, required: false }]
                },
                required: false
            },
            workflow: {
                type: {
                    requireApproval: { type: Boolean, default: false },
                    autoPublish: { type: Boolean, default: true }
                },
                required: false
            }
        },
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('ItemType', ItemTypeSchema);
