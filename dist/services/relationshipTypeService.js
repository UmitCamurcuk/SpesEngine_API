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
class RelationshipTypeService {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // İlişki tipi kodunun benzersiz olduğunu kontrol et
            const existingType = yield RelationshipType_1.default.findOne({ code: data.code });
            if (existingType) {
                throw new errors_1.ValidationError(`İlişki tipi kodu '${data.code}' zaten kullanılıyor.`);
            }
            const relationshipType = new RelationshipType_1.default(data);
            return yield relationshipType.save();
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RelationshipType_1.default.find().sort({ name: 1 });
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const relationshipType = yield RelationshipType_1.default.findById(id);
            if (!relationshipType) {
                throw new errors_1.NotFoundError('İlişki tipi bulunamadı');
            }
            return relationshipType;
        });
    }
    update(id, data) {
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
            const relationshipType = yield RelationshipType_1.default.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
            if (!relationshipType) {
                throw new errors_1.NotFoundError('İlişki tipi bulunamadı');
            }
            return relationshipType;
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
