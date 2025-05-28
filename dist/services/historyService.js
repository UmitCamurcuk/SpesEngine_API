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
const History_1 = __importDefault(require("../models/History"));
const mongoose_1 = __importDefault(require("mongoose"));
class HistoryService {
    /**
     * Değişiklik geçmişini kaydeder
     */
    recordHistory(_a) {
        return __awaiter(this, arguments, void 0, function* ({ entityId, entityType, entityName, action, userId, previousData = {}, newData = {}, additionalInfo }) {
            // Değişiklikleri hesapla
            const changes = this.calculateChanges(previousData, newData);
            // Yeni geçmiş kaydı oluştur
            const history = new History_1.default({
                entityId: typeof entityId === 'string' ? new mongoose_1.default.Types.ObjectId(entityId) : entityId,
                entityType,
                entityName,
                action,
                changes,
                previousData,
                newData,
                additionalInfo,
                createdBy: typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId,
                createdAt: new Date()
            });
            // Kaydet ve dön
            return yield history.save();
        });
    }
    /**
     * Belirli bir entity için geçmiş kayıtlarını getirir
     */
    getHistoryByEntity(entityId_1) {
        return __awaiter(this, arguments, void 0, function* (entityId, options = {}) {
            const { limit = 10, page = 1, sort = 'createdAt', direction = 'desc' } = options;
            const skip = (page - 1) * limit;
            const sortOptions = {};
            sortOptions[sort] = direction === 'desc' ? -1 : 1;
            const query = {
                entityId: typeof entityId === 'string' ? new mongoose_1.default.Types.ObjectId(entityId) : entityId
            };
            const [history, total] = yield Promise.all([
                History_1.default.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .populate('createdBy', 'name email'),
                History_1.default.countDocuments(query)
            ]);
            return {
                history,
                total,
                page,
                limit
            };
        });
    }
    /**
     * İki obje arasındaki değişiklikleri hesaplar
     * @private
     */
    calculateChanges(oldData, newData) {
        const changes = {};
        // Yeni objede bulunan ve eski objeden farklı olan tüm alanları bul
        if (newData && typeof newData === 'object') {
            Object.keys(newData).forEach(key => {
                // Eski objede alan yoksa veya değer farklıysa
                if (!oldData ||
                    typeof oldData !== 'object' ||
                    !Object.prototype.hasOwnProperty.call(oldData, key) ||
                    !this.isEqual(oldData[key], newData[key])) {
                    changes[key] = {
                        old: oldData === null || oldData === void 0 ? void 0 : oldData[key],
                        new: newData[key]
                    };
                }
            });
        }
        // Eski objede olup yeni objede olmayan alanları bul
        if (oldData && typeof oldData === 'object') {
            Object.keys(oldData).forEach(key => {
                if (!newData ||
                    typeof newData !== 'object' ||
                    !Object.prototype.hasOwnProperty.call(newData, key)) {
                    changes[key] = {
                        old: oldData[key],
                        new: undefined
                    };
                }
            });
        }
        return changes;
    }
    /**
     * İki değerin eşit olup olmadığını kontrol eder
     * @private
     */
    isEqual(val1, val2) {
        // İki değer de null veya undefined ise eşittir
        if (val1 == null && val2 == null) {
            return true;
        }
        // Değerlerden sadece biri null veya undefined ise eşit değildir
        if (val1 == null || val2 == null) {
            return false;
        }
        // İki değer de tarih ise
        if (val1 instanceof Date && val2 instanceof Date) {
            return val1.getTime() === val2.getTime();
        }
        // İki değer de ObjectId ise
        if ((val1 instanceof mongoose_1.default.Types.ObjectId || typeof val1 === 'string') &&
            (val2 instanceof mongoose_1.default.Types.ObjectId || typeof val2 === 'string')) {
            const id1 = val1.toString();
            const id2 = val2.toString();
            return id1 === id2;
        }
        // İki değer de array ise
        if (Array.isArray(val1) && Array.isArray(val2)) {
            // Uzunluklar farklıysa eşit değildir
            if (val1.length !== val2.length) {
                return false;
            }
            // Her elemanı karşılaştır
            for (let i = 0; i < val1.length; i++) {
                if (!this.isEqual(val1[i], val2[i])) {
                    return false;
                }
            }
            return true;
        }
        // İki değer de obje ise
        if (typeof val1 === 'object' &&
            typeof val2 === 'object' &&
            !Array.isArray(val1) &&
            !Array.isArray(val2)) {
            const keys1 = Object.keys(val1);
            const keys2 = Object.keys(val2);
            // Anahtar sayıları farklıysa eşit değildir
            if (keys1.length !== keys2.length) {
                return false;
            }
            // Her anahtarı karşılaştır
            for (const key of keys1) {
                if (!Object.prototype.hasOwnProperty.call(val2, key) || !this.isEqual(val1[key], val2[key])) {
                    return false;
                }
            }
            return true;
        }
        // Diğer durumlarda basit karşılaştırma yap
        return val1 === val2;
    }
}
exports.default = new HistoryService();
