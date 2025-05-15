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
const LocalizationSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: true,
        index: true
    },
    translations: {
        type: Map,
        of: String,
        default: {}
    },
    namespace: {
        type: String,
        required: true,
        default: 'common',
        index: true
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});
// Bileşik index oluştur (key ve namespace birlikte unique olmalı)
LocalizationSchema.index({ key: 1, namespace: 1 }, { unique: true });
// Map nesnesini düzgün şekilde JSON'a dönüştür
LocalizationSchema.set('toJSON', {
    transform: function (doc, ret) {
        // Map nesnesini standart objeye dönüştür
        if (ret.translations instanceof Map) {
            const translationsObj = {};
            ret.translations.forEach((value, key) => {
                translationsObj[key] = value;
            });
            ret.translations = translationsObj;
        }
        return ret;
    }
});
exports.default = mongoose_1.default.model('Localization', LocalizationSchema);
