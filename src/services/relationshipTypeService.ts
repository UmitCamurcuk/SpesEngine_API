import RelationshipType, { IRelationshipType } from '../models/RelationshipType';
import { NotFoundError, ValidationError } from '../utils/errors';

class RelationshipTypeService {
  async create(data: Partial<IRelationshipType>): Promise<IRelationshipType> {
    // İlişki tipi kodunun benzersiz olduğunu kontrol et
    const existingType = await RelationshipType.findOne({ code: data.code });
    if (existingType) {
      throw new ValidationError(`İlişki tipi kodu '${data.code}' zaten kullanılıyor.`);
    }
    
    const relationshipType = new RelationshipType(data);
    return await relationshipType.save();
  }

  async getAll(): Promise<IRelationshipType[]> {
    return await RelationshipType.find().sort({ name: 1 });
  }

  async getById(id: string): Promise<IRelationshipType> {
    const relationshipType = await RelationshipType.findById(id);
    if (!relationshipType) {
      throw new NotFoundError('İlişki tipi bulunamadı');
    }
    return relationshipType;
  }

  async update(id: string, data: Partial<IRelationshipType>): Promise<IRelationshipType> {
    // Eğer kod değiştiyse benzersizliğini kontrol et
    if (data.code) {
      const existingType = await RelationshipType.findOne({ 
        code: data.code,
        _id: { $ne: id }
      });
      if (existingType) {
        throw new ValidationError(`İlişki tipi kodu '${data.code}' zaten kullanılıyor.`);
      }
    }
    
    const relationshipType = await RelationshipType.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!relationshipType) {
      throw new NotFoundError('İlişki tipi bulunamadı');
    }
    
    return relationshipType;
  }

  async delete(id: string): Promise<void> {
    const result = await RelationshipType.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('İlişki tipi bulunamadı');
    }
  }
}

export default new RelationshipTypeService(); 