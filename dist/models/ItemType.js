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
            },
            navigation: {
                type: {
                    showInNavbar: { type: Boolean, default: false },
                    navbarLabel: { type: String, required: false },
                    navbarIcon: { type: String, required: false },
                    navbarOrder: { type: Number, required: false },
                    menuGroup: { type: String, required: false }
                },
                required: false
            },
            display: {
                type: {
                    listTitle: { type: String, required: false },
                    listDescription: { type: String, required: false },
                    itemsPerPage: { type: Number, required: false },
                    defaultSortField: { type: String, required: false },
                    defaultSortOrder: { type: String, enum: ['asc', 'desc'], required: false },
                    tableColumns: [{
                            key: { type: String, required: true },
                            title: { type: String, required: true },
                            visible: { type: Boolean, default: true },
                            order: { type: Number, required: true },
                            width: { type: Number, required: false },
                            sortable: { type: Boolean, default: true },
                            filterable: { type: Boolean, default: true }
                        }],
                    showAdvancedFilters: { type: Boolean, default: false },
                    showExportButton: { type: Boolean, default: false },
                    showImportButton: { type: Boolean, default: false }
                },
                required: false
            }
        },
        required: false
    },
    associations: {
        type: {
            outgoing: [{
                    targetItemTypeCode: { type: String, required: true },
                    targetItemTypeName: { type: String, required: false },
                    relationshipType: {
                        type: String,
                        enum: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
                        required: true
                    },
                    cardinality: {
                        min: { type: Number, default: 0 },
                        max: { type: Number, default: null } // null = unlimited
                    },
                    isRequired: { type: Boolean, default: false },
                    cascadeDelete: { type: Boolean, default: false },
                    displayField: { type: String, required: false },
                    searchableFields: [{ type: String }],
                    filterBy: { type: Map, of: mongoose_1.Schema.Types.Mixed },
                    validationRules: { type: Map, of: mongoose_1.Schema.Types.Mixed },
                    uiConfig: {
                        showInList: { type: Boolean, default: true },
                        showInDetail: { type: Boolean, default: true },
                        allowInlineCreate: { type: Boolean, default: false },
                        allowInlineEdit: { type: Boolean, default: false },
                        displayMode: {
                            type: String,
                            enum: ['dropdown', 'modal', 'popup', 'inline'],
                            default: 'dropdown'
                        }
                    }
                }],
            incoming: [{
                    targetItemTypeCode: { type: String, required: true },
                    targetItemTypeName: { type: String, required: false },
                    relationshipType: {
                        type: String,
                        enum: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
                        required: true
                    },
                    cardinality: {
                        min: { type: Number, default: 0 },
                        max: { type: Number, default: null }
                    },
                    isRequired: { type: Boolean, default: false },
                    cascadeDelete: { type: Boolean, default: false },
                    displayField: { type: String, required: false },
                    searchableFields: [{ type: String }],
                    filterBy: { type: Map, of: mongoose_1.Schema.Types.Mixed },
                    validationRules: { type: Map, of: mongoose_1.Schema.Types.Mixed },
                    uiConfig: {
                        showInList: { type: Boolean, default: true },
                        showInDetail: { type: Boolean, default: true },
                        allowInlineCreate: { type: Boolean, default: false },
                        allowInlineEdit: { type: Boolean, default: false },
                        displayMode: {
                            type: String,
                            enum: ['dropdown', 'modal', 'popup', 'inline'],
                            default: 'dropdown'
                        }
                    }
                }]
        },
        required: false,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    // İndexleme stratejisi
    indexes: [
        { code: 1 }, // Unique code lookup
        { 'associations.outgoing.targetItemTypeCode': 1 }, // Association queries
        { 'associations.incoming.targetItemTypeCode': 1 }, // Reverse association queries
        { isActive: 1, code: 1 } // Active itemTypes
    ]
});
exports.default = mongoose_1.default.model('ItemType', ItemTypeSchema);
