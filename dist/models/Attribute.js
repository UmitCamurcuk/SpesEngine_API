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
exports.AttributeType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var AttributeType;
(function (AttributeType) {
    // Basic (Temel) Types
    AttributeType["TEXT"] = "text";
    AttributeType["NUMBER"] = "number";
    AttributeType["BOOLEAN"] = "boolean";
    AttributeType["DATE"] = "date";
    AttributeType["DATETIME"] = "datetime";
    AttributeType["TIME"] = "time";
    // Enum / Seçilebilir Değerler
    AttributeType["SELECT"] = "select";
    AttributeType["MULTISELECT"] = "multiselect";
    // Dosya / Medya Tipleri
    AttributeType["FILE"] = "file";
    AttributeType["IMAGE"] = "image";
    AttributeType["ATTACHMENT"] = "attachment";
    // Kompozit / Gelişmiş Tipler
    AttributeType["OBJECT"] = "object";
    AttributeType["ARRAY"] = "array";
    AttributeType["JSON"] = "json";
    AttributeType["FORMULA"] = "formula";
    AttributeType["EXPRESSION"] = "expression";
    // UI / Görsel Bileşen Tipleri
    AttributeType["COLOR"] = "color";
    AttributeType["RICH_TEXT"] = "rich_text";
    AttributeType["RATING"] = "rating";
    AttributeType["BARCODE"] = "barcode";
    AttributeType["QR"] = "qr";
    // Special Types
    AttributeType["READONLY"] = "readonly"; // readonly - Sadece okunabilir (create'te set edilir)
})(AttributeType || (exports.AttributeType = AttributeType = {}));
// Mixed tip kullanarak validasyon verilerini esnek bir şekilde depolama
const ValidationSchema = mongoose_1.Schema.Types.Mixed;
const AttributeSchema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Localization',
        required: [true, 'Öznitelik adı zorunludur']
    },
    code: {
        type: String,
        required: [true, 'Öznitelik kodu zorunludur'],
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Öznitelik tipi zorunludur'],
        enum: Object.values(AttributeType),
        default: AttributeType.TEXT
    },
    description: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Localization',
        required: false
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    options: {
        type: [String],
        default: []
    },
    validations: ValidationSchema,
    notificationSettings: {
        type: {
            onUpdate: { type: Boolean, default: false },
            onDelete: { type: Boolean, default: false },
            onUsedInCategory: { type: Boolean, default: false },
            onUsedInFamily: { type: Boolean, default: false },
            onUsedInAttributeGroup: { type: Boolean, default: false },
            onUsedInItemType: { type: Boolean, default: false },
            onUsedInItem: { type: Boolean, default: false }
        },
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Pre-save hook ekleyerek validasyon verilerini düzenle
AttributeSchema.pre('save', function (next) {
    // Eğer validasyonlar tanımlıysa ancak boşsa, undefined yaparak MongoDB'den kaldır
    if (this.validations && Object.keys(this.validations).length === 0) {
        this.validations = undefined;
    }
    // Validasyon işlemleri
    if (this.validations) {
        const validations = this.validations;
        // NUMBER tipi için validasyonları işle
        if (this.type === AttributeType.NUMBER) {
            if (validations.min !== undefined)
                validations.min = Number(validations.min);
            if (validations.max !== undefined)
                validations.max = Number(validations.max);
            if (validations.isInteger !== undefined)
                validations.isInteger = Boolean(validations.isInteger);
            if (validations.isPositive !== undefined)
                validations.isPositive = Boolean(validations.isPositive);
            if (validations.isNegative !== undefined)
                validations.isNegative = Boolean(validations.isNegative);
            if (validations.isZero !== undefined)
                validations.isZero = Boolean(validations.isZero);
        }
        // TEXT tipi için validasyonları işle
        if (this.type === AttributeType.TEXT || this.type === AttributeType.RICH_TEXT) {
            if (validations.minLength !== undefined)
                validations.minLength = Number(validations.minLength);
            if (validations.maxLength !== undefined)
                validations.maxLength = Number(validations.maxLength);
            if (validations.maxTextLength !== undefined)
                validations.maxTextLength = Number(validations.maxTextLength);
        }
        // SELECT/MULTISELECT tipi için validasyonları işle
        if (this.type === AttributeType.SELECT || this.type === AttributeType.MULTISELECT) {
            if (validations.minSelections !== undefined)
                validations.minSelections = Number(validations.minSelections);
            if (validations.maxSelections !== undefined)
                validations.maxSelections = Number(validations.maxSelections);
        }
        // FILE/IMAGE/ATTACHMENT tipi için validasyonları işle
        if (this.type === AttributeType.FILE || this.type === AttributeType.IMAGE || this.type === AttributeType.ATTACHMENT) {
            if (validations.maxFileSize !== undefined)
                validations.maxFileSize = Number(validations.maxFileSize);
            if (validations.maxFiles !== undefined)
                validations.maxFiles = Number(validations.maxFiles);
            if (validations.maxWidth !== undefined)
                validations.maxWidth = Number(validations.maxWidth);
            if (validations.maxHeight !== undefined)
                validations.maxHeight = Number(validations.maxHeight);
        }
        // ARRAY tipi için validasyonları işle
        if (this.type === AttributeType.ARRAY) {
            if (validations.minItems !== undefined)
                validations.minItems = Number(validations.minItems);
            if (validations.maxItems !== undefined)
                validations.maxItems = Number(validations.maxItems);
        }
        // RATING tipi için validasyonları işle
        if (this.type === AttributeType.RATING) {
            if (validations.minRating !== undefined)
                validations.minRating = Number(validations.minRating);
            if (validations.maxRating !== undefined)
                validations.maxRating = Number(validations.maxRating);
            if (validations.allowHalfStars !== undefined)
                validations.allowHalfStars = Boolean(validations.allowHalfStars);
        }
    }
    next();
});
// Güncelleme operasyonları için de validasyon verilerini işlemek
// Burada updateOne, findOneAndUpdate gibi metodlar için kontrol ekliyoruz
function processValidations(update) {
    // $set operatörü ile gelen güncelleme verileri
    if (update.$set && update.$set.validations) {
        // Boş validasyon objesi kontrolü
        if (Object.keys(update.$set.validations).length === 0) {
            update.$set.validations = undefined;
            return;
        }
        // Sayı tipi kontrolü
        if (update.$set.type === AttributeType.NUMBER ||
            (update.type === AttributeType.NUMBER)) {
            const validations = update.$set.validations;
            // min/max sayısal değerlerin işlenmesi
            if (validations.min !== undefined) {
                validations.min = Number(validations.min);
            }
            if (validations.max !== undefined) {
                validations.max = Number(validations.max);
            }
            // Boolean değerlerin işlenmesi
            if (validations.isInteger !== undefined) {
                validations.isInteger = Boolean(validations.isInteger);
            }
            if (validations.isPositive !== undefined) {
                validations.isPositive = Boolean(validations.isPositive);
            }
            if (validations.isNegative !== undefined) {
                validations.isNegative = Boolean(validations.isNegative);
            }
            if (validations.isZero !== undefined) {
                validations.isZero = Boolean(validations.isZero);
            }
        }
        // Text tipi kontrolü
        if (update.$set.type === AttributeType.TEXT ||
            (update.type === AttributeType.TEXT)) {
            const validations = update.$set.validations;
            if (validations.minLength !== undefined) {
                validations.minLength = Number(validations.minLength);
            }
            if (validations.maxLength !== undefined) {
                validations.maxLength = Number(validations.maxLength);
            }
        }
        // Date tipi kontrolü
        if (update.$set.type === AttributeType.DATE ||
            (update.type === AttributeType.DATE)) {
            // Date validasyonları için özel işlem gerekmeyebilir
        }
        // Select/MultiSelect tipi kontrolü
        if ((update.$set.type === AttributeType.SELECT || update.$set.type === AttributeType.MULTISELECT) ||
            (update.type === AttributeType.SELECT || update.type === AttributeType.MULTISELECT)) {
            const validations = update.$set.validations;
            if (validations.minSelections !== undefined) {
                validations.minSelections = Number(validations.minSelections);
            }
            if (validations.maxSelections !== undefined) {
                validations.maxSelections = Number(validations.maxSelections);
            }
        }
    }
    // Direkt update objesinde gelen validasyon verileri
    if (update.validations) {
        // Boş validasyon objesi kontrolü
        if (Object.keys(update.validations).length === 0) {
            update.validations = undefined;
            return;
        }
        // Sayı tipi kontrolü
        if (update.type === AttributeType.NUMBER) {
            const validations = update.validations;
            // min/max sayısal değerlerin işlenmesi
            if (validations.min !== undefined) {
                validations.min = Number(validations.min);
            }
            if (validations.max !== undefined) {
                validations.max = Number(validations.max);
            }
            // Boolean değerlerin işlenmesi
            if (validations.isInteger !== undefined) {
                validations.isInteger = Boolean(validations.isInteger);
            }
            if (validations.isPositive !== undefined) {
                validations.isPositive = Boolean(validations.isPositive);
            }
            if (validations.isNegative !== undefined) {
                validations.isNegative = Boolean(validations.isNegative);
            }
            if (validations.isZero !== undefined) {
                validations.isZero = Boolean(validations.isZero);
            }
        }
        // Text tipi kontrolü
        if (update.type === AttributeType.TEXT) {
            const validations = update.validations;
            if (validations.minLength !== undefined) {
                validations.minLength = Number(validations.minLength);
            }
            if (validations.maxLength !== undefined) {
                validations.maxLength = Number(validations.maxLength);
            }
        }
        // Select/MultiSelect tipi kontrolü
        if (update.type === AttributeType.SELECT || update.type === AttributeType.MULTISELECT) {
            const validations = update.validations;
            if (validations.minSelections !== undefined) {
                validations.minSelections = Number(validations.minSelections);
            }
            if (validations.maxSelections !== undefined) {
                validations.maxSelections = Number(validations.maxSelections);
            }
        }
    }
}
// Update operasyonları için pre-hook
['updateOne', 'findOneAndUpdate', 'updateMany'].forEach(method => {
    AttributeSchema.pre(method, function (next) {
        const update = this.getUpdate();
        if (update) {
            processValidations(update);
        }
        next();
    });
});
exports.default = mongoose_1.default.model('Attribute', AttributeSchema);
