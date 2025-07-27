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
const ItemSchema = new mongoose_1.Schema({
    itemType: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ItemType',
        required: [true, 'Öğe tipi seçilmelidir']
    },
    family: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Family',
        required: [true, 'Aile seçilmelidir']
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Kategori seçilmelidir']
    },
    attributes: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Oluşturan kullanıcı belirtilmelidir']
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Güncelleyen kullanıcı belirtilmelidir']
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Attributes alanını düz bir obje olarak döndür
ItemSchema.methods.toJSON = function () {
    const item = this.toObject();
    if (item.attributes && item.attributes instanceof Map) {
        item.attributes = Object.fromEntries(item.attributes);
    }
    else if (!item.attributes) {
        item.attributes = {};
    }
    return item;
};
// Öğe oluşturulurken veya güncellenirken attributes Map olarak ayarla
ItemSchema.pre('save', function (next) {
    if (this.attributes && typeof this.attributes === 'object' && !(this.attributes instanceof Map)) {
        this.attributes = new Map(Object.entries(this.attributes));
    }
    next();
});
// Öğe toplu güncelleme işlemleri için attributes Map olarak ayarla
ItemSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update && update.attributes && typeof update.attributes === 'object' && !(update.attributes instanceof Map)) {
        update.attributes = new Map(Object.entries(update.attributes));
    }
    next();
});
exports.default = mongoose_1.default.model('Item', ItemSchema);
