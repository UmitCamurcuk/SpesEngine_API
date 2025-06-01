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
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Pre-save hook ekleyerek validasyon verilerini düzenle
AttributeSchema.pre('save', function (next) {
    console.log('[Attribute Model] pre-save hook çalıştı');
    console.log('[Attribute Model] validations:', this.validations);
    // Eğer validasyonlar tanımlıysa ancak boşsa, undefined yaparak MongoDB'den kaldır
    if (this.validations && Object.keys(this.validations).length === 0) {
        console.log('[Attribute Model] Boş validasyon objesi undefined yapılıyor');
        this.validations = undefined;
    }
    // Validasyon işlemleri
    if (this.validations) {
        const validations = this.validations;
        // NUMBER tipi için validasyonları işle
        if (this.type === AttributeType.NUMBER) {
            console.log('[Attribute Model] Sayısal tip için validasyonlar işleniyor:', validations);
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
            console.log('[Attribute Model] Text tipi için validasyonlar işleniyor:', validations);
            if (validations.minLength !== undefined)
                validations.minLength = Number(validations.minLength);
            if (validations.maxLength !== undefined)
                validations.maxLength = Number(validations.maxLength);
            if (validations.maxTextLength !== undefined)
                validations.maxTextLength = Number(validations.maxTextLength);
        }
        // SELECT/MULTISELECT tipi için validasyonları işle
        if (this.type === AttributeType.SELECT || this.type === AttributeType.MULTISELECT) {
            console.log('[Attribute Model] Select/MultiSelect tipi için validasyonlar işleniyor:', validations);
            if (validations.minSelections !== undefined)
                validations.minSelections = Number(validations.minSelections);
            if (validations.maxSelections !== undefined)
                validations.maxSelections = Number(validations.maxSelections);
        }
        // FILE/IMAGE/ATTACHMENT tipi için validasyonları işle
        if (this.type === AttributeType.FILE || this.type === AttributeType.IMAGE || this.type === AttributeType.ATTACHMENT) {
            console.log('[Attribute Model] File tipi için validasyonlar işleniyor:', validations);
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
            console.log('[Attribute Model] Array tipi için validasyonlar işleniyor:', validations);
            if (validations.minItems !== undefined)
                validations.minItems = Number(validations.minItems);
            if (validations.maxItems !== undefined)
                validations.maxItems = Number(validations.maxItems);
        }
        // RATING tipi için validasyonları işle
        if (this.type === AttributeType.RATING) {
            console.log('[Attribute Model] Rating tipi için validasyonlar işleniyor:', validations);
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
    console.log('[Attribute Model] processValidations çağrıldı, update:', JSON.stringify(update, null, 2));
    // $set operatörü ile gelen güncelleme verileri
    if (update.$set && update.$set.validations) {
        console.log('[Attribute Model] $set.validations işleniyor:', JSON.stringify(update.$set.validations, null, 2));
        // Boş validasyon objesi kontrolü
        if (Object.keys(update.$set.validations).length === 0) {
            console.log('[Attribute Model] Boş $set.validations objesi undefined yapılıyor');
            update.$set.validations = undefined;
            return;
        }
        // Sayı tipi kontrolü
        if (update.$set.type === AttributeType.NUMBER ||
            (update.type === AttributeType.NUMBER)) {
            const validations = update.$set.validations;
            console.log('[Attribute Model] Sayısal tip için $set.validations işleniyor');
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
            console.log('[Attribute Model] Text tipi için $set.validations işleniyor');
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
            console.log('[Attribute Model] Date tipi için $set.validations işleniyor');
        }
        // Select/MultiSelect tipi kontrolü
        if ((update.$set.type === AttributeType.SELECT || update.$set.type === AttributeType.MULTISELECT) ||
            (update.type === AttributeType.SELECT || update.type === AttributeType.MULTISELECT)) {
            const validations = update.$set.validations;
            console.log('[Attribute Model] Select/MultiSelect tipi için $set.validations işleniyor');
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
        console.log('[Attribute Model] update.validations işleniyor:', JSON.stringify(update.validations, null, 2));
        // Boş validasyon objesi kontrolü
        if (Object.keys(update.validations).length === 0) {
            console.log('[Attribute Model] Boş update.validations objesi undefined yapılıyor');
            update.validations = undefined;
            return;
        }
        // Sayı tipi kontrolü
        if (update.type === AttributeType.NUMBER) {
            const validations = update.validations;
            console.log('[Attribute Model] Sayısal tip için update.validations işleniyor');
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
            console.log('[Attribute Model] Text tipi için update.validations işleniyor');
            if (validations.minLength !== undefined) {
                validations.minLength = Number(validations.minLength);
            }
            if (validations.maxLength !== undefined) {
                validations.maxLength = Number(validations.maxLength);
            }
        }
        // Date tipi kontrolü
        if (update.type === AttributeType.DATE) {
            // Date validasyonları için özel işlem gerekmeyebilir
            console.log('[Attribute Model] Date tipi için update.validations işleniyor');
        }
        // Select/MultiSelect tipi kontrolü
        if (update.type === AttributeType.SELECT || update.type === AttributeType.MULTISELECT) {
            const validations = update.validations;
            console.log('[Attribute Model] Select/MultiSelect tipi için update.validations işleniyor');
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
