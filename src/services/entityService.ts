import Entity, { IEntity, EntityType } from '../models/Entity';
import mongoose from 'mongoose';

class EntityService {
  /**
   * Entity kaydı oluştur veya güncelle
   */
  async upsertEntity(
    entityId: string | mongoose.Types.ObjectId,
    entityType: EntityType,
    entityName: string,
    entityCode?: string
  ): Promise<IEntity> {
    try {
      const objectId = typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId;
      
      const entity = await Entity.findOneAndUpdate(
        { entityId: objectId, entityType },
        {
          entityName: entityName.trim(),
          entityCode: entityCode?.trim(),
          isActive: true
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      console.log(`[EntityService] Entity upserted: ${entityType}:${entityId} -> ${entityName}`);
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
      
      console.log(`[EntityService] Entity deactivated: ${entityType}:${entityId}`);
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
   * Entity adını getir (cache'li)
   */
  async getEntityName(
    entityId: string | mongoose.Types.ObjectId,
    entityType: EntityType
  ): Promise<string> {
    try {
      const entity = await this.getEntity(entityId, entityType);
      return entity?.entityName || 'Unknown Entity';
    } catch (error) {
      console.error('[EntityService] Get entity name error:', error);
      return 'Unknown Entity';
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
      console.log(`[EntityService] Entity deleted: ${entityType}:${entityId}`);
    } catch (error) {
      console.error('[EntityService] Entity deletion error:', error);
      throw error;
    }
  }
}

export default new EntityService(); 