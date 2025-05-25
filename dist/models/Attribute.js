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
    AttributeType["TEXT"] = "text";
    AttributeType["NUMBER"] = "number";
    AttributeType["DATE"] = "date";
    AttributeType["BOOLEAN"] = "boolean";
    AttributeType["SELECT"] = "select";
    AttributeType["MULTISELECT"] = "multiselect";
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
    attributeGroup: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'AttributeGroup',
        required: false
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
    // TCKNO gibi büyük sayılar için validasyonu doğrula
    if (this.validations && this.type === AttributeType.NUMBER) {
        const validations = this.validations;
        console.log('[Attribute Model] Sayısal tip için validasyonlar işleniyor:', validations);
        // min ve max değerleri varsa, sayısal tipe dönüştür (Number tipinde olduğundan emin ol)
        if (validations.min !== undefined) {
            validations.min = Number(validations.min);
        }
        if (validations.max !== undefined) {
            validations.max = Number(validations.max);
        }
        // Boolean değerlerini doğru şekilde dönüştür
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
    // Text tipi için validasyonları işle
    if (this.validations && this.type === AttributeType.TEXT) {
        const validations = this.validations;
        console.log('[Attribute Model] Text tipi için validasyonlar işleniyor:', validations);
        if (validations.minLength !== undefined) {
            validations.minLength = Number(validations.minLength);
        }
        if (validations.maxLength !== undefined) {
            validations.maxLength = Number(validations.maxLength);
        }
    }
    // Select/MultiSelect tipi için validasyonları işle
    if (this.validations && (this.type === AttributeType.SELECT || this.type === AttributeType.MULTISELECT)) {
        const validations = this.validations;
        console.log('[Attribute Model] Select/MultiSelect tipi için validasyonlar işleniyor:', validations);
        if (validations.minSelections !== undefined) {
            validations.minSelections = Number(validations.minSelections);
        }
        if (validations.maxSelections !== undefined) {
            validations.maxSelections = Number(validations.maxSelections);
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
