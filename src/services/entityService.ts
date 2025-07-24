import Entity, { IEntity, EntityType } from '../models/Entity';
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

class EntityService {
  /**
   * Entity kaydı oluştur veya güncelle (sadece referans için)
   */
  async upsertEntity(
    entityId: string | mongoose.Types.ObjectId,
    entityType: EntityType,
    entityCode?: string
  ): Promise<IEntity> {
    try {
      const objectId = typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId;
      
      const entity = await Entity.findOneAndUpdate(
        { entityId: objectId, entityType },
        {
          entityCode: entityCode?.trim(),
          isActive: true
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
      return entity;
    } catch (error) {
      console.error('[EntityService] Entity upsert error:', error);
      throw error;
    }
  }

  /**
   * Entity'yi pasif yap (silme yerine)
   */
  async deactivateEntity(
    entityId: string | mongoose.Types.ObjectId,
    entityType: EntityType
  ): Promise<void> {
    try {
      const objectId = typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId;
      
      await Entity.findOneAndUpdate(
        { entityId: objectId, entityType },
        { isActive: false }
      );
      
    } catch (error) {
      console.error('[EntityService] Entity deactivation error:', error);
      throw error;
    }
  }

  /**
   * Entity bilgisini getir
   */
  async getEntity(
    entityId: string | mongoose.Types.ObjectId,
    entityType: EntityType
  ): Promise<IEntity | null> {
    try {
      const objectId = typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId;
      
      return await Entity.findOne({ entityId: objectId, entityType });
    } catch (error) {
      console.error('[EntityService] Get entity error:', error);
      return null;
    }
  }

  /**
   * Entity adını getir (önce Entity tablosundan, yoksa gerçek model'dan)
   */
  async getEntityName(
    entityId: string | mongoose.Types.ObjectId,
    entityType: EntityType
  ): Promise<string> {
    try {
      // Önce Entity tablosundan dene
      const entity = await this.getEntity(entityId, entityType);
      if (entity?.entityName && entity.entityName !== 'Unknown Entity') {
        return entity.entityName;
      }

      // Entity tablosunda yoksa gerçek model'dan getir
      const objectId = typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId;
      
      switch (entityType) {
        case EntityType.CATEGORY:
          const Category = (await import('../models/Category')).default;
          const category = await Category.findById(objectId).populate('name');
          return getEntityNameFromTranslation(category?.name) || `category_${entityId}`;
          
        case EntityType.ATTRIBUTE:
          const Attribute = (await import('../models/Attribute')).default;
          const attribute = await Attribute.findById(objectId).populate('name');
          return getEntityNameFromTranslation(attribute?.name) || `attribute_${entityId}`;
          
        case EntityType.ATTRIBUTE_GROUP:
          const AttributeGroup = (await import('../models/AttributeGroup')).default;
          const attributeGroup = await AttributeGroup.findById(objectId).populate('name');
          return getEntityNameFromTranslation(attributeGroup?.name) || `attributeGroup_${entityId}`;
          
        case EntityType.FAMILY:
          const Family = (await import('../models/Family')).default;
          const family = await Family.findById(objectId).populate('name');
          return getEntityNameFromTranslation(family?.name) || `family_${entityId}`;
          
        case EntityType.ITEM_TYPE:
          const ItemType = (await import('../models/ItemType')).default;
          const itemType = await ItemType.findById(objectId).populate('name');
          return getEntityNameFromTranslation(itemType?.name) || `itemType_${entityId}`;
          
        case EntityType.USER:
          const User = (await import('../models/User')).default;
          const user = await User.findById(objectId);
          return user?.name || user?.email || `user_${entityId}`;
          
        case EntityType.LOCALIZATION:
          // Localization için namespace:key formatında name döndür
          return `${entityType}_${entityId}`;
          
        default:
          return `${entityType}_${entityId}`;
      }
    } catch (error) {
      console.error(`[EntityService] Get entity name error for ${entityType}:${entityId}:`, error);
      return `${entityType}_${entityId}`;
    }
  }

  /**
   * Birden fazla entity'nin adlarını getir
   */
  async getEntityNames(
    entities: Array<{ entityId: string | mongoose.Types.ObjectId; entityType: EntityType }>
  ): Promise<Record<string, string>> {
    try {
      const entityIds = entities.map(e => ({
        entityId: typeof e.entityId === 'string' ? new mongoose.Types.ObjectId(e.entityId) : e.entityId,
        entityType: e.entityType
      }));

      const results = await Entity.find({
        $or: entityIds.map(e => ({ entityId: e.entityId, entityType: e.entityType }))
      });

      const nameMap: Record<string, string> = {};
      results.forEach(entity => {
        const key = `${entity.entityType}:${entity.entityId}`;
        nameMap[key] = entity.entityName;
      });

      return nameMap;
    } catch (error) {
      console.error('[EntityService] Get entity names error:', error);
      return {};
    }
  }

  /**
   * Belirli bir tip için tüm entity'leri getir
   */
  async getEntitiesByType(entityType: EntityType, isActive: boolean = true): Promise<IEntity[]> {
    try {
      return await Entity.find({ entityType, isActive }).sort({ entityName: 1 });
    } catch (error) {
      console.error('[EntityService] Get entities by type error:', error);
      return [];
    }
  }

  /**
   * Entity'yi tamamen sil (dikkatli kullan!)
   */
  async deleteEntity(
    entityId: string | mongoose.Types.ObjectId,
    entityType: EntityType
  ): Promise<void> {
    try {
      const objectId = typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId;
      
      await Entity.findOneAndDelete({ entityId: objectId, entityType });
    } catch (error) {
      console.error('[EntityService] Entity deletion error:', error);
      throw error;
    }
  }
}

export default new EntityService(); 