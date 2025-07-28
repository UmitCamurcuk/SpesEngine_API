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
const History_1 = __importStar(require("../models/History"));
const entityService_1 = __importDefault(require("./entityService"));
const mongoose_1 = __importDefault(require("mongoose"));
// Translation object'inden metin çıkarmak için utility fonksiyon
const getEntityNameFromTranslation = (translationObject, fallback = 'Unknown') => {
    if (!translationObject)
        return fallback;
    // Eğer string ise direkt döndür
    if (typeof translationObject === 'string') {
        return translationObject;
    }
    // Translation object ise
    if (translationObject.translations) {
        // Önce Türkçe'yi dene
        if (translationObject.translations.tr) {
            return translationObject.translations.tr;
        }
        // Sonra İngilizce'yi dene
        if (translationObject.translations.en) {
            return translationObject.translations.en;
        }
        // Herhangi bir dili dene
        const firstTranslation = Object.values(translationObject.translations)[0];
        if (firstTranslation && typeof firstTranslation === 'string') {
            return firstTranslation;
        }
    }
    // Key varsa onu kullan
    if (translationObject.key) {
        return translationObject.key;
    }
    return fallback;
};
// İki obje arasındaki değişiklikleri hesaplayan fonksiyon
const calculateChanges = (previousData, newData) => {
    const changes = {};
    if (!previousData && !newData) {
        return changes;
    }
    if (!previousData) {
        // Yeni oluşturma - tüm newData değerleri change olarak sayılır
        return Object.assign({}, newData);
    }
    if (!newData) {
        // Silme - tüm previousData değerleri change olarak sayılır
        return Object.assign({}, previousData);
    }
    // Her iki data da var - farkları hesapla
    const allKeys = new Set([...Object.keys(previousData), ...Object.keys(newData)]);
    for (const key of allKeys) {
        const oldValue = previousData[key];
        const newValue = newData[key];
        // Değerler farklı ise changes'e ekle
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes[key] = {
                from: oldValue,
                to: newValue
            };
        }
    }
    return changes;
};
class HistoryService {
    /**
     * Genel history kayıt fonksiyonu
     */
    recordHistory(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { entityId, entityType, entityName, entityCode, action, userId, previousData, newData, changes, additionalInfo, comment, affectedEntities = [] } = params;
                // Ana entity adını belirle
                let finalEntityName = entityName;
                if (!finalEntityName) {
                    // Translation object'i varsa çevir
                    if (newData === null || newData === void 0 ? void 0 : newData.name) {
                        finalEntityName = getEntityNameFromTranslation(newData.name);
                    }
                    else if (previousData === null || previousData === void 0 ? void 0 : previousData.name) {
                        finalEntityName = getEntityNameFromTranslation(previousData.name);
                    }
                    // Hala yoksa Entity service'den getir
                    if (!finalEntityName || finalEntityName === 'Unknown') {
                        try {
                            finalEntityName = yield entityService_1.default.getEntityName(entityId, entityType);
                        }
                        catch (error) {
                            console.warn(`[HistoryService] Could not get entity name for ${entityType}:${entityId}`, error);
                            finalEntityName = `${entityType}_${entityId}`;
                        }
                    }
                }
                // Ana entity'yi Entity tablosuna kaydet/güncelle (sadece geçerli ObjectId'ler için)
                if (typeof entityId === 'string' && mongoose_1.default.Types.ObjectId.isValid(entityId)) {
                    try {
                        yield entityService_1.default.upsertEntity(entityId, entityType, entityCode);
                    }
                    catch (error) {
                        console.warn(`[HistoryService] Could not upsert entity for ${entityType}:${entityId}`, error);
                    }
                }
                else if (typeof entityId !== 'string') {
                    // ObjectId tipindeki entityId'ler için
                    try {
                        yield entityService_1.default.upsertEntity(entityId, entityType, entityCode);
                    }
                    catch (error) {
                        console.warn(`[HistoryService] Could not upsert entity for ${entityType}:${entityId}`, error);
                    }
                }
                // Etkilenen entity'leri hazırla
                const processedAffectedEntities = [];
                // Ana entity'yi ekle
                processedAffectedEntities.push({
                    entityId: typeof entityId === 'string' ? new mongoose_1.default.Types.ObjectId(entityId) : entityId,
                    entityType,
                    entityName: finalEntityName,
                    role: 'primary'
                });
                // İlişkili entity'leri işle
                for (const affected of affectedEntities) {
                    let affectedEntityName = affected.entityName;
                    if (!affectedEntityName) {
                        try {
                            affectedEntityName = yield entityService_1.default.getEntityName(affected.entityId, affected.entityType);
                        }
                        catch (error) {
                            console.warn(`[HistoryService] Could not get affected entity name for ${affected.entityType}:${affected.entityId}`, error);
                            affectedEntityName = `${affected.entityType}_${affected.entityId}`;
                        }
                    }
                    // Sadece geçerli ObjectId'leri processedAffectedEntities'a ekle
                    const isValidObjectId = typeof affected.entityId === 'string'
                        ? mongoose_1.default.Types.ObjectId.isValid(affected.entityId)
                        : true;
                    // İlişkili entity'yi de Entity tablosuna kaydet (sadece geçerli ObjectId'ler için)
                    if (typeof affected.entityId === 'string' && mongoose_1.default.Types.ObjectId.isValid(affected.entityId)) {
                        try {
                            yield entityService_1.default.upsertEntity(affected.entityId, affected.entityType, affected.entityCode);
                        }
                        catch (error) {
                            console.warn(`[HistoryService] Could not upsert affected entity for ${affected.entityType}:${affected.entityId}`, error);
                        }
                    }
                    else if (typeof affected.entityId !== 'string') {
                        // ObjectId tipindeki entityId'ler için
                        try {
                            yield entityService_1.default.upsertEntity(affected.entityId, affected.entityType, affected.entityCode);
                        }
                        catch (error) {
                            console.warn(`[HistoryService] Could not upsert affected entity for ${affected.entityType}:${affected.entityId}`, error);
                        }
                    }
                    // Sadece geçerli ObjectId'leri processedAffectedEntities'a ekle
                    if (isValidObjectId) {
                        processedAffectedEntities.push({
                            entityId: typeof affected.entityId === 'string' ? new mongoose_1.default.Types.ObjectId(affected.entityId) : affected.entityId,
                            entityType: affected.entityType,
                            entityName: affectedEntityName,
                            role: affected.role || 'secondary'
                        });
                    }
                }
                // Changes'i hesapla (eğer verilmemişse)
                const finalChanges = changes || calculateChanges(previousData, newData);
                // History kaydını oluştur (sadece geçerli ObjectId'ler için)
                const historyRecord = new History_1.default({
                    // Ana entity bilgisi (geriye uyumluluk)
                    entityId: typeof entityId === 'string' && mongoose_1.default.Types.ObjectId.isValid(entityId)
                        ? new mongoose_1.default.Types.ObjectId(entityId)
                        : (typeof entityId === 'string' ? null : entityId),
                    entityType,
                    // Etkilenen entity'ler
                    affectedEntities: processedAffectedEntities,
                    // İşlem bilgisi
                    action,
                    changes: finalChanges,
                    // CREATE işlemlerde previousData ekleme
                    previousData: action === History_1.ActionType.CREATE ? {} : (previousData || {}),
                    newData: newData || {},
                    additionalInfo: additionalInfo || {},
                    comment: comment || undefined,
                    createdBy: typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId
                });
                const savedHistory = yield historyRecord.save();
                if (affectedEntities.length > 0) {
                }
                return savedHistory;
            }
            catch (error) {
                console.error('[HistoryService] Record history error:', error);
                throw error;
            }
        });
    }
    /**
     * Genel history kayıtlarını getir (tüm entity'ler için)
     */
    getAllHistory(entityType_1) {
        return __awaiter(this, arguments, void 0, function* (entityType, limit = 50, skip = 0, startDate, endDate) {
            try {
                const query = {};
                if (entityType) {
                    query.entityType = entityType;
                }
                if (startDate || endDate) {
                    query.createdAt = {};
                    if (startDate) {
                        query.createdAt.$gte = startDate;
                    }
                    if (endDate) {
                        query.createdAt.$lte = endDate;
                    }
                }
                const [histories, total] = yield Promise.all([
                    History_1.default.find(query)
                        .populate('createdBy', 'name email')
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit),
                    History_1.default.countDocuments(query)
                ]);
                return { histories, total };
            }
            catch (error) {
                console.error('[HistoryService] Get all history error:', error);
                return { histories: [], total: 0 };
            }
        });
    }
    /**
     * Belirli bir entity için history kayıtlarını getir
     */
    getEntityHistory(entityId_1, entityType_1) {
        return __awaiter(this, arguments, void 0, function* (entityId, entityType, limit = 50, skip = 0) {
            try {
                const objectId = typeof entityId === 'string' ? new mongoose_1.default.Types.ObjectId(entityId) : entityId;
                // Ana entity veya etkilenen entity'ler arasında ara
                const query = {
                    $or: [
                        { entityId: objectId },
                        { 'affectedEntities.entityId': objectId }
                    ]
                };
                if (entityType) {
                    query.$or = [
                        { entityId: objectId, entityType },
                        { 'affectedEntities.entityId': objectId, 'affectedEntities.entityType': entityType }
                    ];
                }
                const [histories, total] = yield Promise.all([
                    History_1.default.find(query)
                        .populate('createdBy', 'name email')
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit),
                    History_1.default.countDocuments(query)
                ]);
                return { histories, total };
            }
            catch (error) {
                console.error('[HistoryService] Get entity history error:', error);
                return { histories: [], total: 0 };
            }
        });
    }
    /**
     * İlişki değişikliği için özel history kaydı
     */
    recordRelationshipChange(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { primaryEntityId, primaryEntityType, primaryEntityName, secondaryEntityId, secondaryEntityType, secondaryEntityName, action, relationshipType, userId, additionalInfo } = params;
                // Her iki entity için de history kaydı oluştur
                const historyAction = action === 'add' ? History_1.ActionType.RELATIONSHIP_ADD : History_1.ActionType.RELATIONSHIP_REMOVE;
                const histories = [];
                // Primary entity için history
                const primaryHistory = yield this.recordHistory({
                    entityId: primaryEntityId,
                    entityType: primaryEntityType,
                    entityName: primaryEntityName,
                    action: historyAction,
                    userId,
                    additionalInfo: Object.assign({ relationshipType,
                        action, relatedEntity: {
                            id: secondaryEntityId,
                            type: secondaryEntityType,
                            name: secondaryEntityName
                        } }, additionalInfo),
                    affectedEntities: [{
                            entityId: secondaryEntityId,
                            entityType: secondaryEntityType,
                            entityName: secondaryEntityName,
                            role: 'secondary'
                        }]
                });
                histories.push(primaryHistory);
                // Secondary entity için history
                const secondaryHistory = yield this.recordHistory({
                    entityId: secondaryEntityId,
                    entityType: secondaryEntityType,
                    entityName: secondaryEntityName,
                    action: historyAction,
                    userId,
                    additionalInfo: Object.assign({ relationshipType,
                        action, relatedEntity: {
                            id: primaryEntityId,
                            type: primaryEntityType,
                            name: primaryEntityName
                        } }, additionalInfo),
                    affectedEntities: [{
                            entityId: primaryEntityId,
                            entityType: primaryEntityType,
                            entityName: primaryEntityName,
                            role: 'secondary'
                        }]
                });
                histories.push(secondaryHistory);
                return histories;
            }
            catch (error) {
                console.error('[HistoryService] Record relationship change error:', error);
                throw error;
            }
        });
    }
    /**
     * Entity'nin tüm history kayıtlarını sil
     */
    deleteEntityHistory(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const objectId = typeof entityId === 'string' ? new mongoose_1.default.Types.ObjectId(entityId) : entityId;
                const result = yield History_1.default.deleteMany({
                    $or: [
                        { entityId: objectId },
                        { 'affectedEntities.entityId': objectId }
                    ]
                });
                return result.deletedCount || 0;
            }
            catch (error) {
                console.error('[HistoryService] Delete entity history error:', error);
                return 0;
            }
        });
    }
    /**
     * Belirli bir tarih aralığındaki history kayıtlarını getir
     */
    getHistoryByDateRange(startDate_1, endDate_1, entityType_1) {
        return __awaiter(this, arguments, void 0, function* (startDate, endDate, entityType, limit = 100) {
            try {
                const query = {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                };
                if (entityType) {
                    query.entityType = entityType;
                }
                return yield History_1.default.find(query)
                    .populate('createdBy', 'name email')
                    .sort({ createdAt: -1 })
                    .limit(limit);
            }
            catch (error) {
                console.error('[HistoryService] Get history by date range error:', error);
                return [];
            }
        });
    }
}
exports.default = new HistoryService();
