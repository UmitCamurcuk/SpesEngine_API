import RelationshipType, { IRelationshipType } from '../models/RelationshipType';
import { NotFoundError, ValidationError } from '../utils/errors';
import Localization from '../models/Localization';

class RelationshipTypeService {
  async create(data: Partial<IRelationshipType>, userId?: string): Promise<IRelationshipType> {
    // İlişki tipi kodunun benzersiz olduğunu kontrol et
    const existingType = await RelationshipType.findOne({ code: data.code });
    if (existingType) {
      throw new ValidationError(`İlişki tipi kodu '${data.code}' zaten kullanılıyor.`);
    }
    
    // CreatedBy ve updatedBy alanlarını ekle
    const relationshipTypeData = {
      ...data,
      createdBy: userId,
      updatedBy: userId
    };
    
    const relationshipType = new RelationshipType(relationshipTypeData);
    const savedType = await relationshipType.save();
    
    // Populate edilmiş veriyi döndür
    return await this.getById(String(savedType._id));
  }

  async getAll(): Promise<IRelationshipType[]> {
    const relationshipTypes = await RelationshipType.find()
      .populate('createdBy', 'firstName lastName email name')
      .populate('updatedBy', 'firstName lastName email name')
      .sort({ createdAt: -1 });

    // Name ve description localization'larını populate et
    const populatedTypes = await Promise.all(
      relationshipTypes.map(async (type) => {
        const populatedType = type.toObject();
        
        // Name localization'ını getir
        if (type.name) {
          try {
            const nameLocalization = await Localization.findById(type.name);
            if (nameLocalization) {
              populatedType.name = nameLocalization;
            }
          } catch (error) {
            console.error('Name localization error:', error);
          }
        }
        
        // Description localization'ını getir
        if (type.description) {
          try {
            const descLocalization = await Localization.findById(type.description);
            if (descLocalization) {
              populatedType.description = descLocalization;
            }
          } catch (error) {
            console.error('Description localization error:', error);
          }
        }
        
        return populatedType;
      })
    );

    return populatedTypes;
  }

  async getById(id: string): Promise<IRelationshipType> {
    const relationshipType = await RelationshipType.findById(id)
      .populate('createdBy', 'firstName lastName email name')
      .populate('updatedBy', 'firstName lastName email name');
    
    if (!relationshipType) {
      throw new NotFoundError('İlişki tipi bulunamadı');
    }

    const populatedType = relationshipType.toObject();
    
    // Name localization'ını getir
    if (relationshipType.name) {
      try {
        const nameLocalization = await Localization.findById(relationshipType.name);
        if (nameLocalization) {
          populatedType.name = nameLocalization;
        }
      } catch (error) {
        console.error('Name localization error:', error);
      }
    }
    
    // Description localization'ını getir
    if (relationshipType.description) {
      try {
        const descLocalization = await Localization.findById(relationshipType.description);
        if (descLocalization) {
          populatedType.description = descLocalization;
        }
      } catch (error) {
        console.error('Description localization error:', error);
      }
    }
    
    return populatedType;
  }

  async update(id: string, data: Partial<IRelationshipType>, userId?: string): Promise<IRelationshipType> {
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
    
    // UpdatedBy alanını ekle
    const updateData = {
      ...data,
      updatedBy: userId
    };
    
    const relationshipType = await RelationshipType.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!relationshipType) {
      throw new NotFoundError('İlişki tipi bulunamadı');
    }
    
    // Populate edilmiş veriyi döndür
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await RelationshipType.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('İlişki tipi bulunamadı');
    }
  }
}

export default new RelationshipTypeService(); 