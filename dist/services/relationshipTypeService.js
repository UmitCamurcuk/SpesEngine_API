"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RelationshipType_1 = __importDefault(require("../models/RelationshipType"));
const errors_1 = require("../utils/errors");
const Localization_1 = __importDefault(require("../models/Localization"));
class RelationshipTypeService {
    create(data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // İlişki tipi kodunun benzersiz olduğunu kontrol et
            const existingType = yield RelationshipType_1.default.findOne({ code: data.code });
            if (existingType) {
                throw new errors_1.ValidationError(`İlişki tipi kodu '${data.code}' zaten kullanılıyor.`);
            }
            // CreatedBy ve updatedBy alanlarını ekle
            const relationshipTypeData = Object.assign(Object.assign({}, data), { createdBy: userId, updatedBy: userId });
            const relationshipType = new RelationshipType_1.default(relationshipTypeData);
            const savedType = yield relationshipType.save();
            // Populate edilmiş veriyi döndür
            return yield this.getById(String(savedType._id));
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const relationshipTypes = yield RelationshipType_1.default.find()
                .populate('createdBy', 'firstName lastName email name')
                .populate('updatedBy', 'firstName lastName email name')
                .sort({ createdAt: -1 });
            // Name ve description localization'larını populate et
            const populatedTypes = yield Promise.all(relationshipTypes.map((type) => __awaiter(this, void 0, void 0, function* () {
                const populatedType = type.toObject();
                // Name localization'ını getir
                if (type.name) {
                    try {
                        const nameLocalization = yield Localization_1.default.findById(type.name);
                        if (nameLocalization) {
                            populatedType.name = nameLocalization;
                        }
                    }
                    catch (error) {
                        console.error('Name localization error:', error);
                    }
                }
                // Description localization'ını getir
                if (type.description) {
                    try {
                        const descLocalization = yield Localization_1.default.findById(type.description);
                        if (descLocalization) {
                            populatedType.description = descLocalization;
                        }
                    }
                    catch (error) {
                        console.error('Description localization error:', error);
                    }
                }
                return populatedType;
            })));
            return populatedTypes;
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const relationshipType = yield RelationshipType_1.default.findById(id)
                .populate('createdBy', 'firstName lastName email name')
                .populate('updatedBy', 'firstName lastName email name');
            if (!relationshipType) {
                throw new errors_1.NotFoundError('İlişki tipi bulunamadı');
            }
            const populatedType = relationshipType.toObject();
            // Name localization'ını getir
            if (relationshipType.name) {
                try {
                    const nameLocalization = yield Localization_1.default.findById(relationshipType.name);
                    if (nameLocalization) {
                        populatedType.name = nameLocalization;
                    }
                }
                catch (error) {
                    console.error('Name localization error:', error);
                }
            }
            // Description localization'ını getir
            if (relationshipType.description) {
                try {
                    const descLocalization = yield Localization_1.default.findById(relationshipType.description);
                    if (descLocalization) {
                        populatedType.description = descLocalization;
                    }
                }
                catch (error) {
                    console.error('Description localization error:', error);
                }
            }
            return populatedType;
        });
    }
    update(id, data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Eğer kod değiştiyse benzersizliğini kontrol et
            if (data.code) {
                const existingType = yield RelationshipType_1.default.findOne({
                    code: data.code,
                    _id: { $ne: id }
                });
                if (existingType) {
                    throw new errors_1.ValidationError(`İlişki tipi kodu '${data.code}' zaten kullanılıyor.`);
                }
            }
            // UpdatedBy alanını ekle
            const updateData = Object.assign(Object.assign({}, data), { updatedBy: userId });
            const relationshipType = yield RelationshipType_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
            if (!relationshipType) {
                throw new errors_1.NotFoundError('İlişki tipi bulunamadı');
            }
            // Populate edilmiş veriyi döndür
            return yield this.getById(id);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield RelationshipType_1.default.findByIdAndDelete(id);
            if (!result) {
                throw new errors_1.NotFoundError('İlişki tipi bulunamadı');
            }
        });
    }
}
exports.default = new RelationshipTypeService();
