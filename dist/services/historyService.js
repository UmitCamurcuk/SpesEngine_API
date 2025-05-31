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
class HistoryService {
    /**
     * Genel history kayıt fonksiyonu
     */
    recordHistory(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { entityId, entityType, entityName, entityCode, action, userId, previousData, newData, changes, additionalInfo, affectedEntities = [] } = params;
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
                    else {
                        // Entity service'den getir
                        finalEntityName = yield entityService_1.default.getEntityName(entityId, entityType);
                    }
                }
                // Ana entity'yi Entity tablosuna kaydet/güncelle
                yield entityService_1.default.upsertEntity(entityId, entityType, finalEntityName, entityCode);
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
                        affectedEntityName = yield entityService_1.default.getEntityName(affected.entityId, affected.entityType);
                    }
                    // İlişkili entity'yi de Entity tablosuna kaydet
                    yield entityService_1.default.upsertEntity(affected.entityId, affected.entityType, affectedEntityName, affected.entityCode);
                    processedAffectedEntities.push({
                        entityId: typeof affected.entityId === 'string' ? new mongoose_1.default.Types.ObjectId(affected.entityId) : affected.entityId,
                        entityType: affected.entityType,
                        entityName: affectedEntityName,
                        role: affected.role || 'secondary'
                    });
                }
                // History kaydını oluştur
                const historyRecord = new History_1.default({
                    // Ana entity bilgisi (geriye uyumluluk)
                    entityId: typeof entityId === 'string' ? new mongoose_1.default.Types.ObjectId(entityId) : entityId,
                    entityType,
                    entityName: finalEntityName,
                    // Etkilenen entity'ler
                    affectedEntities: processedAffectedEntities,
                    // İşlem bilgisi
                    action,
                    changes: changes || {},
                    previousData: previousData || {},
                    newData: newData || {},
                    additionalInfo: additionalInfo || {},
                    createdBy: typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId
                });
                const savedHistory = yield historyRecord.save();
                console.log(`[HistoryService] History recorded: ${action} on ${entityType}:${entityId}`);
                if (affectedEntities.length > 0) {
                    console.log(`[HistoryService] Affected entities: ${affectedEntities.length}`);
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
                console.log(`[HistoryService] Deleted ${result.deletedCount} history records for entity ${entityId}`);
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
