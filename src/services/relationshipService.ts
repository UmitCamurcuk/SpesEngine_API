import Relationship, { IRelationship } from '../models/Relationship';
import RelationshipType from '../models/RelationshipType';
import { NotFoundError, ValidationError } from '../utils/errors';
import mongoose from 'mongoose';

class RelationshipService {
  async create(data: Partial<IRelationship>): Promise<IRelationship> {
    // İlişki tipini kontrol et
    const relationshipType = await RelationshipType.findById(data.relationshipTypeId);
    if (!relationshipType) {
      throw new ValidationError('Geçersiz ilişki tipi');
    }
    
    // Kaynak ve hedef türlerinin izin verilen türler olduğunu kontrol et
    if (data.sourceEntityType && !relationshipType.allowedSourceTypes.includes(data.sourceEntityType)) {
      throw new ValidationError(`${data.sourceEntityType} ilişki tipi için kaynak olarak kullanılamaz`);
    }
    
    if (data.targetEntityType && !relationshipType.allowedTargetTypes.includes(data.targetEntityType)) {
      throw new ValidationError(`${data.targetEntityType} ilişki tipi için hedef olarak kullanılamaz`);
    }
    
    // İlişkiyi oluştur
    const relationship = new Relationship(data);
    return await relationship.save();
  }

  async getById(id: string): Promise<IRelationship> {
    const relationship = await Relationship.findById(id)
      .populate('relationshipTypeId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
      
    if (!relationship) {
      throw new NotFoundError('İlişki bulunamadı');
    }
    
    return relationship;
  }
  
  async getByEntity(entityId: string, entityType: string, role: 'source' | 'target' | 'any' = 'any'): Promise<IRelationship[]> {
    const query: any = { status: 'active' };
    
    if (role === 'source' || role === 'any') {
      query.sourceEntityId = new mongoose.Types.ObjectId(entityId);
      query.sourceEntityType = entityType;
    }
    
    if (role === 'target' || role === 'any') {
      if (role === 'any') {
        query.$or = [
          { sourceEntityId: new mongoose.Types.ObjectId(entityId), sourceEntityType: entityType },
          { targetEntityId: new mongoose.Types.ObjectId(entityId), targetEntityType: entityType }
        ];
        delete query.sourceEntityId;
        delete query.sourceEntityType;
      } else {
        query.targetEntityId = new mongoose.Types.ObjectId(entityId);
        query.targetEntityType = entityType;
      }
    }
    
    return await Relationship.find(query)
      .populate('relationshipTypeId')
      .sort({ priority: -1, createdAt: -1 });
  }
  
  async getByRelationshipType(relationshipTypeId: string): Promise<IRelationship[]> {
    return await Relationship.find({ 
      relationshipTypeId,
      status: 'active'
    }).sort({ priority: -1, createdAt: -1 });
  }

  async update(id: string, data: Partial<IRelationship>): Promise<IRelationship> {
    // İlişki türü değiştiyse yeniden kontrol et
    if (data.relationshipTypeId || data.sourceEntityType || data.targetEntityType) {
      const relationship = await Relationship.findById(id);
      if (!relationship) {
        throw new NotFoundError('İlişki bulunamadı');
      }
      
      const typeId = data.relationshipTypeId || relationship.relationshipTypeId;
      const sourceType = data.sourceEntityType || relationship.sourceEntityType;
      const targetType = data.targetEntityType || relationship.targetEntityType;
      
      const relationshipType = await RelationshipType.findById(typeId);
      if (!relationshipType) {
        throw new ValidationError('Geçersiz ilişki tipi');
      }
      
      if (!relationshipType.allowedSourceTypes.includes(sourceType)) {
        throw new ValidationError(`${sourceType} ilişki tipi için kaynak olarak kullanılamaz`);
      }
      
      if (!relationshipType.allowedTargetTypes.includes(targetType)) {
        throw new ValidationError(`${targetType} ilişki tipi için hedef olarak kullanılamaz`);
      }
    }
    
    const relationship = await Relationship.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!relationship) {
      throw new NotFoundError('İlişki bulunamadı');
    }
    
    return relationship;
  }

  async delete(id: string): Promise<void> {
    const result = await Relationship.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('İlişki bulunamadı');
    }
  }
  
  async changeStatus(id: string, status: 'active' | 'inactive' | 'pending' | 'archived', userId: string): Promise<IRelationship> {
    const relationship = await Relationship.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status,
          updatedBy: new mongoose.Types.ObjectId(userId) 
        } 
      },
      { new: true }
    );
    
    if (!relationship) {
      throw new NotFoundError('İlişki bulunamadı');
    }
    
    return relationship;
  }
}

export default new RelationshipService(); 