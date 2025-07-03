import History, { IHistory, ActionType, IAffectedEntity } from '../models/History';
import entityService from './entityService';
import { EntityType } from '../models/Entity';
import mongoose from 'mongoose';

// Translation object'inden metin çıkarmak için utility fonksiyon
const getEntityNameFromTranslation = (translationObject: any, fallback: string = 'Unknown'): string => {
  if (!translationObject) return fallback;
  
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
const calculateChanges = (previousData: any, newData: any): any => {
  const changes: any = {};
  
  if (!previousData && !newData) {
    return changes;
  }
  
  if (!previousData) {
    // Yeni oluşturma - tüm newData değerleri change olarak sayılır
    return { ...newData };
  }
  
  if (!newData) {
    // Silme - tüm previousData değerleri change olarak sayılır
    return { ...previousData };
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

interface RecordHistoryParams {
  // Ana entity bilgisi
  entityId: string | mongoose.Types.ObjectId;
  entityType: EntityType;
  entityName?: string; // Verilmezse otomatik çekilir
  entityCode?: string;
  
  // İşlem bilgisi
  action: ActionType;
  userId: string | mongoose.Types.ObjectId;
  
  // Veri bilgisi
  previousData?: any;
  newData?: any;
  changes?: any;
  additionalInfo?: any;
  comment?: string; // Kullanıcı yorumu
  
  // İlişkili entity'ler (opsiyonel)
  affectedEntities?: Array<{
    entityId: string | mongoose.Types.ObjectId;
    entityType: EntityType;
    entityName?: string;
    entityCode?: string;
    role?: 'primary' | 'secondary';
  }>;
}

class HistoryService {
  /**
   * Genel history kayıt fonksiyonu
   */
  async recordHistory(params: RecordHistoryParams): Promise<IHistory> {
    try {
      const {
        entityId,
        entityType,
        entityName,
        entityCode,
        action,
        userId,
        previousData,
        newData,
        changes,
        additionalInfo,
        comment,
        affectedEntities = []
      } = params;

      // Ana entity adını belirle
      let finalEntityName = entityName;
      if (!finalEntityName) {
        // Translation object'i varsa çevir
        if (newData?.name) {
          finalEntityName = getEntityNameFromTranslation(newData.name);
        } else if (previousData?.name) {
          finalEntityName = getEntityNameFromTranslation(previousData.name);
        }
        
        // Hala yoksa Entity service'den getir
        if (!finalEntityName || finalEntityName === 'Unknown') {
          try {
            finalEntityName = await entityService.getEntityName(entityId, entityType);
          } catch (error) {
            console.warn(`[HistoryService] Could not get entity name for ${entityType}:${entityId}`, error);
            finalEntityName = `${entityType}_${entityId}`;
          }
        }
      }

      // Ana entity'yi Entity tablosuna kaydet/güncelle
      try {
        await entityService.upsertEntity(entityId, entityType, entityCode);
      } catch (error) {
        console.warn(`[HistoryService] Could not upsert entity for ${entityType}:${entityId}`, error);
      }

      // Etkilenen entity'leri hazırla
      const processedAffectedEntities: IAffectedEntity[] = [];
      
      // Ana entity'yi ekle
      processedAffectedEntities.push({
        entityId: typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId,
        entityType,
        entityName: finalEntityName,
        role: 'primary'
      });

      // İlişkili entity'leri işle
      for (const affected of affectedEntities) {
        let affectedEntityName = affected.entityName;
        if (!affectedEntityName) {
          try {
            affectedEntityName = await entityService.getEntityName(affected.entityId, affected.entityType);
          } catch (error) {
            console.warn(`[HistoryService] Could not get affected entity name for ${affected.entityType}:${affected.entityId}`, error);
            affectedEntityName = `${affected.entityType}_${affected.entityId}`;
          }
        }

        // İlişkili entity'yi de Entity tablosuna kaydet
        try {
          await entityService.upsertEntity(
            affected.entityId,
            affected.entityType,
            affected.entityCode
          );
        } catch (error) {
          console.warn(`[HistoryService] Could not upsert affected entity for ${affected.entityType}:${affected.entityId}`, error);
        }

        processedAffectedEntities.push({
          entityId: typeof affected.entityId === 'string' ? new mongoose.Types.ObjectId(affected.entityId) : affected.entityId,
          entityType: affected.entityType,
          entityName: affectedEntityName,
          role: affected.role || 'secondary'
        });
      }

      // Changes'i hesapla (eğer verilmemişse)
      const finalChanges = changes || calculateChanges(previousData, newData);

      // History kaydını oluştur
      const historyRecord = new History({
        // Ana entity bilgisi (geriye uyumluluk)
        entityId: typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId,
        entityType,
        
        // Etkilenen entity'ler
        affectedEntities: processedAffectedEntities,
        
        // İşlem bilgisi
        action,
        changes: finalChanges,
        // CREATE işlemlerde previousData ekleme
        previousData: action === ActionType.CREATE ? {} : (previousData || {}),
        newData: newData || {},
        additionalInfo: additionalInfo || {},
        comment: comment || undefined,
        createdBy: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
      });

      const savedHistory = await historyRecord.save();
      
      if (affectedEntities.length > 0) {
      }
      
      return savedHistory;
    } catch (error) {
      console.error('[HistoryService] Record history error:', error);
      throw error;
    }
  }

  /**
   * Genel history kayıtlarını getir (tüm entity'ler için)
   */
  async getAllHistory(
    entityType?: EntityType,
    limit: number = 50,
    skip: number = 0,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ histories: IHistory[]; total: number }> {
    try {
      const query: any = {};
      
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

      const [histories, total] = await Promise.all([
        History.find(query)
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        History.countDocuments(query)
      ]);

      return { histories, total };
    } catch (error) {
      console.error('[HistoryService] Get all history error:', error);
      return { histories: [], total: 0 };
    }
  }

  /**
   * Belirli bir entity için history kayıtlarını getir
   */
  async getEntityHistory(
    entityId: string | mongoose.Types.ObjectId,
    entityType?: EntityType,
    limit: number = 50,
    skip: number = 0
  ): Promise<{ histories: IHistory[]; total: number }> {
    try {
      const objectId = typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId;
      
      // Ana entity veya etkilenen entity'ler arasında ara
      const query: any = {
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

      const [histories, total] = await Promise.all([
        History.find(query)
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        History.countDocuments(query)
      ]);

      return { histories, total };
    } catch (error) {
      console.error('[HistoryService] Get entity history error:', error);
      return { histories: [], total: 0 };
    }
  }

  /**
   * İlişki değişikliği için özel history kaydı
   */
  async recordRelationshipChange(params: {
    primaryEntityId: string | mongoose.Types.ObjectId;
    primaryEntityType: EntityType;
    primaryEntityName?: string;
    
    secondaryEntityId: string | mongoose.Types.ObjectId;
    secondaryEntityType: EntityType;
    secondaryEntityName?: string;
    
    action: 'add' | 'remove';
    relationshipType: string;
    userId: string | mongoose.Types.ObjectId;
    additionalInfo?: any;
  }): Promise<IHistory[]> {
    try {
      const {
        primaryEntityId,
        primaryEntityType,
        primaryEntityName,
        secondaryEntityId,
        secondaryEntityType,
        secondaryEntityName,
        action,
        relationshipType,
        userId,
        additionalInfo
      } = params;

      // Her iki entity için de history kaydı oluştur
      const historyAction = action === 'add' ? ActionType.RELATIONSHIP_ADD : ActionType.RELATIONSHIP_REMOVE;
      
      const histories: IHistory[] = [];

      // Primary entity için history
      const primaryHistory = await this.recordHistory({
        entityId: primaryEntityId,
        entityType: primaryEntityType,
        entityName: primaryEntityName,
        action: historyAction,
        userId,
        additionalInfo: {
          relationshipType,
          action,
          relatedEntity: {
            id: secondaryEntityId,
            type: secondaryEntityType,
            name: secondaryEntityName
          },
          ...additionalInfo
        },
        affectedEntities: [{
          entityId: secondaryEntityId,
          entityType: secondaryEntityType,
          entityName: secondaryEntityName,
          role: 'secondary'
        }]
      });
      histories.push(primaryHistory);

      // Secondary entity için history
      const secondaryHistory = await this.recordHistory({
        entityId: secondaryEntityId,
        entityType: secondaryEntityType,
        entityName: secondaryEntityName,
        action: historyAction,
        userId,
        additionalInfo: {
          relationshipType,
          action,
          relatedEntity: {
            id: primaryEntityId,
            type: primaryEntityType,
            name: primaryEntityName
          },
          ...additionalInfo
        },
        affectedEntities: [{
          entityId: primaryEntityId,
          entityType: primaryEntityType,
          entityName: primaryEntityName,
          role: 'secondary'
        }]
      });
      histories.push(secondaryHistory);

      return histories;
    } catch (error) {
      console.error('[HistoryService] Record relationship change error:', error);
      throw error;
    }
  }

  /**
   * Entity'nin tüm history kayıtlarını sil
   */
  async deleteEntityHistory(entityId: string | mongoose.Types.ObjectId): Promise<number> {
    try {
      const objectId = typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId;
      
      const result = await History.deleteMany({
        $or: [
          { entityId: objectId },
          { 'affectedEntities.entityId': objectId }
        ]
      });
      
      return result.deletedCount || 0;
    } catch (error) {
      console.error('[HistoryService] Delete entity history error:', error);
      return 0;
    }
  }

  /**
   * Belirli bir tarih aralığındaki history kayıtlarını getir
   */
  async getHistoryByDateRange(
    startDate: Date,
    endDate: Date,
    entityType?: EntityType,
    limit: number = 100
  ): Promise<IHistory[]> {
    try {
      const query: any = {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };

      if (entityType) {
        query.entityType = entityType;
      }

      return await History.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('[HistoryService] Get history by date range error:', error);
      return [];
    }
  }
}

export default new HistoryService(); 